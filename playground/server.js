// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require('babel-register')();

// Create empty env file if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./integrations/env.json')) {
  fs.writeFileSync('./integrations/env.json', '{}');
}
// Import the rest of our application.
module.exports = require('./src/index.js');
