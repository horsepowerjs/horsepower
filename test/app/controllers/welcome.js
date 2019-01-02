const { Client } = require('@red5/server')

/**
 * @param {Client} client
 */
module.exports.main = async function (client) {
  return client.response.render('welcome.rtpl')
}