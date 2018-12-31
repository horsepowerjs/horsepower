const path = require('path')

module.exports = {
  apps: [
    {
      name: 'Red5',
      script: path.join(__dirname, 'index.js'),
      watch: path.join(__dirname, '../', '**/*.js')
    }
  ]
}