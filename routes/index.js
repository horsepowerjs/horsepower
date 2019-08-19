const { Router } = require('@horsepower/router')

// Initiate the web routes
Router.group('/', async () => require('./web'))

// Initiate the api routes
Router.group('/api', async () => require('./api'))