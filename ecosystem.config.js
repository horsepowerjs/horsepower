const path = require('path')
const dotenv = require('dotenv')

// Load the env
dotenv.config({ path: path.join(__dirname, '.env') })

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME || 'Horsepower Http Server',
      script: path.join(__dirname, 'index.js'),
      watch: [
        path.join(__dirname, 'app', '**/*.js'),
        path.join(__dirname, 'config', '**/*.js'),
        path.join(__dirname, 'routes', '**/*.js'),
      ],
    }
  ]
}