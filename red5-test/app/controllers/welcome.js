const { Client, Storage } = require('red5')

/**
 * @param {Client} client
 */
module.exports.main = async function (client) {
  return client.response.render('welcome.red5', {
    items: ['red', 'white', 'blue'],
    empty: []
  })
}