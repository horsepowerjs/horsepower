const { storagePath, applicationPath, resourcePath, env } = require('@horsepower/server')

/** @type {import('@horsepower/storage').StorageSettings} */
module.exports = {
  default: env('STORAGE_DRIVER', 'local'),
  cloud: env('STORAGE_CLOUD', 's3'),

  disks: {
    local: {
      driver: 'file',
      root: storagePath('app')
    },
    public: {
      driver: 'file',
      root: applicationPath('public')
    },
    resources: {
      driver: 'file',
      root: resourcePath()
    }
  }
}