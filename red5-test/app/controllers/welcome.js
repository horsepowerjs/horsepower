const { Client, Storage } = require('red5')

/**
 * @param {Client} client
 */
module.exports.main = async function (client) {
  return client.response.render('welcome.rtpl', {
    items: ['red', 'white', 'blue'],
    names: [{
      first: 'Billy',
      last: 'Bob'
    }, {
      first: 'Mark',
      last: 'Twain'
    }],
    empty: []
  })
}