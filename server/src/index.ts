import * as fs from 'fs'
import * as path from 'path'
import { Server, AppSettings } from './Server'
import { applicationPath, env } from './helper'
import { Client } from './Client'
import * as shell from 'shelljs'

export { AppSettings, RouterSettings, ViewSettings } from './Server'
export * from './helper'
export * from './Client'
export * from './Response'

export function start() {
  Server.start()
}

export function stop() {
  Server.stop()
}

export const log = {
  error: (message: string | Error, client: Client) => {
    let d = new Date
    let msg = typeof message == 'string' ? message : message.message
    let errMsg = `${d.toUTCString()} -- ${client.response.code} ${(client.request.method || 'GET').toUpperCase()} "${(client.request.url || '/')}" -- ${msg}\n`
    let app = require(applicationPath('config/app')) as AppSettings
    // Log to the error file
    if (app.logs && app.logs.error) {
      shell.mkdir('-p', path.parse(app.logs.error).dir)
      fs.appendFile(app.logs.error, errMsg, (err) => {
        if (err) console.log(err)
      })
    }
    // Log the error to the console
    if (env('APP_ENV', 'production') != 'production') {
      let trace = typeof message == 'string' ? '' : message.stack
      // console.trace(trace)
      // console.error(`\x1b[31m${errMsg}\x1b[0m`)
    }
  },
  access: (client: Client) => {
    let d = new Date()
    let msg = (client.request.method || 'GET') + ' ' + (client.request.url || '/')
    let app = require(applicationPath('config/app')) as AppSettings
    if (env('APP_ENV', 'production') != 'production') {
      if ([
        100, 101, 102,
        200, 201, 202, 203, 204, 205, 206, 207, 208,
        300, 301, 302, 303, 304, 305, 306, 307, 308
      ].includes(client.response.code)) {
        console.log('[%s] %s %s', d.toUTCString(), client.response.code, msg)
      } else {
        console.error('\x1b[31m[%s] %s %s\x1b[0m', d.toUTCString(), client.response.code, msg)
      }
    }
    if (app.logs && app.logs.access) {
      let ip = (client.request.connection.remoteAddress || '::1').replace(/^::1/, '127.0.0.1')
      let httpVersion = client.request.httpVersion || '1.1'
      let agent = client.request.headers['user-agent'] || ''
      fs.appendFile(
        app.logs.access,
        `${ip} -- [${d.toUTCString()}] -- "${msg} HTTP/${httpVersion}" ${client.response.code} -- "${agent}"\n`,
        () => { }
      )
    }
  }
}