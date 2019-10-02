// Transpile all code the will be required with babel and use 'env' (aka ES6) preset.
require('@babel/register')({
  rootMode: 'upward', // use top-level babel.config.js in order to be able to import integrations
  ignore: [/node_modules/], // tell it not to ignore ./integrations (else it will only look for cwd)
});

// Create empty env file if it doesn't exist
const fs = require('fs');

if (!fs.existsSync('../integrations/env.json')) {
  fs.writeFileSync('../integrations/env.json', '{}');
}
// Import the rest of our application.
module.exports = require('./server');
