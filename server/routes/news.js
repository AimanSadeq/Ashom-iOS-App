// News RSS Feed Aggregation Routes
const express = require('express');
const router = express.Router();
const RSSParser = require('rss-parser');
const cheerio = require('cheerio');

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml'
  }
});

// RSS Feed Sources by Category
// GCC-focused feeds listed first (primary), international feeds supplement
// Google News RSS with GCC search queries provide reliable high-volume GCC coverage
// Dedicated GCC outlets (Gulf Business, Economy ME, etc.) add specialized depth
// CNBC feeds provide international context
const FEED_SOURCES = {
  business: [
    // GCC Primary — Google News search (when:7d for recent results)
    { url: 'https://news.google.com/rss/search?q=GCC+OR+Gulf+business+economy+when:7d&hl=en&gl=AE&ceid=AE:en', source: 'Google News', region: 'gcc' },
    { url: 'https://news.google.com/rss/search?q=Saudi+Arabia+OR+UAE+OR+Kuwait+OR+Qatar+business+when:7d&hl=en&gl=AE&ceid=AE:en', source: 'Google News', region: 'gcc' },
    // GCC Dedicated Outlets
    { url: 'https://gulfbusiness.com/feed', source: 'Gulf Business', region: 'gcc' },
    { url: 'https://gccbusinessnews.com/feed', source: 'GCC Business News', region: 'gcc' },
    { url: 'https://economymiddleeast.com/feed', source: 'Economy Middle East', region: 'gcc' },
    { url: 'https://www.arabnews.com/rss.xml', source: 'Arab News', region: 'gcc' },
    { url: 'https://www.albawaba.com/rss.xml', source: 'Al Bawaba', region: 'gcc' },
    // International Supplement
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', source: 'CNBC', region: 'intl' }
  ],
  finance: [
    // GCC Primary — Google News search
    { url: 'https://news.google.com/rss/search?q=Gulf+finance+stock+market+Tadawul+when:7d&hl=en&gl=AE&ceid=AE:en', source: 'Google News', region: 'gcc' },
    // GCC Dedicated Outlets
    { url: 'https://fintechnews.ae/feed', source: 'Fintech News', region: 'gcc' },
    { url: 'https://economymiddleeast.com/feed', source: 'Economy Middle East', region: 'gcc' },
    { url: 'https://www.investing.com/rss/news_301.rss', source: 'Investing.com ME', region: 'gcc' },
    // International Supplement
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC', region: 'intl' },
    { url: 'https://www.nasdaq.com/feed/rssoutbound?category=Middle+East', source: 'Nasdaq ME', region: 'intl' }
  ],
  technology: [
    // GCC Primary — Google News search
    { url: 'https://news.google.com/rss/search?q=UAE+OR+Saudi+technology+startup+digital+when:7d&hl=en&gl=AE&ceid=AE:en', source: 'Google News', region: 'gcc' },
    // GCC Dedicated Outlets
    { url: 'https://tahawultech.com/feed', source: 'TahawulTech', region: 'gcc' },
    { url: 'https://fintechnews.ae/feed', source: 'Fintech News', region: 'gcc' },
    { url: 'https://dubaichronicle.com/feed', source: 'Dubai Chronicle', region: 'gcc' },
    // International Supplement
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910', source: 'CNBC', region: 'intl' }
  ],
  investment: [
    // GCC Primary — Google News search
    { url: 'https://news.google.com/rss/search?q=GCC+investment+fund+IPO+Tadawul+when:7d&hl=en&gl=SA&ceid=SA:en', source: 'Google News', region: 'gcc' },
    // GCC Dedicated Outlets
    { url: 'https://gulfbusiness.com/feed', source: 'Gulf Business', region: 'gcc' },
    { url: 'https://economymiddleeast.com/feed', source: 'Economy Middle East', region: 'gcc' },
    // International Supplement
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', source: 'CNBC', region: 'intl' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000113', source: 'CNBC', region: 'intl' }
  ],
  realestate: [
    // GCC Primary — Google News search
    { url: 'https://news.google.com/rss/search?q=GCC+OR+Dubai+OR+Saudi+real+estate+property+when:7d&hl=en&gl=AE&ceid=AE:en', source: 'Google News', region: 'gcc' },
    // GCC Dedicated Outlets
    { url: 'https://gulfbusiness.com/feed', source: 'Gulf Business', region: 'gcc' },
    { url: 'https://gccbusinessnews.com/feed', source: 'GCC Business News', region: 'gcc' },
    // International Supplement
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000115', source: 'CNBC', region: 'intl' }
  ],
  banking: [
    // GCC Primary — Google News search
    { url: 'https://news.google.com/rss/search?q=GCC+OR+Gulf+banking+Islamic+finance+central+bank+when:7d&hl=en&gl=AE&ceid=AE:en', source: 'Google News', region: 'gcc' },
    // GCC Dedicated Outlets
    { url: 'https://fintechnews.ae/feed', source: 'Fintech News', region: 'gcc' },
    { url: 'https://economymiddleeast.com/feed', source: 'Economy Middle East', region: 'gcc' },
    { url: 'https://www.albawaba.com/rss.xml', source: 'Al Bawaba', region: 'gcc' },
    // International Supplement
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000170', source: 'CNBC', region: 'intl' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000116', source: 'CNBC', region: 'intl' }
  ]
};

// In-memory cache keyed by category
const cache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Parse a single RSS feed and normalize articles
 */
async function parseFeed(feedConfig, category) {
  try {
    const isGoogleNews = feedConfig.url.includes('news.google.com');
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || []).map(item => {
      let title = (item.title || '').trim();
      let source = feedConfig.source;
      let link = item.link || '';

      // Google News titles have format: "Article Title - Source Name"
      // Extract the real source and clean the title
      if (isGoogleNews && title.includes(' - ')) {
        const lastDash = title.lastIndexOf(' - ');
        source = title.substring(lastDash + 3).trim();
        title = title.substring(0, lastDash).trim();
      }

      return {
        title: title,
        description: stripHtml(item.contentSnippet || item.content || item.summary || '').substring(0, 200),
        link: link,
        source: source,
        region: feedConfig.region || 'intl',
        pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
        category: category,
        imageUrl: extractImage(item)
      };
    });
  } catch (err) {
    console.warn(`Failed to parse feed ${feedConfig.url}:`, err.message);
    return [];
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Try to extract an image URL from RSS item
 */
function extractImage(item) {
  // Check for media:content or enclosure
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  // Check for media:thumbnail
  if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    return item['media:thumbnail']['$'].url;
  }
  return null;
}

/**
 * Fetch articles for a given category (or all categories)
 */
async function fetchArticles(category) {
  const categories = category === 'all'
    ? ['business', 'finance', 'technology', 'investment', 'realestate', 'banking']
    : [category];

  const allArticles = [];
  // Track already-fetched feed URLs to avoid duplicate requests
  // (same feed may appear in multiple categories)
  const fetchedUrls = new Set();

  for (const cat of categories) {
    const feeds = FEED_SOURCES[cat] || [];
    const uniqueFeeds = feeds.filter(f => {
      if (fetchedUrls.has(f.url)) return false;
      fetchedUrls.add(f.url);
      return true;
    });
    const feedPromises = uniqueFeeds.map(feed => parseFeed(feed, cat));
    const results = await Promise.allSettled(feedPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });
  }

  // Sort by date (newest first), with GCC articles prioritized slightly
  allArticles.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    // Within same hour, prioritize GCC over international
    if (Math.abs(dateA - dateB) < 3600000) {
      if (a.region === 'gcc' && b.region !== 'gcc') return -1;
      if (b.region === 'gcc' && a.region !== 'gcc') return 1;
    }
    return dateB - dateA;
  });

  // Deduplicate by title (case-insensitive)
  const seen = new Set();
  const unique = allArticles.filter(article => {
    const key = article.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Limit results
  const limit = category === 'all' ? 200 : 40;
  return unique.slice(0, limit);
}

/**
 * @route   GET /api/news
 * @desc    Get news articles from RSS feeds
 * @query   category - 'business' | 'finance' | 'technology' | 'all' (default: 'all')
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const validCategories = ['all', 'business', 'finance', 'technology', 'investment', 'realestate', 'banking'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Check cache
    const cached = cache[category];
    if (cached && cached.timestamp > Date.now() - CACHE_DURATION) {
      console.log(`Serving news (${category}) from cache`);
      return res.json(cached.data);
    }

    console.log(`Fetching news feeds for category: ${category}`);
    const articles = await fetchArticles(category);

    const responseData = {
      success: true,
      data: { articles },
      category: category,
      count: articles.length,
      timestamp: new Date().toISOString()
    };

    // Update cache
    cache[category] = {
      data: responseData,
      timestamp: Date.now()
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching news:', error.message);

    // Try to serve expired cache
    const category = req.query.category || 'all';
    const cached = cache[category];
    if (cached) {
      console.warn('Serving expired cache due to error');
      return res.json(cached.data);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles',
      message: error.message
    });
  }
});

// Article content cache (keyed by URL, 30-min TTL)
const articleCache = {};
const ARTICLE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch and extract readable article content from a URL using Cheerio
 */
async function extractArticle(url) {
  // Check article cache
  const cached = articleCache[url];
  if (cached && cached.timestamp > Date.now() - ARTICLE_CACHE_DURATION) {
    console.log('Serving article from cache:', url);
    return cached.data;
  }

  console.log('Fetching full article:', url);

  // Use dynamic import for node-fetch (ESM module)
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article: HTTP ${response.status}`);
  }

  const html = await response.text();

  // Parse with Cheerio
  const $ = cheerio.load(html);

  // Extract title from meta or <h1>
  const title = $('meta[property="og:title"]').attr('content')
    || $('meta[name="twitter:title"]').attr('content')
    || $('h1').first().text().trim()
    || $('title').text().trim()
    || '';

  // Extract byline/author
  const byline = $('meta[name="author"]').attr('content')
    || $('meta[property="article:author"]').attr('content')
    || $('[rel="author"]').first().text().trim()
    || $('[class*="author"]').first().text().trim()
    || $('[class*="byline"]').first().text().trim()
    || '';

  // Extract site name
  const siteName = $('meta[property="og:site_name"]').attr('content') || '';

  // Extract excerpt/description
  const excerpt = $('meta[property="og:description"]').attr('content')
    || $('meta[name="description"]').attr('content')
    || '';

  // Remove unwanted elements before extracting content
  $('script, style, noscript, iframe, svg, nav, header, footer').remove();
  $('[class*="sidebar"], [class*="related"], [class*="comment"], [class*="share"], [class*="social"]').remove();
  $('[class*="newsletter"], [class*="subscribe"], [class*="promo"], [class*="ad-"], [class*="advert"]').remove();
  $('[id*="sidebar"], [id*="related"], [id*="comment"], [id*="share"], [id*="social"]').remove();
  $('[id*="newsletter"], [id*="subscribe"], [id*="ad-"], [id*="advert"]').remove();
  $('form, input, button, textarea, select').remove();

  // Try to find the main article content using common selectors
  let articleContent = '';

  const articleSelectors = [
    'article .article-body',
    'article .story-body',
    'article .article-content',
    '.article-body__content',
    '.story-body-text',
    '[data-module="ArticleBody"]',
    '.article__body',
    '.article-text',
    '.article-content',
    '.story-content',
    '.post-content',
    '.entry-content',
    '.content-body',
    'article [class*="body"]',
    'article [class*="content"]',
    'article',
    '[role="article"]',
    '.post-body',
    '#article-body',
    '#story-body',
    'main [class*="article"]',
    'main [class*="story"]',
    'main'
  ];

  for (const selector of articleSelectors) {
    const el = $(selector).first();
    if (el.length > 0) {
      const text = el.text().trim();
      // Only use if there's substantial content (at least 200 chars)
      if (text.length >= 200) {
        articleContent = sanitizeCheerioContent(el, $);
        break;
      }
    }
  }

  // Fallback: collect all <p> tags in the body with substantial text
  if (!articleContent) {
    const paragraphs = [];
    $('body p').each(function () {
      const text = $(this).text().trim();
      if (text.length > 40) { // Skip tiny paragraphs (nav, captions, etc.)
        paragraphs.push('<p>' + $(this).html() + '</p>');
      }
    });
    if (paragraphs.length > 0) {
      articleContent = paragraphs.join('\n');
    }
  }

  if (!articleContent) {
    throw new Error('Could not extract article content');
  }

  // Final sanitization pass
  articleContent = sanitizeHtmlString(articleContent);

  const result = {
    title: title,
    content: articleContent,
    textContent: cheerio.load(articleContent).text().trim(),
    excerpt: excerpt,
    byline: byline,
    siteName: siteName,
    length: articleContent.length
  };

  // Cache the result
  articleCache[url] = {
    data: result,
    timestamp: Date.now()
  };

  return result;
}

/**
 * Extract and sanitize article content from a Cheerio element
 */
function sanitizeCheerioContent(el, $) {
  // Clone so we don't modify the original
  const clone = el.clone();

  // Remove unwanted nested elements
  clone.find('script, style, noscript, iframe, svg, form, input, button, textarea, select').remove();
  clone.find('[class*="social"], [class*="share"], [class*="newsletter"], [class*="related"]').remove();
  clone.find('[class*="ad-"], [class*="advert"], [class*="promo"]').remove();

  // Remove all on* event attributes
  clone.find('*').each(function () {
    const el = $(this);
    const attrs = this.attribs || {};
    Object.keys(attrs).forEach(attr => {
      if (attr.startsWith('on') || attr === 'style') {
        el.removeAttr(attr);
      }
    });
    // Remove javascript: hrefs
    if (el.attr('href') && el.attr('href').startsWith('javascript:')) {
      el.attr('href', '#');
    }
  });

  return clone.html() || '';
}

/**
 * Final regex-based HTML sanitization pass
 */
function sanitizeHtmlString(html) {
  let clean = html;
  // Remove any remaining script/style tags
  clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove on* event handlers
  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s+on\w+\s*=\s*\S+/gi, '');
  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  return clean;
}

/**
 * @route   GET /api/news/article
 * @desc    Fetch and extract full article content from a URL
 * @query   url - The article URL to fetch and parse
 * @access  Public
 */
router.get('/article', async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: url'
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL provided'
      });
    }

    const article = await extractArticle(url);

    res.json({
      success: true,
      data: article,
      url: url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error extracting article:', error.message);

    // Check article cache for expired entry
    const url = req.query.url;
    if (url && articleCache[url]) {
      console.warn('Serving expired article cache due to error');
      return res.json({
        success: true,
        data: articleCache[url].data,
        url: url,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to extract article content',
      message: error.message
    });
  }
});

module.exports = router;
