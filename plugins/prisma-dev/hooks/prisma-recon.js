#!/usr/bin/env node
// prisma-recon.js
// SessionStart hook that analyzes Prisma configuration and schema in the current repository
// Caches findings for use by other skills
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing recon summary

const fs = require('fs');
const path = require('path');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input || '{}');
    const projectDir = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      // No plugin root, skip silently
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const cachePath = path.join(cacheDir, 'recon.json');

    // Check if cache exists and is fresh (less than 1 hour old)
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      const cacheAge = Date.now() - stats.mtimeMs;
      const oneHour = 60 * 60 * 1000;

      if (cacheAge < oneHour) {
        // Cache is fresh, read and return summary
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        if (cached.schemaPath) {
          console.log(JSON.stringify({
            continue: true,
            systemMessage: `Prisma recon cached: ${cached.models?.length || 0} models in ${cached.schemaPath}`
          }));
          process.exit(0);
        }
      }
    }

    // Find schema.prisma
    const schemaPaths = [
      path.join(projectDir, 'prisma', 'schema.prisma'),
      path.join(projectDir, 'src', 'prisma', 'schema.prisma'),
      path.join(projectDir, 'db', 'schema.prisma')
    ];

    // Check package.json for custom schema path
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.prisma?.schema) {
          schemaPaths.unshift(path.join(projectDir, pkg.prisma.schema));
        }
      } catch (e) {
        // Ignore package.json parse errors
      }
    }

    let schemaPath = null;
    let schemaContent = null;

    for (const p of schemaPaths) {
      if (fs.existsSync(p)) {
        schemaPath = p;
        schemaContent = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (!schemaContent) {
      // No Prisma schema found, not a Prisma project
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    // Parse schema
    const recon = {
      lastUpdated: new Date().toISOString(),
      schemaPath: path.relative(projectDir, schemaPath),
      datasource: null,
      generator: null,
      models: [],
      enums: [],
      relations: []
    };

    // Extract datasource
    const datasourceMatch = schemaContent.match(/datasource\s+(\w+)\s*\{([^}]+)\}/s);
    if (datasourceMatch) {
      const dsContent = datasourceMatch[2];
      const providerMatch = dsContent.match(/provider\s*=\s*"([^"]+)"/);
      const urlMatch = dsContent.match(/url\s*=\s*env\("([^"]+)"\)/);

      recon.datasource = {
        name: datasourceMatch[1],
        provider: providerMatch ? providerMatch[1] : 'unknown',
        urlEnvVar: urlMatch ? urlMatch[1] : 'DATABASE_URL'
      };
    }

    // Extract generator
    const generatorMatch = schemaContent.match(/generator\s+(\w+)\s*\{([^}]+)\}/s);
    if (generatorMatch) {
      const genContent = generatorMatch[2];
      const providerMatch = genContent.match(/provider\s*=\s*"([^"]+)"/);
      const previewMatch = genContent.match(/previewFeatures\s*=\s*\[([^\]]+)\]/);

      recon.generator = {
        name: generatorMatch[1],
        provider: providerMatch ? providerMatch[1] : 'prisma-client-js',
        previewFeatures: previewMatch
          ? previewMatch[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || []
          : []
      };
    }

    // Extract enums
    const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;
    let enumMatch;
    while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
      const values = enumMatch[2]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'));

      recon.enums.push({
        name: enumMatch[1],
        values: values
      });
    }

    // Extract models
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let modelMatch;
    while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
      const modelName = modelMatch[1];
      const modelContent = modelMatch[2];

      const model = {
        name: modelName,
        tableName: null,
        fields: [],
        primaryKey: [],
        uniqueFields: [],
        indexes: [],
        relations: []
      };

      // Check for @@map
      const mapMatch = modelContent.match(/@@map\("([^"]+)"\)/);
      if (mapMatch) {
        model.tableName = mapMatch[1];
      }

      // Check for @@id (composite)
      const compositeIdMatch = modelContent.match(/@@id\(\[([^\]]+)\]\)/);
      if (compositeIdMatch) {
        model.primaryKey = compositeIdMatch[1].split(',').map(s => s.trim());
      }

      // Check for @@unique
      const uniqueMatches = modelContent.matchAll(/@@unique\(\[([^\]]+)\]\)/g);
      for (const um of uniqueMatches) {
        model.uniqueFields.push(um[1].split(',').map(s => s.trim()));
      }

      // Check for @@index
      const indexMatches = modelContent.matchAll(/@@index\(\[([^\]]+)\]/g);
      for (const im of indexMatches) {
        model.indexes.push(im[1].split(',').map(s => s.trim()));
      }

      // Parse fields
      const lines = modelContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;

        // Match field definition: name Type attributes
        const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)?$/);
        if (fieldMatch) {
          const [, fieldName, fieldType, isList, isOptional, attrs] = fieldMatch;

          const field = {
            name: fieldName,
            type: fieldType + (isList || '') + (isOptional || ''),
            isOptional: !!isOptional,
            isList: !!isList,
            attributes: []
          };

          if (attrs) {
            // Extract attributes
            if (attrs.includes('@id')) {
              field.attributes.push('@id');
              if (model.primaryKey.length === 0) {
                model.primaryKey = [fieldName];
              }
            }
            if (attrs.includes('@unique')) {
              field.attributes.push('@unique');
              model.uniqueFields.push([fieldName]);
            }
            if (attrs.includes('@default')) {
              const defaultMatch = attrs.match(/@default\(([^)]+)\)/);
              if (defaultMatch) {
                field.attributes.push(`@default(${defaultMatch[1]})`);
              }
            }
            if (attrs.includes('@relation')) {
              field.isRelation = true;
              model.relations.push(fieldName);

              // Track relation
              recon.relations.push({
                from: modelName,
                to: fieldType,
                field: fieldName,
                type: isList ? 'one-to-many' : 'one-to-one'
              });
            }
          }

          model.fields.push(field);
        }
      }

      recon.models.push(model);
    }

    // Check migrations
    const migrationsDir = path.join(projectDir, 'prisma', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir)
        .filter(f => /^\d+/.test(f))
        .sort();

      recon.migrations = {
        count: migrations.length,
        latest: migrations[migrations.length - 1] || null,
        provider: recon.datasource?.provider || 'unknown'
      };

      // Check migration lock
      const lockPath = path.join(migrationsDir, 'migration_lock.toml');
      if (fs.existsSync(lockPath)) {
        const lockContent = fs.readFileSync(lockPath, 'utf8');
        const providerMatch = lockContent.match(/provider\s*=\s*"([^"]+)"/);
        if (providerMatch) {
          recon.migrations.lockProvider = providerMatch[1];
        }
      }
    }

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Write cache
    fs.writeFileSync(cachePath, JSON.stringify(recon, null, 2));

    // Generate summary
    const modelCount = recon.models.length;
    const enumCount = recon.enums.length;
    const relationCount = recon.relations.length;
    const migrationCount = recon.migrations?.count || 0;

    const summary = `Prisma schema analyzed: ${modelCount} models, ${enumCount} enums, ${relationCount} relations, ${migrationCount} migrations. Database: ${recon.datasource?.provider || 'unknown'}. Schema: ${recon.schemaPath}`;

    console.log(JSON.stringify({
      continue: true,
      systemMessage: summary
    }));
    process.exit(0);

  } catch (err) {
    // On any error, continue without blocking
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
});
