const path = require('path')

module.exports = {
  apps: [

    // First application
    {
      name: 'red5 Tests',
      script: path.join(__dirname, 'index.js'),
      watch: path.join(__dirname, '../', '**/*.js')
    }
  ]
}