/** @type {import('@horsepower/session').SessionSettings} */
module.exports = {
  // The type of storage to store the session data.
  // Note: Currently, only file storage is supported.
  // In order to use a file store, a storage driver must be setup
  // within `config/storage.js` using the `file` driver.
  store: 'file',

  // The cookie data that will be used to reference the session.
  // This is used in the the session middleware when the session gets started.
  cookie: {
    path: '/',
    // Expire the cookie in approximately 30 days
    expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
  }
}