// ================================================================
// Ashom Financial Intelligence Layer — Data Ingestion API
// File: server/routes/ingest.js
//
// Handles upload and processing of:
//   - Excel/CSV  → financial_statements (structured line items)
//   - PDF        → document_chunks (text extraction + full-text search)
//   - Word .docx → document_chunks
//   - Paste/text → document_chunks
//   - Board data → board_members
//
// All endpoints require ADMIN_PASSWORD header for security.
// ================================================================

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const XLSX    = require('xlsx');
const path    = require('path');
const fs      = require('fs');
const supabaseService = require('../supabaseService');

// ── Multer: store uploads in memory (max 20MB) ──────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|xlsx|xls|csv|docx|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Use PDF, Excel, Word, CSV, or TXT.'));
    }
  }
});

// ── Admin auth middleware ────────────────────────────────────────
function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'vifm-admin-2025';
  const provided = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (!provided || provided !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }
  next();
}

// ── Text chunker: splits text into ~500-word chunks ─────────────
function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) { // Skip tiny chunks
      chunks.push(chunk.trim());
    }
  }
  return chunks;
}

// ── Clean extracted text ─────────────────────────────────────────
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// ── Excel row → financial statement line item ────────────────────
function parseExcelToStatements(workbook, metadata) {
  const statements = [];
  const sheetNames = workbook.SheetNames;

  sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    });

    if (rows.length < 2) return;

    // Detect statement type from sheet name
    let statementType = metadata.document_type;
    const sheetLower = sheetName.toLowerCase();
    if (sheetLower.includes('balance') || sheetLower.includes('bs') || sheetLower.includes('financial position')) {
      statementType = 'balance_sheet';
    } else if (sheetLower.includes('income') || sheetLower.includes('p&l') || sheetLower.includes('profit') || sheetLower.includes('is')) {
      statementType = 'income_statement';
    } else if (sheetLower.includes('cash') || sheetLower.includes('cf')) {
      statementType = 'cash_flow';
    }

    // Find header row (first row with year-like numbers or text headers)
    let headerRowIdx = 0;
    let valueColIdx = 1;     // Current year column
    let priorColIdx = 2;     // Prior year column

    // Try to find year columns from first few rows
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const row = rows[i];
      if (!row) continue;
      for (let j = 1; j < row.length; j++) {
        const cell = row[j];
        if (cell && String(cell).match(/^20[0-9]{2}$/)) {
          headerRowIdx = i;
          valueColIdx = j;
          priorColIdx = j + 1 < row.length ? j + 1 : j;
          break;
        }
      }
    }

    // Detect current category for grouping
    let currentCategory = '';

    rows.forEach((row, idx) => {
      if (idx <= headerRowIdx || !row || !row[0]) return;

      const lineItem = String(row[0]).trim();
      if (!lineItem || lineItem.length < 2) return;

      // Skip obviously header-like rows
      if (lineItem.toLowerCase().includes('notes') && !row[valueColIdx]) return;

      const rawValue = row[valueColIdx];
      const rawPrior = row[priorColIdx];

      // Parse numeric values (handle parentheses for negatives)
      const parseNum = (v) => {
        if (v === null || v === undefined || v === '') return null;
        const str = String(v).replace(/,/g, '').trim();
        if (str === '-' || str === '—' || str === 'N/A') return null;
        // Handle parentheses as negative: (1,234) → -1234
        const negative = str.startsWith('(') && str.endsWith(')');
        const num = parseFloat(str.replace(/[()]/g, ''));
        if (isNaN(num)) return null;
        return negative ? -num : num;
      };

      const value = parseNum(rawValue);
      const valuePrior = parseNum(rawPrior);

      // Detect category rows (rows with no value = section headers)
      if (value === null && valuePrior === null && lineItem.length > 3) {
        currentCategory = lineItem;
        return;
      }

      // Detect totals
      const isTotal = lineItem.toLowerCase().startsWith('total') ||
                      lineItem.toLowerCase().startsWith('subtotal') ||
                      lineItem.toLowerCase().includes('total assets') ||
                      lineItem.toLowerCase().includes('total liabilities') ||
                      lineItem.toLowerCase().includes('total equity');

      statements.push({
        company_id:       metadata.company_id,
        statement_type:   statementType,
        fiscal_year:      metadata.fiscal_year,
        fiscal_period:    metadata.fiscal_period || 'FY',
        currency:         metadata.currency || 'SAR',
        unit:             metadata.unit || 'thousands',
        line_item:        lineItem,
        category:         currentCategory,
        value:            value,
        value_prior_year: valuePrior,
        section_order:    idx,
        is_total:         isTotal,
        is_subtotal:      lineItem.toLowerCase().startsWith('subtotal')
      });
    });
  });

  return statements.filter(s => s.line_item && (s.value !== null || s.value_prior_year !== null));
}

// ================================================================
// POST /api/ingest/upload
// Upload a file (PDF, Excel, Word, CSV)
// ================================================================
router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const {
      company_id,
      document_type,
      fiscal_year,
      fiscal_period = 'FY',
      language = 'en',
      currency = 'SAR',
      unit = 'thousands',
      uploaded_by = 'admin',
      notes = ''
    } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    if (!company_id) return res.status(400).json({ error: 'company_id is required.' });
    if (!document_type) return res.status(400).json({ error: 'document_type is required.' });

    const file = req.file;
    const ext  = path.extname(file.originalname).toLowerCase();

    // ── Step 1: Register document ────────────────────────────────
    const docMeta = {
      company_id:        company_id,
      document_type,
      fiscal_year:       fiscal_year ? parseInt(fiscal_year) : null,
      fiscal_period,
      language,
      original_filename: file.originalname,
      file_format:       ext.replace('.', ''),
      uploaded_by,
      notes
    };

    const document = await supabaseService.storeFinancialDocument(docMeta);
    const documentId = document.id;

    let structuredCount = 0;
    let chunkCount      = 0;

    // ── Step 2: Process based on file type ───────────────────────

    if (ext === '.xlsx' || ext === '.xls') {
      // ── Excel: Extract structured financial statements ──────────
      const workbook   = XLSX.read(file.buffer, { type: 'buffer' });
      const statements = parseExcelToStatements(workbook, {
        company_id: company_id,
        document_type,
        fiscal_year: fiscal_year ? parseInt(fiscal_year) : null,
        fiscal_period,
        currency,
        unit
      });

      if (statements.length > 0) {
        await supabaseService.storeFinancialStatements(documentId, statements);
        structuredCount = statements.length;
      }

      // Also extract text for RAG context
      const textParts = [];
      workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const csv   = XLSX.utils.sheet_to_csv(sheet);
        textParts.push(`[Sheet: ${name}]\n${csv}`);
      });
      const fullText = textParts.join('\n\n');
      const chunks   = chunkText(cleanText(fullText));

      if (chunks.length > 0) {
        await supabaseService.storeDocumentChunks(company_id, documentId, chunks, {
          source: 'excel',
          fiscal_year,
          document_type
        });
        chunkCount = chunks.length;
      }

    } else if (ext === '.pdf') {
      // ── PDF: Extract text via pdf-parse ─────────────────────────
      let pdfParse;
      try {
        pdfParse = require('pdf-parse');
      } catch (e) {
        return res.status(500).json({ error: 'pdf-parse not installed. Run: npm install pdf-parse' });
      }
      const data      = await pdfParse(file.buffer);
      const cleanedText = cleanText(data.text);
      const chunks    = chunkText(cleanedText);

      if (chunks.length > 0) {
        await supabaseService.storeDocumentChunks(company_id, documentId, chunks, {
          source: 'pdf',
          pages:  data.numpages,
          fiscal_year,
          document_type
        });
        chunkCount = chunks.length;
      }

    } else if (ext === '.docx') {
      // ── Word: Extract text via mammoth ───────────────────────────
      let mammoth;
      try {
        mammoth = require('mammoth');
      } catch (e) {
        return res.status(500).json({ error: 'mammoth not installed. Run: npm install mammoth' });
      }
      const result    = await mammoth.extractRawText({ buffer: file.buffer });
      const cleanedText = cleanText(result.value);
      const chunks    = chunkText(cleanedText);

      if (chunks.length > 0) {
        await supabaseService.storeDocumentChunks(company_id, documentId, chunks, {
          source: 'docx',
          fiscal_year,
          document_type
        });
        chunkCount = chunks.length;
      }

    } else if (ext === '.csv') {
      // ── CSV: Try as financial statements first ────────────────────
      const workbook   = XLSX.read(file.buffer, { type: 'buffer' });
      const statements = parseExcelToStatements(workbook, {
        company_id: company_id,
        document_type,
        fiscal_year: fiscal_year ? parseInt(fiscal_year) : null,
        fiscal_period,
        currency,
        unit
      });

      if (statements.length > 0) {
        await supabaseService.storeFinancialStatements(documentId, statements);
        structuredCount = statements.length;
      }

    } else if (ext === '.txt') {
      const text   = file.buffer.toString('utf-8');
      const chunks = chunkText(cleanText(text));
      if (chunks.length > 0) {
        await supabaseService.storeDocumentChunks(company_id, documentId, chunks, {
          source: 'txt',
          fiscal_year,
          document_type
        });
        chunkCount = chunks.length;
      }
    }

    // ── Step 3: Update document counts ───────────────────────────
    await supabaseService.updateDocumentCounts(documentId, chunkCount, structuredCount);

    res.json({
      success:        true,
      document_id:    documentId,
      filename:       file.originalname,
      structured_rows: structuredCount,
      chunks_stored:  chunkCount,
      message:        `✅ Processed ${file.originalname}: ${structuredCount} statement rows, ${chunkCount} text chunks stored.`
    });

  } catch (error) {
    console.error('Ingest upload error:', error);
    res.status(500).json({ error: error.message || 'Upload processing failed.' });
  }
});

// ================================================================
// POST /api/ingest/paste
// Accept pasted text (news, announcements, board info, etc.)
// ================================================================
router.post('/paste', requireAdmin, async (req, res) => {
  try {
    const {
      company_id,
      document_type,
      fiscal_year,
      fiscal_period = 'FY',
      language = 'en',
      text,
      title = '',
      uploaded_by = 'admin',
      notes = ''
    } = req.body;

    if (!company_id)     return res.status(400).json({ error: 'company_id is required.' });
    if (!document_type)  return res.status(400).json({ error: 'document_type is required.' });
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Text content is too short.' });
    }

    // Register document
    const document = await supabaseService.storeFinancialDocument({
      company_id:       company_id,
      document_type,
      fiscal_year:      fiscal_year ? parseInt(fiscal_year) : null,
      fiscal_period,
      language,
      original_filename: title || `${document_type}_paste_${Date.now()}`,
      file_format:      'paste',
      uploaded_by,
      notes
    });

    // Chunk and store
    const chunks = chunkText(cleanText(text));
    let chunkCount = 0;

    if (chunks.length > 0) {
      await supabaseService.storeDocumentChunks(company_id, document.id, chunks, {
        source: 'paste',
        title,
        fiscal_year,
        document_type
      });
      chunkCount = chunks.length;
    }

    await supabaseService.updateDocumentCounts(document.id, chunkCount, 0);

    res.json({
      success:       true,
      document_id:   document.id,
      chunks_stored: chunkCount,
      message:       `✅ Stored ${chunkCount} text chunks from pasted content.`
    });

  } catch (error) {
    console.error('Ingest paste error:', error);
    res.status(500).json({ error: error.message || 'Paste processing failed.' });
  }
});

// ================================================================
// POST /api/ingest/board
// Store board of directors data (structured JSON input)
// ================================================================
router.post('/board', requireAdmin, async (req, res) => {
  try {
    const {
      company_id,
      fiscal_year,
      members,
      uploaded_by = 'admin'
    } = req.body;

    if (!company_id) return res.status(400).json({ error: 'company_id is required.' });
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'members array is required and must not be empty.' });
    }

    // Register document
    const document = await supabaseService.storeFinancialDocument({
      company_id:       company_id,
      document_type:    'board_of_directors',
      fiscal_year:      fiscal_year ? parseInt(fiscal_year) : null,
      file_format:      'paste',
      uploaded_by
    });

    // Store members
    await supabaseService.storeBoardMembers(company_id, document.id, members, fiscal_year);

    res.json({
      success:        true,
      document_id:    document.id,
      members_stored: members.length,
      message:        `✅ Stored ${members.length} board members.`
    });

  } catch (error) {
    console.error('Ingest board error:', error);
    res.status(500).json({ error: error.message || 'Board data processing failed.' });
  }
});

// ================================================================
// GET /api/ingest/documents/:companyId
// List all documents uploaded for a company (admin view)
// ================================================================
router.get('/documents/:companyId', requireAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    const documents = await supabaseService.getDocumentsByCompany(companyId);
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// DELETE /api/ingest/documents/:documentId
// Delete a document and all its associated data
// ================================================================
router.delete('/documents/:documentId', requireAdmin, async (req, res) => {
  try {
    const { documentId } = req.params;
    await supabaseService.deleteDocument(documentId);
    res.json({ success: true, message: 'Document and all associated data deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/ingest/stats
// Admin dashboard stats
// ================================================================
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await supabaseService.getIngestStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
