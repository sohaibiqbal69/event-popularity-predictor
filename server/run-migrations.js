const { exec } = require('child_process');
const path = require('path');

// Run the favorites table migration
exec(`node ${path.join(__dirname, 'migrations', 'create_favorites_table.js')}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running migration: ${error}`);
    return;
  }
  console.log(`Migration output: ${stdout}`);
  if (stderr) {
    console.error(`Migration errors: ${stderr}`);
  }
}); 