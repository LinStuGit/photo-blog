const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all SQL migration files sorted by name
const migrationsDir = path.join(__dirname, '../migrations');
const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

console.log('Running migrations...');
console.log(`Found ${files.length} migration files`);

// Execute each migration
files.forEach((file, index) => {
    console.log(`\n[${index + 1}/${files.length}] Executing: ${file}`);
    try {
        execSync(`npx wrangler d1 execute photo-blog-db --file=./migrations/${file}`, {
            stdio: 'inherit'
        });
        console.log(`✓ ${file} completed successfully`);
    } catch (error) {
        console.error(`✗ ${file} failed`);
        console.error(error.message);
        process.exit(1);
    }
});

console.log('\n✓ All migrations completed successfully!');
