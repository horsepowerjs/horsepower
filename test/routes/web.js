const { Router } = require('@red5/router')
const { RequireAjax } = require('../app/middleware/Ajax')

Router.get('/', { middleware: [] }, 'welcome').name('welcome')