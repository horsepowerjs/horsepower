const { Client } = require('red5')

/**
 * @param {Client} client
 */
module.exports.RequireAjax = {
  handle(client) {
    return client.ajax == true
  }
}