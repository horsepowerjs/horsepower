const { Router } = require('red5')
const { requireAjax } = require('../app/middleware/Ajax')

// Initiate the web routes
Router.group('/', async () => require('./web'))

// Initiate the api routes
Router.group('/api', { middleware: [requireAjax] }, () => require('./api'))