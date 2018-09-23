const { env } = require('red5')

/** @type {import('red5').AppSettings} */
module.exports = {
  port: 500,
  name: env('APP_NAME', 'Red5'),
  env: env('APP_ENV', 'production'),
  https: false
}