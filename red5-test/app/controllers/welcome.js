const { Client, Storage } = require('red5')

/**
 * @param {Client} client
 */
module.exports.main = async function (client) {
  return client.response.render('welcome.rtpl', {
    items: ['red', 'white', 'blue'],
    comments: [{
      comment: "hello",
      other: [{
        subComment: "hi 1"
      }, {
        subComment: "hi 2"
      }]
    }],
    names: [{
      first: 'Billy',
      last: 'Bob'
    }, {
      first: 'Mark',
      last: 'Twain'
    }],
    empty: [],
    age: 25
  })
}