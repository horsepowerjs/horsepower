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
export * from './Event'

export function start() {
  Server.start()
}

export function stop() {
  Server.stop()
}

export class log {
  public static async error(message: string | Error, client: Client) {
    let d = new Date
    let file = ''
    if (message instanceof Error) {
      file = ((message.stack || '').match(/\(.+\.js:\d+:\d+\)/i) || [''])[0]
    }
    let msg = typeof message == 'string' ? message : `${message.message} ${file}`
    let errMsg = `[${d.toUTCString()}] ${client.response.code} ${(client.request.method || 'GET').toUpperCase()} "${(client.request.url || '/')}" -- "${msg}"`
    let app = require(applicationPath('config/app')) as AppSettings
    // Log to the error file
    if (app.logs && app.logs.error && app.logs.error.path) {
      shell.mkdir('-p', path.parse(app.logs.error.path).dir)
      let errorPath = app.logs.error.path
      let errorSize = app.logs.error.maxSize || undefined
      if (errorSize) {
        let stats = await new Promise<fs.Stats>(r => fs.stat(errorPath, (err, stats) => r(stats)))
        if (stats && stats.size >= errorSize) await new Promise(r => fs.truncate(errorPath, () => r()))
      }
      await new Promise(r => fs.appendFile(errorPath, `${errMsg}\n`, () => r()))
    }
    // Log the error to the console
    if (env('APP_ENV', 'production') != 'production') {
      // let trace = typeof message == 'string' ? '' : message.stack
      // console.trace(trace)
      console.error(`\x1b[31m${errMsg}\x1b[0m`)
    }
  }

  public static async access(client: Client) {
    let d = new Date()
    let msg = (client.request.method || 'GET') + ' ' + (client.request.url || '/')
    let app = require(applicationPath('config/app')) as AppSettings
    if (env('APP_ENV', 'production') != 'production') {
      if ([
        // Informational
        100, 101, 102,
        // Success
        200, 201, 202, 203, 204, 205, 206, 207, 208,
        // Redirection
        300, 301, 302, 303, 304, 305, 306, 307, 308
      ].includes(client.response.code)) {
        console.log('[%s] %s %s', d.toUTCString(), client.response.code, msg)
      } else {
        // 4xx - Client Errors
        // 5xx - Server Errors
        console.error('\x1b[31m[%s] %s %s\x1b[0m', d.toUTCString(), client.response.code, msg)
      }
    }
    if (app.logs && app.logs.access && app.logs.access.path) {
      let ip = (client.request.connection.remoteAddress || '::1').replace(/^::1/, '127.0.0.1')
      let httpVersion = client.request.httpVersion || '1.1'
      let agent = client.request.headers['user-agent'] || ''
      let accessPath = app.logs.access.path
      let accessSize = app.logs.access.maxSize || undefined
      let accessMsg = `${ip} -- [${d.toUTCString()}] -- "${msg} HTTP/${httpVersion}" ${client.response.code} -- "${agent}"`
      if (accessSize) {
        let stats = await new Promise<fs.Stats>(r => fs.stat(accessPath, (err, stats) => r(stats)))
        if (stats && stats.size >= accessSize) await new Promise(r => fs.truncate(accessPath, () => r()))
      }
      await new Promise(r => fs.appendFile(accessPath, `${accessMsg}\n`, () => r()))
    }
  }
}