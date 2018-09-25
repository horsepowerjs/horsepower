const { Router } = require('red5')

Router.get('/', 'welcome').name('welcome')
Router.get('/main/:id', 'welcome').name('test').constrain({ id: /^\d+$/ })
Router.get(/cool+/, 'welcome').name('cool').constrain({ id: /^\d+$/ })
Router.get(/beans+/, () => { }).name('beans').constrain({ id: /^\d+$/ })
Router.resource('money/photos', 'money/photos')