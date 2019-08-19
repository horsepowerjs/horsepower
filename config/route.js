const { appPath, applicationPath } = require('@horsepower/server')

module.exports = {
  controllers: appPath('controllers'),
  middleware: appPath('middleware'),
  routes: applicationPath('routes')
}