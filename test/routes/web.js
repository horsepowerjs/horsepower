const { Router } = require('red5')
const { RequireAjax } = require('red5/middleware')

Router.get('/', { middleware: [] }, 'welcome').name('welcome')