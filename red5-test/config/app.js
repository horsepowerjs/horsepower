const { env } = require('red5')

/** @type {import('red5').AppSettings} exports */
module.exports = {
  port: parseInt(env('APP_PORT', '80')),
  name: env('APP_NAME', 'Red5'),
  env: env('APP_ENV', 'production'),
  https: false
}