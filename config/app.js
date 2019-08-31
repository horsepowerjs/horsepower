const { env, storagePath } = require('@horsepower/server')

/** @type {import('@horsepower/server').AppSettings} exports */
module.exports = {
  // This is the port number that the node server will connect to.
  // In order to access the server you will need to hit the ip directly
  // otherwise you will need to place the server behind Nginx, Apache or
  // some other web server that supports domain access.
  port: parseInt(env('APP_PORT', '5000')),

  // This the name of the application.
  name: env('APP_NAME', 'Horsepower'),

  // This is the default locale for the application.
  // If the user has never been to the site before,
  // then this is the locale that will load for them by default.
  // If the site has no localization, then this setting isn't used.
  // If this is omitted and the site uses localization,
  // than "en" is the default locale for the application.
  locale: 'en',

  // This is the environment that the server is currently running on.
  // Modifying this changes how some features are used such as logging,
  // where when set to 'production' logging won't log to the console.
  env: env('APP_ENV', 'production'),

  // This puts the app in/out of maintenance mode
  // This can be triggered via command line:
  //   horsepower maintenance:up
  //   horsepower maintenance:down
  maintenance: env('APP_MAINTENANCE', 'false') === 'true',

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