import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as mime from 'mime-types'
import * as path from 'path'
import * as url from 'url'
import { Template } from './Template'
import * as helpers from './helper'

import { Router } from '@red5/router'
import { Storage, StorageConfig } from '@red5/storage'
import { MiddlewareManager } from '@red5/middleware'
import { Client, Response } from '.'
import { env } from './helper';


export interface RouterSettings {
  controllers: string
  middleware: string
  routes: string
}

export interface ViewSettings {
  path: string
}

export interface AppSettings {
  port: number
  name?: string
  env?: string
  https?: https.ServerOptions | false
  chunkSize?: number
  static?: string[]
}

export interface Connection {
  id: string
  client: Client
}

export class Server {
  private static instance: http.Server | https.Server
  public static app: AppSettings

  public static start() {
    // Load the application env file if it exists
    let envPath = helpers.applicationPath('.env')
    let env = require('dotenv').config({ path: envPath })

    // Load the application configuration
    this.app = require(helpers.applicationPath('config/app')) as AppSettings

    // Create the server
    this.instance = !!this.app.https ?
      // Create an https server
      https.createServer(this.app.https, this.request.bind(this)) :
      // Create an http server
      http.createServer(this.request.bind(this))

    // Listen on the provided port
    this.instance.listen(this.app.port, () => {
      // Output the config settings
      console.log('Red5 is now listening on port ' + this.app.port)

      // Config locations
      let views = require(helpers.configPath('view')) as ViewSettings
      let storage = require(helpers.configPath('storage')) as StorageConfig
      let route = require(helpers.configPath('route')) as RouterSettings

      // Setup dependencies
      Router.setControllersRoot(route.controllers)
      Template.setTemplatesRoot(views.path)
      Storage.setConfig(storage)

      // Log configuration settings
      console.log('--- Start Config Settings -----')
      console.log(`    environment: "${!env.error ? envPath : '.env file not found!'}"`)
      console.log(`    controllers: "${route.controllers}"`)
      console.log(`    views: "${views.path}"`)
      console.log(`    storage default: "${storage.default}"`)
      console.log(`    storage cloud: "${storage.cloud || ''}"`)
      console.log(`    disks:`)
      for (let i in storage.disks) console.log(`      ${i}: "${storage.disks[i].root || ''}"`)
      console.log(`    routes: "${route.routes}"`)
      console.log('--- End Config Settings -----')
      try {
        console.log(`--- Start Route Setup -----`)
        require(route.routes)
        // Get the longest route
        let longestRoute = Router.routes.reduce((num, val) => {
          let len = val.pathAlias instanceof RegExp ? `RegExp(${val.pathAlias.source})`.length : val.pathAlias.length
          return len > num ? len : num
        }, 'Route'.length)
        // Get the longest controller
        let longestController = Router.routes.reduce((num, val) => {
          let len = typeof val.callback == 'string' ? val.callback.length : 'Closure'.length
          return len > num ? len : num
        }, 'Controller'.length)
        // Get the longest name
        let longestName = Router.routes.reduce((num, val) => {
          let len = val.routeName.length || 0
          return len > num ? len : num
        }, 'Name'.length)
        console.log(`    ${'Method'.padEnd(10)}${'Route'.padEnd(longestRoute + 3)}${'Controller'.padEnd(longestController + 3)}${'Name'}`)
        console.log(`${''.padEnd(longestController + longestRoute + longestName + 20, '-')}`)
        Router.routes.forEach(route => {
          let method = route.method.toUpperCase()
          let routeAlias = route.pathAlias instanceof RegExp ? `RegExp(${route.pathAlias.source})` : route.pathAlias
          let routeCtrl = typeof route.callback == 'string' ? `${route.callback}` : 'Closure'
          console.log(`    ${method.padEnd(10)}${routeAlias.padEnd(longestRoute + 3)}${routeCtrl.padEnd(longestController + 3)}${route.routeName}`)
        })
        console.log(`--- End Routes Setup -----`)
      } catch (e) {
        console.error(`Could not load routes from "${route.routes}":\n  - ${e.message}`)
      }
      console.log('Red5 is now accepting connections!')
    })
  }

  public static stop() {
    console.log('Red5 is shutting down')
    this.instance.close((err?: Error) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log('Red5 has shut down')
      process.exit(0)
    })
  }

  private static request(req: http.IncomingMessage, res: http.ServerResponse) {
    let body = ''
    let urlInfo = url.parse('http://' + req.headers.host + (req.url || '/'))
    req.on('data', (data: Buffer) => {
      body += data.toString('binary')
    }).on('end', async (data: Buffer) => {
      if (data) body += data.toString('binary')
      let client = new Client(req, body)

      // Attempt to send the file from the public folder
      if (urlInfo.pathname) {
        let filePath = path.join(helpers.applicationPath('public'), urlInfo.pathname)
        try {
          let stats = await new Promise<fs.Stats>(resolve => fs.stat(filePath, (err, stat) => resolve(stat)))
          if (stats.isFile()) {
            client.response.setFile(filePath).setContentLength(stats.size)
            return await this.send(client, req, res)
          }
        } catch (e) { }

        // If the file isn't found in the public folder attempt to find it in the defined static folder(s)
        if (this.app.static && Array.isArray(this.app.static) && this.app.static.length > 0) {
          for (let staticFolder in this.app.static) {
            let filePath = path.join(staticFolder, urlInfo.pathname)
            try {
              let stats = await new Promise<fs.Stats>(resolve => fs.stat(filePath, (err, stat) => resolve(stat)))
              if (stats.isFile()) {
                client.response.setFile(filePath).setContentLength(stats.size)
                return await this.send(client, req, res)
              }
            } catch (e) { }
          }
        }
      }

      let routeInfo = await Router.route(urlInfo, client.method)
      let resp: Response | null = null
      if (routeInfo && routeInfo.route && routeInfo.callback) {
        client.setRoute(routeInfo.route)
        // Run the pre request middleware `MyMiddleware.handle()`
        let preResult = await MiddlewareManager.run(routeInfo.route, <Client>client, 'pre')
        if (preResult !== true && !(preResult instanceof Response)) {
          await this.getErrorPage(client, 400)
          return this.send(client, req, res)
        }
        // Run the controller
        resp = await routeInfo.callback(client)
        // Run the post request middleware `MyMiddleware.postHandle()`
        let postResult = await MiddlewareManager.run(routeInfo.route, <Client>client, 'post')
        if (postResult !== true && !(postResult instanceof Response)) {
          await this.getErrorPage(client, 400)
          return this.send(client, req, res)
        }
      }

      !resp && await this.getErrorPage(client, 400)
      await this.send(client, req, res)
    })
  }

  /**
   * Sends a debug page that displays debug data.
   * If the app is in production mode, a 500 error page will be sent.
   *
   * @static
   * @param {Client} client
   * @param {{ [key: string]: any }} data
   * @returns
   * @memberof Server
   */
  public static async sendDebugPage(client: Client, data: { [key: string]: any }) {
    const prod = env('APP_ENV', 'production') == 'production'
    return await this.getErrorPage(client, !prod ? 1000 : 500, !prod ? data : {})
  }

  /**
   * Sets the error page that should be displayed if something were to go wrong in the request.
   *
   * @static
   * @param {Client} client
   * @param {number} code
   * @param {{ [key: string]: any }} [data={}]
   * @returns {Promise<Response>}
   * @memberof Server
   */
  public static async getErrorPage(client: Client, code: number, data: { [key: string]: any } = {}): Promise<Response> {
    // Read the file
    let filePath = path.join(__dirname, '../error-pages/', code + '.html')
    let fileUri = path.parse(filePath)
    let file = await new Promise<string>(resolve => fs.readFile(filePath, (err, data) => resolve(data.toString())))
    // let file = fs.readFileSync(filePath).toString()
    // Replace static placeholders
    file = file.replace(/\$\{(.+)\}/g, (a: string, b: string) => data[b] || '')
    // Replace executable placeholders
    file = file.replace(/\#\{(.+)\}/g, (a: string, b: string) => {
      // Replace "#{include('/path/to/file')}" with the file's contents
      if (b.startsWith('include(')) {
        return b.replace(/'|"/g, '').replace(/\include\((.+)\);?/i, (a: string, b: string) => {
          let inclFilePath = path.resolve(fileUri.dir, b)
          return fs.readFileSync(inclFilePath).toString()
        })
      }
      return ''
    })
    return client.response.setCode(code).setBody(file)
  }

  /**
   * Logs the request to the console if the environment is not in production
   *
   * @private
   * @static
   * @param {http.IncomingMessage} req The http request
   * @param {Client} client The client
   * @memberof Server
   */
  private static logRequest(req: http.IncomingMessage, client: Client) {
    if (env('APP_ENV', 'production') != 'production') {
      let msg = (req.method || 'GET') + ' ' + (req.url || '/')
      let d = new Date()
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
  }

  private static async send(client: Client, req: http.IncomingMessage, res: http.ServerResponse) {
    let fileSize = client.response.contentLength
    let start = 0, end = fileSize - 1 < start ? start : fileSize - 1
    // If the file is larger than 10,000,000 bytes
    // then send the file in chunks
    if (fileSize > (this.app.chunkSize || 5e6)) {
      let range = (req.headers.range || '') as string
      let positions = range.replace(/bytes=/, '').split('-')
      start = parseInt(positions[0], 10)
      end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1
      let chunkSize = (end - start) + 1
      client.response.setCode(206).setHeaders({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Connection': 'Keep-Alive',
        'Content-Length': chunkSize
      })
    }
    if (client.response.filePath) {
      let contentType = mime.lookup(client.response.filePath) || 'text/plain'
      client.response.setHeader('Content-Type', contentType)
    }

    // Execute the middleware termination commands
    await MiddlewareManager.run(client.route, <Client>client, 'terminate')

    // Write the response headers
    res.writeHead(client.response.code, client.response.headers)

    this.logRequest(req, client)

    // If the method is head or options no body should be sent
    if (client.method == 'head' || client.method == 'options') {
      return res.end()
    }

    // Generate the response body
    if (client.response.filePath) {
      let stream: fs.ReadStream = fs.createReadStream(client.response.filePath, { start, end })
        .on('open', () => stream.pipe(<any>res))
        .on('close', () => res.end())
        .on('error', err => res.end(err))
    } else {
      if (client.response.templatePath) {
        res.write(await Template.render(client))
      } else if (client.response.buffer) {
        res.write(client.response.buffer)
      } else {
        res.write(client.response.body)
      }
      res.end()
    }
  }
}