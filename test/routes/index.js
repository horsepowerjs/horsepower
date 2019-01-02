const { Router } = require('@red5/router')
const { EnforceAjax } = require('@red5/middleware')

// Initiate the web routes
Router.group('/', async () => require('./web'))

// Initiate the api routes
Router.group('/api', { middleware: [EnforceAjax] }, () => require('./api'))