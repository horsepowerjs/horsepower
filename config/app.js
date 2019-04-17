const { env, storagePath } = require('@red5/server')

/** @type {import('@red5/server').AppSettings} exports */
module.exports = {
  // This is the port number that the node server will connect to.
  // In order to access the server you will need to hit the ip directly
  // otherwise you will need to place the server behind Nginx, Apache or
  // some other web server that supports domain access.
  port: parseInt(env('APP_PORT', '5000')),
  name: env('APP_NAME', 'Red5'),

  session: {
    store: 'file'
  },

  // This is the environment that the server is currently running on.
  // Modifying this changes how some features are used such as logging,
  // where when set to 'production' logging won't log to the console.
  env: env('APP_ENV', 'production'),

  // This turns support on for https (currently not used).
  https: false,

  // Comment out sections you don't want to log to file
  // or just comment out the entire `logs` block to disable all logging.
  logs: {
    error: {
      // This is the path to where error logs will be written to.
      path: storagePath('framework/logs/error.log'),

      // This is the maximum size of the error log before it gets truncated.
      maxSize: 10e6 // Approximately 10mb
    },
    access: {
      // This is the path to where access logs will be written to.
      path: storagePath('framework/logs/access.log'),

      // This is the maximum size of the access log before it gets truncated.
      maxSize: 10e6 // Approximately 10mb
    }
  }
}