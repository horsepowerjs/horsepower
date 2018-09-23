const { start, stop } = require('red5')

// Start the server
start()

// Gracefully stop the server
process.on('SIGTERM', () => stop())
process.on('SIGINT', () => stop())
process.on('SIGKILL', () => stop())
process.on('message', (msg) => msg == 'shutdown' && stop())