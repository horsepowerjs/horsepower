import { parse } from 'url'
import { join } from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as querystring from 'querystring'
import { IncomingMessage, IncomingHttpHeaders } from 'http'

import { RequestMethod, Route } from '@red5/router'
import { Response } from '.'

export interface FileType {
  key: string
  filename: string
  tmpFilename: string
}

export declare type Helpers = { [key: string]: Function }

export class Client {

  public readonly method: RequestMethod
  public readonly ajax: boolean = false

  private readonly _post: any
  private readonly _get: any
  private readonly _files: FileType[] = []
  private readonly _headers: IncomingHttpHeaders
  private readonly _response: Response
  // private _helpers: Helpers = {}
  private _id: string

  public route!: Route

  public constructor(req: IncomingMessage, body: string) {
    this._get = querystring.parse(parse(req.url || '').query || '')
    this.ajax = req.headers['x-requested-with'] == 'XMLHttpRequest'
    this._response = new Response()
    this._headers = req.headers
    this._id = (Math.random() * 10e15).toString(36)

    let contentType = this.headers.get<string>('content-type')
    if (contentType.includes('boundary=')) {
      let [type, boundary] = contentType.split('boundary=')
      this._post = {}
      body.split(new RegExp(`(--${boundary}|--${boundary}--)`)).forEach(item => {
        if (item.trim().toLowerCase().startsWith('content-disposition')) {
          item = item.trim()
          let result = item.split(':')[1].split(';').map(i => i.trim()).reduce((obj, itm) => {
            if (itm.startsWith('name=')) obj.name = (itm.match(/^name="(.+)"/) || [''])[1]
            if (itm.startsWith('filename=')) obj.filename = (itm.match(/^filename="(.+)"/) || [''])[1]
            return obj
          }, { name: '', filename: '' })
          if (result.filename.length > 0) {
            let temp = join(os.tmpdir(), 'builder-' + (Math.random() * 10000).toString(12).substr(5, 10))
            let [full, newlines, file] = Array.from(item.match(/^.+?(\r\n\r\n|\n\n)(.+)/s) || [])
            // fs.createWriteStream(temp + '-a').write(full, 'binary')
            fs.createWriteStream(temp).write(file, 'binary')
            this._files.push({
              key: result.name,
              filename: result.filename,
              // full: temp + '-a',
              tmpFilename: temp
            })
          } else {
            this._post[result.name] = item.split(/\r\n\r\n|\n\n/)[1]
          }
        }
      })
    } else {
      try {
        this._post = JSON.parse(body)
      } catch (e) {
        this._post = body
      }
    }

    // Attempt to get the request type.
    //   1. Check the post/get data for a '_method'
    //   2. Check the request for a method
    //   3. Fallback to a 'get' method
    this.method = (this.data.request<string>('_method', null) || req.method || 'get').toLowerCase() as RequestMethod
  }

  public get path(): string {
    if (this.route) return this.route.path
    return '/'
  }

  public get response() {
    return this._response
  }

  public get data() {
    let $this = this
    return {
      files(key: string) {
        return ($this._files.find(i => i.key == key))
      },
      get<T extends any>(key: string, defaultValue: any = ''): T {
        if ($this._get[key]) return $this._get[key]
        else return defaultValue
      },
      post<T extends any>(key: string, defaultValue: any = ''): T {
        if ($this._post[key]) return $this._post[key]
        return defaultValue
      },
      request<T extends any>(key: string, defaultValue: any = ''): T {
        if ($this._get[key]) return $this._get[key]
        else if ($this._post[key]) return $this._post[key]
        else return defaultValue
      },
      toObject() {
        let obj: { get: { [key: string]: any }, post: { [key: string]: any } } = { get: {}, post: {} }
        for (let key in $this._get) { obj.get[key] = $this._get[key] }
        for (let key in $this._post) { obj.get[key] = $this._post[key] }
        return Object.freeze(obj)
      }
    }
  }

  public get headers() {
    let $this = this
    return {
      get<T>(key: string, defaultValue: any = ''): T {
        let header = $this._headers[key.toLowerCase()]
        return header || defaultValue
      },
      has(key: string) {
        return this.get<string>(key).length > 0
      },
      is(key: string, value?: any) {
        let v = this.get(key)
        if (v && value) return v == value
        return !!v
      },
      all() {
        return $this._headers
      }
    }
  }

  // public get helpers(): Helpers { return this._helpers }
  public get id(): string { return this._id }

  public setRoute(route: Route) {
    this.route = route
  }

  // public setHelpers(helpers: { [key: string]: Function }) {
  //   this._helpers = helpers
  // }
}