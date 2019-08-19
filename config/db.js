const { env } = require('@horsepower/server')

/** @type {import('@horsepower/server').DBSettings} */
module.exports = {
  mysql: {
    default: true,
    driver: 'mysql',
    database: env('DB_DATABASE', ''),
    username: env('DB_USERNAME', ''),
    password: env('DB_PASSWORD', ''),
    hostname: env('DB_HOSTNAME', 'localhost')
  }
}