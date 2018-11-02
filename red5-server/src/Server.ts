import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as mime from 'mime-types'
import * as path from 'path'
import * as url from 'url'
import { Router, Storage, StorageConfig, Route } from 'red5'
import { Template } from './Template'
import * as helpers from './helper'
import { Middleware } from './Middleware'
import { Response } from './Response'
import { Client } from './Client'

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
    this.instance.close((err: Error) => {
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
      }

      let routeInfo = await Router.route(urlInfo, client.method)
      let resp: Response | null = null
      if (routeInfo && routeInfo.route && routeInfo.callback) {
        client.setRoute(routeInfo.route)
        await Middleware.run(routeInfo.route, client)
        resp = await routeInfo.callback(client)
      }

      // await client.session.close()
      if (!resp) {
        this.getErrorPage(client, 400)
        await this.send(client, req, res)
      }
      else await this.send(client, req, res)
    })
  }

  public static sendDebugPage(client: Client, data: { [key: string]: any }) {
    return this.getErrorPage(client, 1000, data)
  }

  public static getErrorPage(client: Client, code: number, data: { [key: string]: any } = {}): Response {
    // Read the file
    let filePath = path.join(__dirname, '../error-pages/', code + '.html')
    let fileUri = path.parse(filePath)
    let file = fs.readFileSync(filePath).toString()
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
    res.writeHead(client.response.code, client.response.headers)
    if (client.method == 'head' || client.method == 'options') {
      return res.end()
    }
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