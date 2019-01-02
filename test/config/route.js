const { appPath, applicationPath } = require('@red5/server')

module.exports = {
  controllers: appPath('controllers'),
  middleware: appPath('middleware'),
  routes: applicationPath('routes')
}