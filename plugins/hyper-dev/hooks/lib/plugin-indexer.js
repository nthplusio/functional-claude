#!/usr/bin/env node
// plugin-indexer.js
// Indexes popular Hyper plugins from npm registry
//
// Called by hyper-session-start.js for weekly refresh
// Generates .cache/plugin-ecosystem.json

const https = require('https');
const fs = require('fs');
const path = require('path');

const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';
const TOP_PLUGINS_COUNT = 25;
const REFRESH_INTERVAL_DAYS = 7;

/**
 * Make HTTPS GET request and return JSON
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Search npm for Hyper plugins
 */
async function searchHyperPlugins() {
  const searchUrl = `${NPM_SEARCH_URL}?text=keywords:hyper-plugin&size=100`;

  try {
    const result = await fetchJson(searchUrl);
    return result.objects || [];
  } catch (e) {
    console.error('Failed to search npm:', e.message);
    return [];
  }
}

/**
 * Get detailed package info
 */
async function getPackageDetails(packageName) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

  try {
    const pkg = await fetchJson(url);
    const latestVersion = pkg['dist-tags']?.latest;
    const latestData = pkg.versions?.[latestVersion] || {};

    return {
      name: packageName,
      description: pkg.description || '',
      version: latestVersion,
      keywords: latestData.keywords || [],
      repository: pkg.repository?.url || null,
      homepage: pkg.homepage || null,
      main: latestData.main || 'index.js'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Analyze plugin for common export patterns
 */
function analyzeExports(details) {
  const patterns = [];
  const knownExports = [
    'decorateConfig',
    'decorateTerm',
    'decorateHyper',
    'decorateHeader',
    'decorateTabs',
    'decorateTab',
    'middleware',
    'reduceUI',
    'reduceSessions',
    'mapTermsState',
    'mapHyperState',
    'getTermGroupProps',
    'getTermProps',
    'onApp',
    'onWindow',
    'onUnload'
  ];

  // Infer patterns from keywords and description
  const text = `${details.description} ${details.keywords?.join(' ') || ''}`.toLowerCase();

  if (text.includes('theme') || text.includes('color')) {
    patterns.push('theme');
  }
  if (text.includes('tab')) {
    patterns.push('tab customization');
  }
  if (text.includes('cwd') || text.includes('directory')) {
    patterns.push('cwd detection');
  }
  if (text.includes('search')) {
    patterns.push('search');
  }
  if (text.includes('pane') || text.includes('split')) {
    patterns.push('pane management');
  }
  if (text.includes('ssh') || text.includes('remote')) {
    patterns.push('remote/ssh');
  }
  if (text.includes('status') || text.includes('bar')) {
    patterns.push('status bar');
  }
  if (text.includes('opacity') || text.includes('vibrancy')) {
    patterns.push('window effects');
  }
  if (text.includes('font') || text.includes('ligature')) {
    patterns.push('font handling');
  }

  return {
    patterns,
    likely_exports: patterns.includes('theme') ? ['decorateConfig'] : ['decorateConfig', 'middleware']
  };
}

/**
 * Main refresh function - called by session-start hook
 */
async function refreshIndex(cacheDir) {
  const ecosystemPath = path.join(cacheDir, 'plugin-ecosystem.json');

  // Search for plugins
  const searchResults = await searchHyperPlugins();

  if (searchResults.length === 0) {
    // Keep existing cache if search fails
    return;
  }

  // Sort by popularity (downloads)
  const sorted = searchResults
    .filter(obj => obj.package?.name?.startsWith('hyper'))
    .sort((a, b) => {
      const aScore = (a.score?.detail?.popularity || 0) * 100000 +
                     (a.searchScore || 0);
      const bScore = (b.score?.detail?.popularity || 0) * 100000 +
                     (b.searchScore || 0);
      return bScore - aScore;
    })
    .slice(0, TOP_PLUGINS_COUNT);

  // Get details for top plugins
  const plugins = [];

  for (const result of sorted) {
    const pkg = result.package;
    if (!pkg?.name) continue;

    const details = await getPackageDetails(pkg.name);
    if (!details) continue;

    const analysis = analyzeExports(details);

    plugins.push({
      name: pkg.name,
      description: pkg.description || details.description || '',
      version: details.version,
      npm_downloads_weekly: Math.round((result.score?.detail?.popularity || 0) * 100000),
      patterns: analysis.patterns,
      key_exports: analysis.likely_exports,
      repository: details.repository,
      homepage: details.homepage
    });
  }

  // Write ecosystem cache
  const ecosystem = {
    last_refresh: new Date().toISOString().split('T')[0],
    refresh_interval_days: REFRESH_INTERVAL_DAYS,
    total_found: searchResults.length,
    indexed_count: plugins.length,
    top_plugins: plugins
  };

  fs.writeFileSync(ecosystemPath, JSON.stringify(ecosystem, null, 2));

  return ecosystem;
}

/**
 * Get cached ecosystem data
 */
function getEcosystem(cacheDir) {
  const ecosystemPath = path.join(cacheDir, 'plugin-ecosystem.json');

  if (fs.existsSync(ecosystemPath)) {
    try {
      return JSON.parse(fs.readFileSync(ecosystemPath, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  return null;
}

/**
 * Check if refresh is needed
 */
function needsRefresh(cacheDir) {
  const ecosystem = getEcosystem(cacheDir);

  if (!ecosystem || !ecosystem.last_refresh) {
    return true;
  }

  const lastRefresh = new Date(ecosystem.last_refresh);
  const daysSinceRefresh = (Date.now() - lastRefresh.getTime()) / (24 * 60 * 60 * 1000);

  return daysSinceRefresh >= REFRESH_INTERVAL_DAYS;
}

// Export functions for use by other scripts
module.exports = {
  refreshIndex,
  getEcosystem,
  needsRefresh,
  searchHyperPlugins,
  getPackageDetails
};

// Allow direct execution for testing
if (require.main === module) {
  const cacheDir = process.argv[2] || path.join(__dirname, '..', '..', '.cache');

  console.log('Refreshing plugin ecosystem index...');
  console.log('Cache directory:', cacheDir);

  refreshIndex(cacheDir)
    .then(ecosystem => {
      if (ecosystem) {
        console.log(`Indexed ${ecosystem.indexed_count} plugins`);
        console.log('Top 5:');
        ecosystem.top_plugins.slice(0, 5).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name} - ${p.description.slice(0, 50)}...`);
        });
      } else {
        console.log('Failed to refresh index');
      }
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
