module.exports = class {
  /** @param {import('@horsepower/server').Client} client */
  async main(client) {
    return client.response.render('welcome.mix')
  }
}