// AI Financial Analyst API Routes
// Powers both the comparison analysis panel and standalone chat
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk').default;
const supabaseService = require('../supabaseService');

// ── Anthropic Client ──
let anthropic = null;
function getClient() {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

// ── Rate Limiting ──
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(identifier) {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count++;
  return true;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ══════════════════════════════════════════════════════════════

const COMPARISON_SYSTEM_PROMPT = `You are VIFM Financial Analyst, a senior financial analyst with CFA charter-equivalent expertise, specializing in Gulf Cooperation Council (GCC) capital markets.

## Your Role
You are analyzing a financial comparison between two entities. The comparison data has been provided to you from the VIFM platform's database — these are the EXACT same numbers displayed to the user in the comparison tables. You must ONLY reference metrics that appear in the provided data. Never fabricate, estimate, or infer financial figures that are not in the data.

## Expertise Areas

### Fundamental Analysis
- Financial statement analysis (income statement, balance sheet, cash flow)
- Ratio analysis across 9 CFA categories: Profitability, Liquidity, Leverage, Efficiency, Valuation, Growth, Cash Flow, Dividend, Market
- DuPont decomposition (3-factor: Net Profit Margin × Asset Turnover × Equity Multiplier = ROE)
- Quality of earnings assessment
- Working capital management analysis

### Valuation & Risk
- Relative valuation (P/E, P/B, EV/EBITDA comparisons with sector context)
- Risk assessment: credit risk (interest coverage, debt ratios), liquidity risk, operational leverage
- Country risk factors specific to GCC markets

### GCC Market Expertise
- GCC regulatory frameworks (CMA Saudi, SCA UAE, CMA Kuwait, QFMA Qatar, CBB Bahrain, CMA Oman)
- Oil price sensitivity — energy sector dynamics in GCC economies
- Saudi Vision 2030 and economic diversification
- Sharia-compliant finance (Islamic banking, sukuk, Sharia screening criteria)
- GCC currency pegs (SAR, AED, QAR, BHD, OMR pegged to USD; KWD basket peg)
- Zakat implications for investors (2.5% on eligible assets)

## Response Structure
When analyzing a comparison, structure your response as:

1. **Executive Summary** — 2-3 sentence high-level comparison verdict
2. **Key Metrics Analysis** — For each metric category that has data, interpret what the numbers mean in context. Which entity is stronger and why?
3. **Strengths & Weaknesses** — Bullet points for each entity
4. **Risk Factors** — What risks should an investor consider for each entity?
5. **Conclusion** — Overall assessment with nuanced perspective

## Critical Rules
1. ONLY cite numbers that appear in the provided comparison data — never make up values
2. When a metric is null/unavailable, acknowledge it: "Data not available for this metric"
3. Provide context for every ratio — e.g., "A P/E of 15 is below the GCC energy sector average of ~18, suggesting relative undervaluation"
4. Use GCC-appropriate currency formatting (SAR, AED, KWD, QAR, BHD, OMR)
5. Keep analysis focused and practical — avoid academic jargon without explanation
6. Use markdown formatting: **bold** for emphasis, tables for side-by-side comparisons, bullet lists for clarity

## Disclaimer
Always end your analysis with:
> *This analysis is for educational and informational purposes only. It does not constitute investment advice. Past performance is not indicative of future results.*`;

const CHAT_SYSTEM_PROMPT = `You are VIFM Financial Analyst, an expert AI assistant specializing in Gulf Cooperation Council (GCC) capital markets and CFA-level financial analysis. You work within the VIFM GCC Financial Analysis Platform, which covers 820+ publicly listed companies across 6 GCC countries.

## Your Identity
- You are a senior financial analyst with CFA charter-equivalent expertise
- You specialize in GCC markets: Saudi Arabia (Tadawul), UAE (ADX, DFM), Kuwait (Boursa Kuwait), Qatar (QSE), Bahrain (BHB), Oman (MSM)
- You provide rigorous, data-driven analysis while being accessible to both novice and expert investors
- You always cite specific numbers and metrics when data is available
- You use tools to fetch real data before making claims about companies

## Expertise Areas

### Fundamental Analysis
- Financial statement analysis (income statement, balance sheet, cash flow statement)
- Ratio analysis across 9 CFA categories: Profitability, Liquidity, Leverage, Efficiency, Valuation, Growth, Cash Flow, Dividend, Market
- DuPont decomposition (3-factor and 5-factor)
- Quality of earnings assessment and revenue recognition analysis
- Working capital management

### Valuation Methodologies
- Discounted Cash Flow (DCF) with WACC estimation
- Comparable company analysis (trading multiples)
- Precedent transaction analysis
- Dividend Discount Model (DDM) — Gordon Growth and multi-stage
- Residual Income Model
- Asset-based valuation

### Risk Assessment
- Credit risk analysis (Altman Z-Score, interest coverage)
- Liquidity risk (current ratio, quick ratio, cash burn rate)
- Market risk (beta, VaR concepts, correlation analysis)
- Operational risk (operating leverage, efficiency ratios)
- Country risk — GCC-specific factors (oil dependency, political stability, regulatory environment)
- Currency risk (GCC pegged currencies)

### Industry Analysis
- Porter's Five Forces framework
- SWOT analysis
- Competitive positioning and market share analysis
- Industry lifecycle assessment

### GCC Market Expertise
- Sharia-compliant finance (Islamic banking, sukuk vs conventional bonds, Sharia screening criteria)
- GCC regulatory frameworks
- Oil price sensitivity analysis and petrochemical sector dynamics
- Saudi Vision 2030 and economic diversification initiatives
- Zakat calculation for investment portfolios (2.5% on eligible assets held for one lunar year)

### Portfolio Management
- Modern Portfolio Theory (MPT) — efficient frontier, optimal risky portfolio
- Asset allocation strategies (strategic vs tactical)
- Risk-return optimization
- Sharpe Ratio, Sortino Ratio, Treynor Ratio interpretation
- Maximum Drawdown analysis

## Response Guidelines
1. Always use tools to fetch actual data before analyzing a company — never make up financial figures
2. When analyzing companies, structure your response with clear sections
3. Present financial data in clean, readable format using markdown tables when comparing metrics
4. Provide context for every metric
5. Clearly state analysis-based perspectives are not investment advice
6. Use GCC-appropriate currency formatting (SAR, AED, KWD, QAR, BHD, OMR)
7. Flag data limitations honestly
8. Keep responses focused — use headings, bullet points, and tables

## Important Disclaimers
- Include "This analysis is for educational and informational purposes only. It does not constitute investment advice." when providing specific company analysis
- Note when data may be based on fallback values
- Acknowledge limitations of any valuation model you apply`;

// ══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS (for standalone chat mode)
// ══════════════════════════════════════════════════════════════

const CHAT_TOOLS = [
  {
    name: 'get_company_data',
    description: 'Fetch detailed company profile and financial metrics from the VIFM database. Returns company info (name, symbol, country, sector, industry, market cap) plus all available financial metrics (revenue, net income, total assets, total equity, EPS, P/E, ROE, ROA, debt-to-equity, current ratio). Use this when the user asks about a specific company.',
    input_schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name or partial name to search for (e.g. "Saudi Aramco", "Al Rajhi")' }
      },
      required: ['company_name']
    }
  },
  {
    name: 'search_companies',
    description: 'Search and filter GCC companies by country, sector, industry, or search term. Returns a list of companies with basic info. Use this to find companies matching criteria.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for company name or symbol' },
        country: { type: 'string', enum: ['saudi', 'uae', 'kuwait', 'qatar', 'bahrain', 'oman'], description: 'Filter by GCC country' },
        sector: { type: 'string', description: 'Filter by sector (e.g. Financials, Energy, Materials)' }
      }
    }
  },
  {
    name: 'get_industry_data',
    description: 'Get aggregated industry-level data including average metrics, total market cap, company count, and country distribution. Use for industry analysis or benchmarking.',
    input_schema: {
      type: 'object',
      properties: {
        industry_name: { type: 'string', description: 'Industry name (e.g. Banks, Insurance, Oil & Gas)' },
        country: { type: 'string', enum: ['saudi', 'uae', 'kuwait', 'qatar', 'bahrain', 'oman'], description: 'Filter by country' }
      }
    }
  },
  {
    name: 'get_market_overview',
    description: 'Get overall GCC market statistics: total company count, breakdown by country and sector, total market capitalization. Use for market overview questions.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'get_market_data',
    description: 'Fetch live market data for commodities (gold, silver, WTI, Brent) and/or cryptocurrencies. Note: commodity prices may use fallback data.',
    input_schema: {
      type: 'object',
      properties: {
        asset_type: { type: 'string', enum: ['commodities', 'crypto', 'both'], description: 'Which market data to fetch' },
        crypto_ids: { type: 'array', items: { type: 'string' }, description: 'CoinGecko IDs (bitcoin, ethereum, etc.)' }
      },
      required: ['asset_type']
    }
  },
  {
    name: 'get_financial_statements',
    description: 'Retrieve detailed financial statement line items for a specific company from the Ashom database. Returns actual balance sheet, income statement, or cash flow data uploaded by the VIFM team. Use this when the user asks about specific financial figures, line items, or wants a detailed breakdown of a company\'s financials.',
    input_schema: {
      type: 'object',
      properties: {
        company_id: {
          type: 'string',
          description: 'The UUID company ID from the companies table (get this from get_company_data or search_companies results)'
        },
        statement_type: {
          type: 'string',
          enum: ['balance_sheet', 'income_statement', 'cash_flow'],
          description: 'Type of financial statement to retrieve'
        },
        fiscal_year: {
          type: 'number',
          description: 'Fiscal year (e.g. 2023). If omitted, returns all available years.'
        }
      },
      required: ['company_id', 'statement_type']
    }
  },
  {
    name: 'search_financial_documents',
    description: 'Search the full text of uploaded financial documents, annual reports, news announcements, and board of directors information for a specific company. Use this for qualitative context — management discussion, risk factors, strategic initiatives, board composition, news events.',
    input_schema: {
      type: 'object',
      properties: {
        company_id: {
          type: 'string',
          description: 'The UUID company ID (get this from get_company_data or search_companies results)'
        },
        query: {
          type: 'string',
          description: 'Search query — use specific financial or business terms (e.g. "liquidity risk", "dividend policy", "CEO", "strategic plan")'
        },
        document_type: {
          type: 'string',
          enum: ['annual_report', 'quarterly_report', 'news', 'board_of_directors', 'any'],
          description: 'Filter by document type. Use "any" to search all documents.'
        }
      },
      required: ['company_id', 'query']
    }
  }
];

// ══════════════════════════════════════════════════════════════
// TOOL EXECUTION (for standalone chat mode)
// ══════════════════════════════════════════════════════════════

async function executeTool(toolName, input) {
  try {
    switch (toolName) {
      case 'get_company_data': {
        const companies = await supabaseService.getAllCompanies({ search: input.company_name });
        if (!companies || companies.length === 0) return { error: `No company found matching "${input.company_name}"` };
        const company = companies[0];
        const metrics = await supabaseService.getFinancialMetrics(company.id);
        return { company, metrics: metrics || [] };
      }

      case 'search_companies': {
        const filters = {};
        if (input.search) filters.search = input.search;
        if (input.country) filters.country = input.country;
        if (input.sector) filters.sector = input.sector;
        const results = await supabaseService.getAllCompanies(filters);
        return { companies: (results || []).slice(0, 20), total: (results || []).length };
      }

      case 'get_industry_data': {
        if (input.industry_name) {
          const detail = await supabaseService.getIndustryDetail(input.industry_name);
          return detail || { error: `No data found for industry "${input.industry_name}"` };
        }
        const filters = {};
        if (input.country) filters.country = input.country;
        const industries = await supabaseService.getIndustryAggregation(filters);
        return { industries: industries || [] };
      }

      case 'get_market_overview': {
        const stats = await supabaseService.getCompanyStats();
        return stats || { error: 'Could not fetch market statistics' };
      }

      case 'get_market_data': {
        const PORT = process.env.PORT || 3000;
        const results = {};

        if (input.asset_type === 'commodities' || input.asset_type === 'both') {
          try {
            const fetch = (await import('node-fetch')).default;
            const resp = await fetch(`http://localhost:${PORT}/api/commodities/yahoo`);
            results.commodities = await resp.json();
          } catch (e) {
            results.commodities = { error: 'Failed to fetch commodities', fallback: true };
          }
        }

        if (input.asset_type === 'crypto' || input.asset_type === 'both') {
          try {
            const fetch = (await import('node-fetch')).default;
            const ids = (input.crypto_ids || ['bitcoin', 'ethereum']).join(',');
            const resp = await fetch(`http://localhost:${PORT}/api/coingecko/crypto?ids=${ids}`);
            results.crypto = await resp.json();
          } catch (e) {
            results.crypto = { error: 'Failed to fetch crypto data' };
          }
        }

        return results;
      }

      case 'get_financial_statements': {
        const { company_id, statement_type, fiscal_year } = input;

        // Get available years first
        const availableYears = await supabaseService.getAvailableStatementYears(company_id);
        const yearsForType = availableYears
          .filter(y => y.statement_type === statement_type)
          .map(y => y.fiscal_year);

        if (yearsForType.length === 0) {
          return {
            available: false,
            message: `No ${statement_type.replace('_', ' ')} data has been uploaded for this company yet.`,
            suggestion: 'Financial data needs to be uploaded via the admin interface.'
          };
        }

        // Use requested year or latest available
        const targetYear = fiscal_year || Math.max(...yearsForType);

        const statements = await supabaseService.getFinancialStatements(
          company_id,
          statement_type,
          targetYear
        );

        if (!statements || statements.length === 0) {
          return {
            available: false,
            message: `No data found for ${statement_type} year ${targetYear}.`,
            available_years: yearsForType
          };
        }

        // Group by category for better readability
        const grouped = {};
        statements.forEach(s => {
          const cat = s.category || 'General';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({
            line_item:        s.line_item,
            value:            s.value,
            value_prior_year: s.value_prior_year,
            is_total:         s.is_total,
            currency:         s.currency,
            unit:             s.unit
          });
        });

        return {
          available:      true,
          company_id,
          statement_type,
          fiscal_year:    targetYear,
          available_years: yearsForType,
          currency:       statements[0]?.currency || 'SAR',
          unit:           statements[0]?.unit || 'thousands',
          line_items:     grouped,
          total_lines:    statements.length
        };
      }

      case 'search_financial_documents': {
        const { company_id, query, document_type = 'any' } = input;

        let results;

        if (document_type && document_type !== 'any') {
          results = await supabaseService.searchDocumentChunksByType(
            company_id,
            document_type,
            10
          );
          // If type-specific search returns nothing, fall back to text search
          if (!results || results.length === 0) {
            results = await supabaseService.searchDocumentChunks(company_id, query, 8);
          }
        } else {
          results = await supabaseService.searchDocumentChunks(company_id, query, 8);
        }

        if (!results || results.length === 0) {
          return {
            found: false,
            message: `No documents found matching "${query}" for this company.`,
            suggestion: 'Documents may not have been uploaded yet, or try different search terms.'
          };
        }

        return {
          found:   true,
          query,
          results: results.map(r => ({
            text:          r.chunk_text,
            document_type: r.metadata?.document_type || document_type,
            fiscal_year:   r.metadata?.fiscal_year || null,
            source:        r.metadata?.source || 'document'
          })),
          total_results: results.length
        };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`Tool execution error (${toolName}):`, err.message);
    return { error: `Failed to execute ${toolName}: ${err.message}` };
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/analyst/analyze — Comparison Analysis (SSE streaming)
// Used by the Comparison Results page
// ══════════════════════════════════════════════════════════════

router.post('/analyze', async (req, res) => {
  const client = getClient();
  if (!client) {
    return res.status(503).json({ success: false, error: 'AI Analyst is not configured. Please add ANTHROPIC_API_KEY to your .env file.' });
  }

  // Rate limit
  const identifier = req.ip || 'anonymous';
  if (!checkRateLimit(identifier)) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment before trying again.' });
  }

  const { comparisonData, question, history } = req.body;

  if (!comparisonData) {
    return res.status(400).json({ success: false, error: 'Comparison data is required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    // Build the user message with comparison data
    const dataContext = formatComparisonDataForAI(comparisonData);
    const userMessage = question
      ? `Here is the comparison data from the VIFM platform:\n\n${dataContext}\n\nUser question: ${question}`
      : `Here is a financial comparison from the VIFM platform. Please provide a comprehensive expert analysis:\n\n${dataContext}`;

    // Build messages array
    const messages = [];
    if (history && history.length > 0) {
      // Include previous conversation (max 10 exchanges)
      const recentHistory = history.slice(-20);
      messages.push(...recentHistory);
    }
    messages.push({ role: 'user', content: userMessage });

    // Stream from Claude
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: COMPARISON_SYSTEM_PROMPT,
      messages: messages
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        sendEvent('text', { content: event.delta.text });
      }
    }

    sendEvent('done', {});
    res.end();

  } catch (error) {
    console.error('Analyst analyze error:', error.message);
    sendEvent('error', { message: error.message || 'Analysis failed' });
    res.end();
  }
});

// ══════════════════════════════════════════════════════════════
// POST /api/analyst/chat — Standalone Chat (SSE streaming with tools)
// Used by the standalone 25_Financial_Analyst.html page
// ══════════════════════════════════════════════════════════════

router.post('/chat', async (req, res) => {
  const client = getClient();
  if (!client) {
    return res.status(503).json({ success: false, error: 'AI Analyst is not configured. Please add ANTHROPIC_API_KEY to your .env file.' });
  }

  const identifier = req.ip || 'anonymous';
  if (!checkRateLimit(identifier)) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' });
  }

  const { message, history, portfolioData } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    // Build messages from history
    const messages = [];
    if (history && history.length > 0) {
      const recentHistory = history.slice(-20);
      messages.push(...recentHistory);
    }

    // If portfolio data is provided, include it in context
    let userContent = message;
    if (portfolioData && portfolioData.portfolios && portfolioData.portfolios.length > 0) {
      userContent = `[User's portfolio data is available: ${JSON.stringify(portfolioData).substring(0, 2000)}]\n\n${message}`;
    }

    messages.push({ role: 'user', content: userContent });

    // Agentic tool-use loop
    let currentMessages = [...messages];
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (loopCount < MAX_LOOPS) {
      loopCount++;

      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: CHAT_SYSTEM_PROMPT,
        messages: currentMessages,
        tools: CHAT_TOOLS
      });

      const finalMessage = await stream.finalMessage();

      // Stream text content
      for (const block of finalMessage.content) {
        if (block.type === 'text') {
          sendEvent('text', { content: block.text });
        }
      }

      // Check for tool use
      const toolBlocks = finalMessage.content.filter(b => b.type === 'tool_use');

      if (toolBlocks.length === 0) {
        break; // No tools needed, done
      }

      // Execute tools
      currentMessages.push({ role: 'assistant', content: finalMessage.content });

      const toolResults = [];
      for (const toolBlock of toolBlocks) {
        sendEvent('tool_start', { tool: toolBlock.name });
        const result = await executeTool(toolBlock.name, toolBlock.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result).substring(0, 10000) // Limit tool result size
        });
        sendEvent('tool_complete', { tool: toolBlock.name });
      }

      currentMessages.push({ role: 'user', content: toolResults });
    }

    sendEvent('done', {});
    res.end();

  } catch (error) {
    console.error('Analyst chat error:', error.message);
    sendEvent('error', { message: error.message || 'Chat failed' });
    res.end();
  }
});

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

// Format comparison data as human-readable text for Claude
function formatComparisonDataForAI(data) {
  if (!data || !data.entities || data.entities.length < 2) {
    return 'No comparison data available.';
  }

  const [e1, e2] = data.entities;
  let text = `## Comparison Type: ${data.comparisonType || 'company-company'}\n\n`;

  // Entity info
  text += `### Entity 1: ${e1.name}\n`;
  text += `- Type: ${e1.type || 'company'}\n`;
  if (e1.ticker) text += `- Ticker: ${e1.ticker}\n`;
  if (e1.country) text += `- Country: ${e1.country}\n`;
  if (e1.sector) text += `- Sector: ${e1.sector}\n`;
  if (e1.industry) text += `- Industry: ${e1.industry}\n`;
  if (e1.market_cap) text += `- Market Cap: ${formatLargeNumber(e1.market_cap)}\n`;
  if (e1.label) text += `- Note: ${e1.label}\n`;
  text += '\n';

  text += `### Entity 2: ${e2.name}\n`;
  text += `- Type: ${e2.type || 'company'}\n`;
  if (e2.ticker) text += `- Ticker: ${e2.ticker}\n`;
  if (e2.country) text += `- Country: ${e2.country}\n`;
  if (e2.sector) text += `- Sector: ${e2.sector}\n`;
  if (e2.industry) text += `- Industry: ${e2.industry}\n`;
  if (e2.market_cap) text += `- Market Cap: ${formatLargeNumber(e2.market_cap)}\n`;
  if (e2.label) text += `- Note: ${e2.label}\n`;
  text += '\n';

  // Metrics comparison
  const categories = data.selectedMetrics || Object.keys(e1.metrics || {});
  const categoryMapping = {
    'Profitability': 'profitability', 'Liquidity': 'liquidity', 'Leverage': 'leverage',
    'Efficiency': 'efficiency', 'Valuation': 'valuation', 'Growth': 'growth',
    'Cash Flow': 'cashflow', 'Dividend': 'dividend', 'Market': 'market'
  };

  const metricLabels = {
    roe: 'ROE', roa: 'ROA', net_profit_margin: 'Net Profit Margin',
    operating_margin: 'Operating Margin', gross_margin: 'Gross Margin', ebitda_margin: 'EBITDA Margin',
    current_ratio: 'Current Ratio', quick_ratio: 'Quick Ratio', cash_ratio: 'Cash Ratio',
    debt_to_equity: 'Debt-to-Equity', debt_to_assets: 'Debt-to-Assets',
    interest_coverage: 'Interest Coverage', equity_multiplier: 'Equity Multiplier',
    asset_turnover: 'Asset Turnover', inventory_turnover: 'Inventory Turnover',
    receivables_turnover: 'Receivables Turnover',
    pe_ratio: 'P/E Ratio', pb_ratio: 'P/B Ratio', ev_ebitda: 'EV/EBITDA', ps_ratio: 'P/S Ratio',
    revenue_growth: 'Revenue Growth', earnings_growth: 'Earnings Growth',
    eps_growth: 'EPS Growth', book_value_growth: 'Book Value Growth',
    operating_cash_flow: 'Operating Cash Flow', free_cash_flow: 'Free Cash Flow',
    cash_flow_margin: 'Cash Flow Margin', fcf_per_share: 'FCF per Share',
    dividend_yield: 'Dividend Yield', payout_ratio: 'Payout Ratio', dividend_per_share: 'Dividend per Share',
    market_cap: 'Market Cap', beta: 'Beta', eps: 'EPS', shares_outstanding: 'Shares Outstanding',
    revenue: 'Revenue', net_income: 'Net Income', total_assets: 'Total Assets', total_equity: 'Total Equity'
  };

  // Get all category keys to iterate
  const allCategoryKeys = new Set();
  categories.forEach(cat => {
    const key = categoryMapping[cat] || cat;
    allCategoryKeys.add(key);
  });

  // If selectedMetrics is empty, show all available
  if (allCategoryKeys.size === 0 && e1.metrics) {
    Object.keys(e1.metrics).forEach(k => allCategoryKeys.add(k));
  }

  allCategoryKeys.forEach(catKey => {
    const m1 = (e1.metrics || {})[catKey] || {};
    const m2 = (e2.metrics || {})[catKey] || {};
    const catName = Object.entries(categoryMapping).find(([, v]) => v === catKey)?.[0] || catKey;

    const hasData = Object.values(m1).some(v => v != null) || Object.values(m2).some(v => v != null);
    if (!hasData) return;

    text += `### ${catName}\n`;
    text += `| Metric | ${e1.name} | ${e2.name} |\n`;
    text += `|--------|-----------|----------|\n`;

    const allKeys = new Set([...Object.keys(m1), ...Object.keys(m2)]);
    allKeys.forEach(key => {
      const label = metricLabels[key] || key;
      const v1 = m1[key];
      const v2 = m2[key];
      if (v1 == null && v2 == null) return;
      text += `| ${label} | ${formatMetricValue(v1, key)} | ${formatMetricValue(v2, key)} |\n`;
    });
    text += '\n';
  });

  // Include fiscal year info
  if (e1.fiscalYear) text += `\n*${e1.name} data: Fiscal Year ${e1.fiscalYear}*\n`;
  if (e2.fiscalYear) text += `*${e2.name} data: Fiscal Year ${e2.fiscalYear}*\n`;

  if (!e1.dataAvailable) text += `\n⚠️ No financial data available for ${e1.name}\n`;
  if (!e2.dataAvailable) text += `⚠️ No financial data available for ${e2.name}\n`;

  return text;
}

function formatMetricValue(val, key) {
  if (val == null) return 'N/A';

  // Percentage metrics
  const pctMetrics = ['roe', 'roa', 'net_profit_margin', 'operating_margin', 'gross_margin', 'ebitda_margin',
    'revenue_growth', 'earnings_growth', 'eps_growth', 'book_value_growth', 'cash_flow_margin',
    'dividend_yield', 'payout_ratio'];
  if (pctMetrics.includes(key)) return val.toFixed(2) + '%';

  // Ratio metrics (show as Nx)
  const ratioMetrics = ['current_ratio', 'quick_ratio', 'cash_ratio', 'debt_to_equity', 'debt_to_assets',
    'equity_multiplier', 'asset_turnover', 'inventory_turnover', 'receivables_turnover',
    'pe_ratio', 'pb_ratio', 'ev_ebitda', 'ps_ratio', 'interest_coverage'];
  if (ratioMetrics.includes(key)) return val.toFixed(2) + 'x';

  // Large currency values
  const currencyMetrics = ['market_cap', 'revenue', 'net_income', 'total_assets', 'total_equity',
    'operating_cash_flow', 'free_cash_flow'];
  if (currencyMetrics.includes(key)) return formatLargeNumber(val);

  return val.toFixed(2);
}

function formatLargeNumber(num) {
  if (num == null) return 'N/A';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1e12) return sign + '$' + (abs / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(2) + 'K';
  return sign + '$' + abs.toFixed(2);
}

module.exports = router;
