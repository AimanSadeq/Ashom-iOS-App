// Supabase Service Layer
// This provides a unified interface for database operations
// Automatically falls back to SQLite if Supabase is not configured

const { supabaseAdmin, isSupabaseEnabled } = require('./supabaseClient');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite fallback
const sqliteDb = new Database(path.join(dbDir, 'vifm.db'));

class SupabaseService {
  constructor() {
    this.useSupabase = isSupabaseEnabled();
    console.log(this.useSupabase ? '✅ Using Supabase database' : '✅ Using SQLite database (fallback)');
    if (!this.useSupabase) {
      console.warn('⚠️  Financial Intelligence Layer requires Supabase. Some features disabled.');
    }
  }

  // ==================== COMPANIES ====================

  async getAllCompanies(filters = {}) {
    if (this.useSupabase) {
      let query = supabaseAdmin.from('companies').select('*');

      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,symbol.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('market_cap', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      // SQLite fallback
      let sql = 'SELECT * FROM companies WHERE 1=1';
      const params = [];

      if (filters.country) {
        sql += ' AND country = ?';
        params.push(filters.country);
      }
      if (filters.sector) {
        sql += ' AND sector = ?';
        params.push(filters.sector);
      }
      if (filters.industry) {
        sql += ' AND industry = ?';
        params.push(filters.industry);
      }
      if (filters.search) {
        sql += ' AND (name LIKE ? OR symbol LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      sql += ' ORDER BY market_cap DESC';
      return sqliteDb.prepare(sql).all(...params);
    }
  }

  async getCompanyById(id) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } else {
      return sqliteDb.prepare('SELECT * FROM companies WHERE id = ?').get(id);
    }
  }

  async getCompanyBySymbol(symbol) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (error) throw error;
      return data;
    } else {
      return sqliteDb.prepare('SELECT * FROM companies WHERE symbol = ?').get(symbol);
    }
  }

  async createCompany(companyData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const stmt = sqliteDb.prepare(`
                INSERT INTO companies (symbol, name, country, sector, industry, market_cap, currency, exchange, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

      const info = stmt.run(
        companyData.symbol,
        companyData.name,
        companyData.country,
        companyData.sector,
        companyData.industry,
        companyData.market_cap,
        companyData.currency || 'USD',
        companyData.exchange,
        companyData.description
      );

      return this.getCompanyById(info.lastInsertRowid);
    }
  }

  // ==================== FINANCIAL METRICS ====================

  async getFinancialMetrics(companyId, fiscalYear = null) {
    if (this.useSupabase) {
      let query = supabaseAdmin
        .from('financial_metrics')
        .select('*')
        .eq('company_id', companyId);

      if (fiscalYear) {
        query = query.eq('fiscal_year', fiscalYear);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let sql = 'SELECT * FROM financial_metrics WHERE company_id = ?';
      const params = [companyId];

      if (fiscalYear) {
        sql += ' AND fiscal_year = ?';
        params.push(fiscalYear);
      }

      return sqliteDb.prepare(sql).all(...params);
    }
  }

  // ==================== ANNUAL REPORTS ====================

  async getAllReports(filters = {}) {
    if (this.useSupabase) {
      let query = supabaseAdmin
        .from('annual_reports')
        .select(`
                    *,
                    companies (
                        name,
                        country,
                        sector
                    )
                `);

      if (filters.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      if (filters.fiscal_year) {
        query = query.eq('fiscal_year', filters.fiscal_year);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let sql = `
                SELECT r.*, c.name as company_name, c.country, c.sector
                FROM annual_reports r
                JOIN companies c ON r.company_id = c.id
                WHERE 1=1
            `;
      const params = [];

      if (filters.company_id) {
        sql += ' AND r.company_id = ?';
        params.push(filters.company_id);
      }
      if (filters.fiscal_year) {
        sql += ' AND r.fiscal_year = ?';
        params.push(filters.fiscal_year);
      }

      return sqliteDb.prepare(sql).all(...params);
    }
  }

  // ==================== WATCHLIST (User-specific) ====================

  async getWatchlist(userId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('watchlist')
        .select(`
                    *,
                    companies (
                        id,
                        symbol,
                        name,
                        country,
                        sector
                    )
                `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } else {
      // SQLite doesn't have user management, return all watchlist items
      return sqliteDb.prepare(`
                SELECT w.*, c.symbol, c.name, c.country, c.sector
                FROM watchlist w
                JOIN companies c ON w.company_id = c.id
            `).all();
    }
  }

  async addToWatchlist(userId, companyId, notes = null) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('watchlist')
        .insert({ user_id: userId, company_id: companyId, notes })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const stmt = sqliteDb.prepare('INSERT INTO watchlist (company_id, notes) VALUES (?, ?)');
      const info = stmt.run(companyId, notes);
      return { id: info.lastInsertRowid, company_id: companyId, notes };
    }
  }

  async removeFromWatchlist(userId, companyId) {
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) throw error;
      return { success: true };
    } else {
      sqliteDb.prepare('DELETE FROM watchlist WHERE company_id = ?').run(companyId);
      return { success: true };
    }
  }

  // ==================== STATISTICS ====================

  async getCompanyStats() {
    if (this.useSupabase) {
      // Get total companies
      const { count: total_companies, error: totalError } = await supabaseAdmin
        .from('companies')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get by country
      const { data: byCountry, error: countryError } = await supabaseAdmin
        .from('companies')
        .select('country')
        .order('country');

      if (countryError) throw countryError;

      // Aggregate country counts
      const countryMap = {};
      byCountry.forEach(row => {
        countryMap[row.country] = (countryMap[row.country] || 0) + 1;
      });
      const by_country = Object.entries(countryMap).map(([country, count]) => ({ country, count }));

      // Get by sector
      const { data: bySector, error: sectorError } = await supabaseAdmin
        .from('companies')
        .select('sector')
        .order('sector');

      if (sectorError) throw sectorError;

      // Aggregate sector counts
      const sectorMap = {};
      bySector.forEach(row => {
        sectorMap[row.sector] = (sectorMap[row.sector] || 0) + 1;
      });
      const by_sector = Object.entries(sectorMap).map(([sector, count]) => ({ sector, count }));

      // Get total market cap
      const { data: marketCapData, error: marketCapError } = await supabaseAdmin
        .from('companies')
        .select('market_cap');

      if (marketCapError) throw marketCapError;

      const total_market_cap = marketCapData.reduce((sum, row) => sum + (row.market_cap || 0), 0);

      return {
        total_companies,
        by_country,
        by_sector,
        total_market_cap
      };
    } else {
      // SQLite fallback
      const stats = {};

      // Total companies
      const { total } = sqliteDb.prepare('SELECT COUNT(*) as total FROM companies').get();
      stats.total_companies = total;

      // By country
      stats.by_country = sqliteDb.prepare(
        'SELECT country, COUNT(*) as count FROM companies GROUP BY country ORDER BY count DESC'
      ).all();

      // By sector
      stats.by_sector = sqliteDb.prepare(
        'SELECT sector, COUNT(*) as count FROM companies GROUP BY sector ORDER BY count DESC'
      ).all();

      // Total market cap
      const { total_market_cap } = sqliteDb.prepare(
        'SELECT SUM(market_cap) as total_market_cap FROM companies'
      ).get();
      stats.total_market_cap = total_market_cap;

      return stats;
    }
  }

  // ==================== INDUSTRY AGGREGATION ====================

  // Get all industries with aggregated metrics from their constituent companies
  async getIndustryAggregation(filters = {}) {
    if (this.useSupabase) {
      // Get all companies with their latest metrics
      let query = supabaseAdmin
        .from('companies')
        .select(`
          id, name, symbol, country, sector, industry, market_cap,
          financial_metrics (
            fiscal_year, revenue, net_income, total_assets, total_equity,
            roe, roa, pe_ratio, eps, debt_to_equity, current_ratio
          )
        `);

      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }

      // Exclude index entries
      query = query.neq('sector', 'Index');

      const { data, error } = await query;
      if (error) throw error;

      return this._aggregateByIndustry(data);
    } else {
      // SQLite fallback
      let sql = `
        SELECT c.id, c.name, c.symbol, c.country, c.sector, c.industry, c.market_cap,
               m.year as fiscal_year, m.revenue, m.net_income, m.total_assets,
               m.shareholders_equity as total_equity,
               m.roe, m.roa, m.pe_ratio, m.eps, m.debt_to_equity, m.current_ratio
        FROM companies c
        LEFT JOIN financial_metrics m ON c.id = m.company_id
        WHERE c.sector != 'Index'
      `;
      const params = [];

      if (filters.country) {
        sql += ' AND c.country = ?';
        params.push(filters.country);
      }
      if (filters.sector) {
        sql += ' AND c.sector = ?';
        params.push(filters.sector);
      }

      sql += ' ORDER BY c.industry, c.market_cap DESC';
      const rows = sqliteDb.prepare(sql).all(...params);

      // Reshape rows to match Supabase format for aggregation
      const companyMap = {};
      rows.forEach(row => {
        if (!companyMap[row.id]) {
          companyMap[row.id] = {
            id: row.id,
            name: row.name,
            symbol: row.symbol,
            country: row.country,
            sector: row.sector,
            industry: row.industry,
            market_cap: row.market_cap,
            financial_metrics: []
          };
        }
        if (row.fiscal_year) {
          companyMap[row.id].financial_metrics.push({
            fiscal_year: row.fiscal_year,
            revenue: row.revenue,
            net_income: row.net_income,
            total_assets: row.total_assets,
            total_equity: row.total_equity,
            roe: row.roe,
            roa: row.roa,
            pe_ratio: row.pe_ratio,
            eps: row.eps,
            debt_to_equity: row.debt_to_equity,
            current_ratio: row.current_ratio
          });
        }
      });

      return this._aggregateByIndustry(Object.values(companyMap));
    }
  }

  // Get detailed view of a specific industry with its constituent companies
  async getIndustryDetail(industryName) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select(`
          id, name, symbol, country, sector, industry, market_cap, exchange, description,
          financial_metrics (
            fiscal_year, revenue, net_income, total_assets, total_equity,
            roe, roa, pe_ratio, eps, debt_to_equity, current_ratio
          )
        `)
        .eq('industry', industryName)
        .order('market_cap', { ascending: false });

      if (error) throw error;

      const aggregated = this._aggregateByIndustry(data);
      return {
        industry: industryName,
        aggregate: aggregated[0] || null,
        companies: data
      };
    } else {
      const rows = sqliteDb.prepare(`
        SELECT c.*, m.year as fiscal_year, m.revenue, m.net_income, m.total_assets,
               m.shareholders_equity as total_equity,
               m.roe, m.roa, m.pe_ratio, m.eps, m.debt_to_equity, m.current_ratio
        FROM companies c
        LEFT JOIN financial_metrics m ON c.id = m.company_id
        WHERE c.industry = ?
        ORDER BY c.market_cap DESC
      `).all(industryName);

      // Reshape
      const companyMap = {};
      rows.forEach(row => {
        if (!companyMap[row.id]) {
          companyMap[row.id] = {
            id: row.id,
            name: row.name,
            symbol: row.symbol,
            country: row.country,
            sector: row.sector,
            industry: row.industry,
            market_cap: row.market_cap,
            exchange: row.exchange,
            description: row.description,
            financial_metrics: []
          };
        }
        if (row.fiscal_year) {
          companyMap[row.id].financial_metrics.push({
            fiscal_year: row.fiscal_year,
            revenue: row.revenue,
            net_income: row.net_income,
            total_assets: row.total_assets,
            total_equity: row.total_equity,
            roe: row.roe,
            roa: row.roa,
            pe_ratio: row.pe_ratio,
            eps: row.eps,
            debt_to_equity: row.debt_to_equity,
            current_ratio: row.current_ratio
          });
        }
      });

      const companiesList = Object.values(companyMap);
      const aggregated = this._aggregateByIndustry(companiesList);

      return {
        industry: industryName,
        aggregate: aggregated[0] || null,
        companies: companiesList
      };
    }
  }

  // Internal: aggregate companies by industry, computing averages
  _aggregateByIndustry(companiesWithMetrics) {
    const industryMap = {};

    companiesWithMetrics.forEach(company => {
      const ind = company.industry;
      if (!ind) return;

      if (!industryMap[ind]) {
        industryMap[ind] = {
          industry: ind,
          sector: company.sector,
          company_count: 0,
          total_market_cap: 0,
          countries: new Set(),
          metrics: {
            revenue: [],
            net_income: [],
            total_assets: [],
            total_equity: [],
            roe: [],
            roa: [],
            pe_ratio: [],
            debt_to_equity: [],
            current_ratio: []
          }
        };
      }

      const group = industryMap[ind];
      group.company_count++;
      group.total_market_cap += (company.market_cap || 0);
      group.countries.add(company.country);

      // Use latest year metrics
      const metrics = company.financial_metrics || [];
      const latest = metrics.sort((a, b) => (b.fiscal_year || 0) - (a.fiscal_year || 0))[0];

      if (latest) {
        if (latest.revenue) group.metrics.revenue.push(latest.revenue);
        if (latest.net_income) group.metrics.net_income.push(latest.net_income);
        if (latest.total_assets) group.metrics.total_assets.push(latest.total_assets);
        if (latest.total_equity) group.metrics.total_equity.push(latest.total_equity);
        if (latest.roe != null) group.metrics.roe.push(latest.roe);
        if (latest.roa != null) group.metrics.roa.push(latest.roa);
        if (latest.pe_ratio != null) group.metrics.pe_ratio.push(latest.pe_ratio);
        if (latest.debt_to_equity != null) group.metrics.debt_to_equity.push(latest.debt_to_equity);
        if (latest.current_ratio != null) group.metrics.current_ratio.push(latest.current_ratio);
      }
    });

    // Compute averages and format output
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const round2 = val => val != null ? Math.round(val * 100) / 100 : null;

    return Object.values(industryMap)
      .map(group => ({
        industry: group.industry,
        sector: group.sector,
        company_count: group.company_count,
        total_market_cap: group.total_market_cap,
        countries: Array.from(group.countries).sort(),
        avg_metrics: {
          revenue: round2(avg(group.metrics.revenue)),
          net_income: round2(avg(group.metrics.net_income)),
          total_assets: round2(avg(group.metrics.total_assets)),
          total_equity: round2(avg(group.metrics.total_equity)),
          roe: round2(avg(group.metrics.roe)),
          roa: round2(avg(group.metrics.roa)),
          pe_ratio: round2(avg(group.metrics.pe_ratio)),
          debt_to_equity: round2(avg(group.metrics.debt_to_equity)),
          current_ratio: round2(avg(group.metrics.current_ratio))
        }
      }))
      .sort((a, b) => b.total_market_cap - a.total_market_cap);
  }

  // ==================== COMPARISONS (User-specific) ====================

  async createComparison(userId, comparisonData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('comparisons')
        .insert({
          user_id: userId,
          ...comparisonData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const stmt = sqliteDb.prepare(`
                INSERT INTO comparisons (name, type, entities, metrics)
                VALUES (?, ?, ?, ?)
            `);

      const info = stmt.run(
        comparisonData.name,
        comparisonData.comparison_type,
        JSON.stringify(comparisonData.entities),
        JSON.stringify(comparisonData.metrics)
      );

      return { id: info.lastInsertRowid, ...comparisonData };
    }
  }

  async getComparisons(userId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('comparisons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } else {
      return sqliteDb.prepare('SELECT * FROM comparisons ORDER BY id DESC').all();
    }
  }

  // ==================== FINANCIAL DOCUMENTS ====================

  async storeFinancialDocument(metadata) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('financial_documents')
        .insert(metadata)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      throw new Error('Financial Intelligence Layer requires Supabase. Please configure SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    }
  }

  async updateDocumentCounts(documentId, chunkCount, statementCount) {
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('financial_documents')
        .update({ chunk_count: chunkCount, statement_count: statementCount })
        .eq('id', documentId);
      if (error) throw error;
    }
  }

  async getDocumentsByCompany(companyId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('financial_documents')
        .select('*, companies(name, symbol)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return [];
  }

  async deleteDocument(documentId) {
    if (this.useSupabase) {
      // Cascades to financial_statements, document_chunks, board_members (via FK)
      const { error } = await supabaseAdmin
        .from('financial_documents')
        .delete()
        .eq('id', documentId);
      if (error) throw error;
    }
  }

  // ==================== FINANCIAL STATEMENTS ====================

  async storeFinancialStatements(documentId, statements) {
    if (!this.useSupabase) throw new Error('Supabase required.');
    // Attach document_id to each statement
    const rows = statements.map(s => ({ ...s, document_id: documentId }));
    // Batch insert in chunks of 500
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabaseAdmin.from('financial_statements').insert(batch);
      if (error) throw error;
    }
  }

  async getFinancialStatements(companyId, statementType, fiscalYear) {
    if (this.useSupabase) {
      let query = supabaseAdmin
        .from('financial_statements')
        .select('*')
        .eq('company_id', companyId)
        .order('section_order', { ascending: true });

      if (statementType) query = query.eq('statement_type', statementType);
      if (fiscalYear)    query = query.eq('fiscal_year', fiscalYear);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return [];
  }

  async getAvailableStatementYears(companyId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('financial_statements')
        .select('fiscal_year, statement_type')
        .eq('company_id', companyId)
        .order('fiscal_year', { ascending: false });
      if (error) throw error;
      // Deduplicate
      const seen = new Set();
      return (data || []).filter(r => {
        const key = `${r.fiscal_year}-${r.statement_type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return [];
  }

  // ==================== DOCUMENT CHUNKS (RAG) ====================

  async storeDocumentChunks(companyId, documentId, chunks, metadata = {}) {
    if (!this.useSupabase) throw new Error('Supabase required.');
    const rows = chunks.map((chunkText, idx) => ({
      company_id:   companyId,
      document_id:  documentId,
      chunk_index:  idx,
      chunk_text:   chunkText,
      metadata:     metadata
    }));
    // Batch insert in chunks of 100
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabaseAdmin.from('document_chunks').insert(batch);
      if (error) throw error;
    }
  }

  async searchDocumentChunks(companyId, query, limit = 8) {
    if (this.useSupabase) {
      // Full-text search using PostgreSQL tsvector
      const { data, error } = await supabaseAdmin
        .from('document_chunks')
        .select('chunk_text, metadata, document_id')
        .eq('company_id', companyId)
        .textSearch('search_vector', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(limit);

      if (error) {
        // Fallback: ILIKE search if full-text fails
        const { data: fallback, error: fallbackError } = await supabaseAdmin
          .from('document_chunks')
          .select('chunk_text, metadata, document_id')
          .eq('company_id', companyId)
          .ilike('chunk_text', `%${query}%`)
          .limit(limit);
        if (fallbackError) throw fallbackError;
        return fallback;
      }
      return data;
    }
    return [];
  }

  async searchDocumentChunksByType(companyId, documentType, limit = 10) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('document_chunks')
        .select('chunk_text, metadata, document_id, financial_documents!inner(document_type, fiscal_year)')
        .eq('company_id', companyId)
        .eq('financial_documents.document_type', documentType)
        .order('chunk_index', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data;
    }
    return [];
  }

  // ==================== BOARD MEMBERS ====================

  async storeBoardMembers(companyId, documentId, members, fiscalYear) {
    if (!this.useSupabase) throw new Error('Supabase required.');
    const rows = members.map(m => ({
      company_id:            companyId,
      document_id:           documentId,
      full_name:             m.full_name || m.name,
      full_name_ar:          m.full_name_ar || m.name_ar || null,
      role:                  m.role || m.position || null,
      role_ar:               m.role_ar || null,
      is_independent:        m.is_independent ?? null,
      committee_memberships: m.committee_memberships || m.committees || null,
      nationality:           m.nationality || null,
      qualifications:        m.qualifications || null,
      appointed_date:        m.appointed_date || null,
      term_expires:          m.term_expires || null,
      is_active:             m.is_active ?? true,
      fiscal_year:           fiscalYear ? parseInt(fiscalYear) : null
    }));
    const { error } = await supabaseAdmin.from('board_members').insert(rows);
    if (error) throw error;
  }

  async getBoardMembers(companyId, fiscalYear = null) {
    if (this.useSupabase) {
      let query = supabaseAdmin
        .from('board_members')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('role', { ascending: true });
      if (fiscalYear) query = query.eq('fiscal_year', fiscalYear);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return [];
  }

  // ==================== ADMIN STATS ====================

  async getIngestStats() {
    if (this.useSupabase) {
      const [docsResult, stmtsResult, chunksResult, boardResult] = await Promise.all([
        supabaseAdmin.from('financial_documents').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('financial_statements').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('document_chunks').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('board_members').select('*', { count: 'exact', head: true })
      ]);
      return {
        total_documents:   docsResult.count || 0,
        total_statements:  stmtsResult.count || 0,
        total_chunks:      chunksResult.count || 0,
        total_board_members: boardResult.count || 0
      };
    }
    return { total_documents: 0, total_statements: 0, total_chunks: 0, total_board_members: 0 };
  }

  // ==================== UNIVERSITY PROGRAMS ====================

  // Helper: catch "table not found" errors from Supabase and return fallback
  _uniSafe(promise, fallback) {
    return promise.catch(function (err) {
      if (err && err.code === 'PGRST205') return fallback;
      throw err;
    }).then(function (result) {
      if (result && result.error && result.error.code === 'PGRST205') return fallback;
      return result;
    });
  }

  // --- Admin Users ---
  async isAdmin(email) {
    if (!email) return false;
    // Hardcoded fallback for demo/admin accounts before tables exist
    var adminEmails = ['admin@vifm.com', 'demo@vifm.com'];
    if (adminEmails.includes(email.toLowerCase())) return true;
    if (this.useSupabase) {
      try {
        const { data } = await supabaseAdmin
          .from('admin_users')
          .select('id')
          .eq('email', email.toLowerCase())
          .eq('is_active', true)
          .single();
        return !!data;
      } catch (err) {
        if (err && err.code === 'PGRST205') return adminEmails.includes(email.toLowerCase());
        return false;
      }
    }
    return false;
  }

  async getAdminUsers() {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return [];
  }

  async addAdminUser(adminData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .upsert({ email: adminData.email.toLowerCase(), full_name: adminData.full_name, role: 'admin', is_active: true }, { onConflict: 'email' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('Admin features require Supabase');
  }

  async removeAdminUser(id) {
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    throw new Error('Admin features require Supabase');
  }

  // --- University Partners ---
  async getUniversityPartners(filters = {}) {
    if (this.useSupabase) {
      try {
        let query = supabaseAdmin
          .from('university_partners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (filters.country) query = query.eq('country', filters.country);
        const { data, error } = await query;
        if (error) { if (error.code === 'PGRST205') return []; throw error; }
        return data || [];
      } catch (err) { if (err.code === 'PGRST205') return []; throw err; }
    }
    return [];
  }

  async getUniversityPartnerById(id) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('university_partners')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
    return null;
  }

  async getAllUniversityPartners() {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabaseAdmin
          .from('university_partners')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) { if (error.code === 'PGRST205') return []; throw error; }
        return data || [];
      } catch (err) { if (err.code === 'PGRST205') return []; throw err; }
    }
    return [];
  }

  async createUniversityPartner(partnerData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('university_partners')
        .insert(partnerData)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async updateUniversityPartner(id, partnerData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('university_partners')
        .update(partnerData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async deleteUniversityPartner(id) {
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('university_partners')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    throw new Error('University features require Supabase');
  }

  // --- Academic Courses ---
  async getAcademicCourses(filters = {}) {
    if (this.useSupabase) {
      try {
        let query = supabaseAdmin
          .from('academic_courses')
          .select('*, course_modules(id)')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        const { data, error } = await query;
        if (error) { if (error.code === 'PGRST205') return []; throw error; }
        return (data || []).map(c => ({
          ...c,
          module_count: c.course_modules ? c.course_modules.length : 0,
          course_modules: undefined
        }));
      } catch (err) { if (err.code === 'PGRST205') return []; throw err; }
    }
    return [];
  }

  async getAcademicCourseBySlug(slug) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabaseAdmin
          .from('academic_courses')
          .select('*, course_modules(*)')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();
        if (error) { if (error.code === 'PGRST205' || error.code === 'PGRST116') return null; throw error; }
        if (data && data.course_modules) {
          data.course_modules = data.course_modules.filter(m => m.is_active).sort((a, b) => a.sort_order - b.sort_order);
        }
        return data;
      } catch (err) { if (err.code === 'PGRST205') return null; throw err; }
    }
    return null;
  }

  async getAllAcademicCourses() {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabaseAdmin
          .from('academic_courses')
          .select('*, course_modules(id)')
          .order('sort_order', { ascending: true });
        if (error) { if (error.code === 'PGRST205') return []; throw error; }
        return (data || []).map(c => ({
          ...c,
          module_count: c.course_modules ? c.course_modules.length : 0,
          course_modules: undefined
        }));
      } catch (err) { if (err.code === 'PGRST205') return []; throw err; }
    }
    return [];
  }

  async createAcademicCourse(courseData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('academic_courses')
        .insert(courseData)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async updateAcademicCourse(id, courseData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('academic_courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async deleteAcademicCourse(id) {
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('academic_courses')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    throw new Error('University features require Supabase');
  }

  // --- Course Modules ---
  async getCourseModules(courseId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return [];
  }

  async createCourseModule(moduleData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('course_modules')
        .insert(moduleData)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async updateCourseModule(id, moduleData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('course_modules')
        .update(moduleData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async deleteCourseModule(id) {
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('course_modules')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    throw new Error('University features require Supabase');
  }

  // --- University Enrollments ---
  async createEnrollment(enrollData) {
    if (this.useSupabase) {
      try {
        // Check email domain for auto-verification
        var status = 'pending';
        if (enrollData.email && enrollData.university_id) {
          try {
            const { data: uni } = await supabaseAdmin
              .from('university_partners')
              .select('email_domain')
              .eq('id', enrollData.university_id)
              .single();
            if (uni && uni.email_domain && enrollData.email.toLowerCase().endsWith('@' + uni.email_domain.toLowerCase())) {
              status = 'verified';
              enrollData.verified_at = new Date().toISOString();
            }
          } catch (e) { /* table may not exist yet */ }
        }
        enrollData.verification_status = status;
        enrollData.email = enrollData.email.toLowerCase();

        const { data, error } = await supabaseAdmin
          .from('university_enrollments')
          .insert(enrollData)
          .select()
          .single();
        if (error) { if (error.code === 'PGRST205') return null; throw error; }
        return data;
      } catch (err) { if (err.code === 'PGRST205') return null; throw err; }
    }
    return null;
  }

  async getEnrollmentByUserId(userId) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabaseAdmin
          .from('university_enrollments')
          .select('*, university_partners(*)')
          .eq('user_id', userId)
          .order('enrolled_at', { ascending: false })
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') { if (error.code === 'PGRST205') return null; throw error; }
        return data || null;
      } catch (err) { if (err.code === 'PGRST205') return null; throw err; }
    }
    return null;
  }

  async getEnrollmentByEmail(email) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabaseAdmin
          .from('university_enrollments')
          .select('*, university_partners(*)')
          .eq('email', email.toLowerCase())
          .order('enrolled_at', { ascending: false })
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') { if (error.code === 'PGRST205') return null; throw error; }
        return data || null;
      } catch (err) { if (err.code === 'PGRST205') return null; throw err; }
    }
    return null;
  }

  async getEnrollments(filters = {}) {
    if (this.useSupabase) {
      try {
        let query = supabaseAdmin
          .from('university_enrollments')
          .select('*, university_partners(name, full_name, country)')
          .order('enrolled_at', { ascending: false });
        if (filters.status) query = query.eq('verification_status', filters.status);
        if (filters.university_id) query = query.eq('university_id', filters.university_id);
        if (filters.search) query = query.or('full_name.ilike.%' + filters.search + '%,email.ilike.%' + filters.search + '%');
        const { data, error } = await query;
        if (error) { if (error.code === 'PGRST205') return []; throw error; }
        return data || [];
      } catch (err) { if (err.code === 'PGRST205') return []; throw err; }
    }
    return [];
  }

  async updateEnrollmentStatus(id, status, adminId, notes) {
    if (this.useSupabase) {
      var updateData = { verification_status: status };
      if (status === 'verified') updateData.verified_at = new Date().toISOString();
      if (adminId) updateData.verified_by = adminId;
      if (notes !== undefined) updateData.admin_notes = notes;

      const { data, error } = await supabaseAdmin
        .from('university_enrollments')
        .update(updateData)
        .eq('id', id)
        .select('*, university_partners(name, full_name)')
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  // --- Enrollment Progress ---
  async syncProgress(enrollmentId, courseId, progressData) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('enrollment_progress')
        .upsert({
          enrollment_id: enrollmentId,
          course_id: courseId,
          steps_completed: progressData.steps_completed || [],
          current_step: progressData.current_step || 0,
          total_steps: progressData.total_steps || 0,
          percentage: progressData.percentage || 0,
          started_at: progressData.started_at || new Date().toISOString(),
          completed_at: progressData.completed_at || null,
          last_synced_at: new Date().toISOString()
        }, { onConflict: 'enrollment_id,course_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw new Error('University features require Supabase');
  }

  async getEnrollmentProgress(enrollmentId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('enrollment_progress')
        .select('*, academic_courses(name, slug, icon, accent_color)')
        .eq('enrollment_id', enrollmentId)
        .order('course_id', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return [];
  }

  // --- University Stats ---
  async getUniversityStats() {
    var empty = { total_partners: 0, total_courses: 0, total_modules: 0, total_enrollments: 0, pending_verifications: 0, verified_count: 0, enrollments_by_university: [] };
    if (this.useSupabase) {
      try {
        var safeCount = async function(table, filter) {
          try {
            var q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
            if (filter) { for (var k in filter) q = q.eq(k, filter[k]); }
            var r = await q;
            if (r.error && r.error.code === 'PGRST205') return 0;
            return r.count || 0;
          } catch (e) { return 0; }
        };

        const [tp, tc, tm, te, tp2, tv] = await Promise.all([
          safeCount('university_partners', { is_active: true }),
          safeCount('academic_courses', { is_active: true }),
          safeCount('course_modules', { is_active: true }),
          safeCount('university_enrollments'),
          safeCount('university_enrollments', { verification_status: 'pending' }),
          safeCount('university_enrollments', { verification_status: 'verified' })
        ]);

        var byUni = {};
        try {
          const { data: enrollByUni } = await supabaseAdmin
            .from('university_enrollments')
            .select('university_id, university_partners(name)');
          (enrollByUni || []).forEach(function(e) {
            var uname = e.university_partners ? e.university_partners.name : 'Unknown';
            byUni[uname] = (byUni[uname] || 0) + 1;
          });
        } catch (e) { /* table may not exist */ }

        return {
          total_partners: tp, total_courses: tc, total_modules: tm,
          total_enrollments: te, pending_verifications: tp2, verified_count: tv,
          enrollments_by_university: Object.keys(byUni).map(function(k) { return { name: k, count: byUni[k] }; })
        };
      } catch (err) { return empty; }
    }
    return empty;
  }

  // ==================== USER PREFERENCES ====================

  async getPreferences(userId) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data ? (typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences) : {};
    } else {
      this.ensureSqlitePreferencesTable();
      const row = sqliteDb.prepare('SELECT preferences FROM user_preferences WHERE user_id = ?').get(userId);
      return row ? JSON.parse(row.preferences) : {};
    }
  }

  async savePreferences(userId, preferences) {
    const prefsJson = JSON.stringify(preferences);
    if (this.useSupabase) {
      const { error } = await supabaseAdmin
        .from('user_preferences')
        .upsert({ user_id: userId, preferences, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
    } else {
      this.ensureSqlitePreferencesTable();
      sqliteDb.prepare(`
        INSERT INTO user_preferences (user_id, preferences, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET preferences = excluded.preferences, updated_at = CURRENT_TIMESTAMP
      `).run(userId, prefsJson);
    }
    return preferences;
  }

  ensureSqlitePreferencesTable() {
    sqliteDb.prepare(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        preferences TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  }

  // ==================== COMPARISONS (Extended) ====================

  // Get companies with their latest financial metrics by IDs (for comparison creation)
  async getCompaniesWithMetrics(entityIds) {
    if (!entityIds || entityIds.length === 0) return [];

    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select(`
          *,
          financial_metrics (*)
        `)
        .in('id', entityIds);

      if (error) throw error;

      // Flatten: pick latest year metrics for each company
      return (data || []).map(company => {
        const metrics = company.financial_metrics || [];
        const latest = metrics.sort((a, b) => (b.fiscal_year || 0) - (a.fiscal_year || 0))[0] || {};
        const { financial_metrics, ...companyFields } = company;
        return { ...companyFields, ...latest };
      });
    } else {
      const placeholders = entityIds.map(() => '?').join(',');
      return sqliteDb.prepare(`
        SELECT c.*, fm.*
        FROM companies c
        LEFT JOIN financial_metrics fm ON c.id = fm.company_id
          AND fm.year = (SELECT MAX(year) FROM financial_metrics WHERE company_id = c.id)
        WHERE c.id IN (${placeholders})
      `).all(...entityIds);
    }
  }

  // Get saved comparisons (no user filter, returns latest 20)
  async getSavedComparisons(limit = 20) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('comparisons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } else {
      return sqliteDb.prepare('SELECT * FROM comparisons ORDER BY created_at DESC LIMIT ?').all(limit);
    }
  }

  // ==================== REPORTS (Extended) ====================

  // Get all reports with full filter support (country, sector, year, search, limit)
  async getReportsFiltered(filters = {}) {
    if (this.useSupabase) {
      let query = supabaseAdmin
        .from('annual_reports')
        .select(`
          *,
          companies!inner (
            name,
            symbol,
            country,
            sector
          )
        `);

      if (filters.country) {
        query = query.eq('companies.country', filters.country);
      }
      if (filters.sector) {
        query = query.eq('companies.sector', filters.sector);
      }
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,companies.name.ilike.%${filters.search}%`);
      }

      query = query.order('year', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Flatten the companies join to match the SQLite response format
      return (data || []).map(report => {
        const { companies, ...reportFields } = report;
        return {
          ...reportFields,
          name: companies ? companies.name : null,
          symbol: companies ? companies.symbol : null,
          country: companies ? companies.country : null,
          sector: companies ? companies.sector : null
        };
      });
    } else {
      let sql = `
        SELECT ar.*, c.name, c.symbol, c.country, c.sector
        FROM annual_reports ar
        JOIN companies c ON ar.company_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.country) {
        sql += ' AND c.country = ?';
        params.push(filters.country);
      }
      if (filters.sector) {
        sql += ' AND c.sector = ?';
        params.push(filters.sector);
      }
      if (filters.year) {
        sql += ' AND ar.year = ?';
        params.push(filters.year);
      }
      if (filters.search) {
        sql += ' AND (c.name LIKE ? OR ar.title LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      sql += ' ORDER BY ar.year DESC, c.name';

      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      return sqliteDb.prepare(sql).all(...params);
    }
  }

  // Get a single report by ID with company details
  async getReportById(id) {
    if (this.useSupabase) {
      const { data, error } = await supabaseAdmin
        .from('annual_reports')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Flatten companies join to match SQLite format
      const { companies, ...reportFields } = data;
      return { ...reportFields, ...(companies || {}) };
    } else {
      return sqliteDb.prepare(`
        SELECT ar.*, c.*
        FROM annual_reports ar
        JOIN companies c ON ar.company_id = c.id
        WHERE ar.id = ?
      `).get(id);
    }
  }

  // ==================== SCREENER ====================

  // Screen companies with filters (countries, sectors, metric ranges)
  async screenCompanies(filters = {}) {
    if (this.useSupabase) {
      // First get companies with their latest financial metrics
      let query = supabaseAdmin
        .from('companies')
        .select(`
          *,
          financial_metrics (
            roe, pe_ratio, revenue, net_income, fiscal_year, year
          )
        `);

      if (filters.countries && filters.countries.length > 0) {
        query = query.in('country', filters.countries);
      }
      if (filters.sectors && filters.sectors.length > 0) {
        query = query.in('sector', filters.sectors);
      }

      query = query.order('market_cap', { ascending: false }).limit(200);

      const { data, error } = await query;
      if (error) throw error;

      // Flatten and filter by metric ranges
      let results = (data || []).map(company => {
        const metrics = company.financial_metrics || [];
        const latest = metrics.sort((a, b) => (b.fiscal_year || b.year || 0) - (a.fiscal_year || a.year || 0))[0] || {};
        const { financial_metrics, ...companyFields } = company;
        return {
          ...companyFields,
          roe: latest.roe || null,
          pe_ratio: latest.pe_ratio || null,
          revenue: latest.revenue || null,
          net_income: latest.net_income || null
        };
      });

      // Apply metric range filters
      if (filters.roe_min !== undefined) results = results.filter(r => r.roe != null && r.roe >= filters.roe_min);
      if (filters.roe_max !== undefined) results = results.filter(r => r.roe != null && r.roe <= filters.roe_max);
      if (filters.pe_min !== undefined) results = results.filter(r => r.pe_ratio != null && r.pe_ratio >= filters.pe_min);
      if (filters.pe_max !== undefined) results = results.filter(r => r.pe_ratio != null && r.pe_ratio <= filters.pe_max);
      if (filters.market_cap_min !== undefined) results = results.filter(r => r.market_cap != null && r.market_cap >= filters.market_cap_min);
      if (filters.market_cap_max !== undefined) results = results.filter(r => r.market_cap != null && r.market_cap <= filters.market_cap_max);

      return results.slice(0, 100);
    } else {
      let sql = `
        SELECT c.*, fm.roe, fm.pe_ratio, fm.revenue, fm.net_income
        FROM companies c
        LEFT JOIN financial_metrics fm ON c.id = fm.company_id
        WHERE fm.year = (SELECT MAX(year) FROM financial_metrics WHERE company_id = c.id)
      `;
      const params = [];

      if (filters.countries && filters.countries.length > 0) {
        sql += ` AND c.country IN (${filters.countries.map(() => '?').join(',')})`;
        params.push(...filters.countries);
      }
      if (filters.sectors && filters.sectors.length > 0) {
        sql += ` AND c.sector IN (${filters.sectors.map(() => '?').join(',')})`;
        params.push(...filters.sectors);
      }
      if (filters.roe_min !== undefined) {
        sql += ' AND fm.roe >= ?';
        params.push(filters.roe_min);
      }
      if (filters.roe_max !== undefined) {
        sql += ' AND fm.roe <= ?';
        params.push(filters.roe_max);
      }
      if (filters.pe_min !== undefined) {
        sql += ' AND fm.pe_ratio >= ?';
        params.push(filters.pe_min);
      }
      if (filters.pe_max !== undefined) {
        sql += ' AND fm.pe_ratio <= ?';
        params.push(filters.pe_max);
      }
      if (filters.market_cap_min !== undefined) {
        sql += ' AND c.market_cap >= ?';
        params.push(filters.market_cap_min);
      }
      if (filters.market_cap_max !== undefined) {
        sql += ' AND c.market_cap <= ?';
        params.push(filters.market_cap_max);
      }

      sql += ' ORDER BY c.market_cap DESC LIMIT 100';
      return sqliteDb.prepare(sql).all(...params);
    }
  }

  // Graceful shutdown
  close() {
    if (!this.useSupabase && sqliteDb) {
      sqliteDb.close();
      console.log('✅ SQLite database connection closed');
    }
  }
}

// Create singleton instance
const serviceInstance = new SupabaseService();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  serviceInstance.close();
});

process.on('SIGINT', () => {
  serviceInstance.close();
  process.exit(0);
});

// Export singleton instance
module.exports = serviceInstance;
