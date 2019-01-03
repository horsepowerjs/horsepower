const { Router } = require('@red5/router')

Router.get('/', 'welcome').name('welcome')//.middleware('RequireHeader:x-http-dog')