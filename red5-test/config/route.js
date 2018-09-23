const { appPath, applicationPath } = require('red5')

module.exports = {
  controllers: appPath('controllers'),
  middleware: appPath('middleware'),
  routes: applicationPath('routes')
}