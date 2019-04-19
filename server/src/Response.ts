import { OutgoingHttpHeaders } from 'http'
import { Router } from '@red5/router'
import { stat, statSync } from 'fs';

export interface CookieOptions {
  path?: string
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  sameSite?: boolean | 'lax' | 'strict'
  secure?: boolean
}

export interface Cookie {
  key: string
  value: string
}

export class Response {

  private _filePath: string | null = null
  private _templatePath: string | null = null
  private _templateData: {} | null = null
  // private _media: MediaFile | null = null
  private _buffer: Buffer | null = null
  private _cookies: (Cookie & CookieOptions)[] = []

  public constructor(private _body: string = '', private _headers: OutgoingHttpHeaders = {
    'Content-Type': 'text/html'
  }, private _code: number = 200, private _length: number = 0) { }

  public get code(): number { return this._code }
  public get body(): string { return this._body }
  public get headers(): OutgoingHttpHeaders { return this._headers }
  public get cookies(): (Cookie & CookieOptions)[] { return this._cookies }
  public get contentLength(): number { return this._length }
  public get filePath(): string | null { return this._filePath }
  public get templatePath(): string | null { return this._templatePath }
  public get templateData(): {} | null { return this._templateData }
  public get buffer(): Buffer | null { return this._buffer }

  public setContentLength(length: number) {
    this._length = length
    return this
  }

  public setCode(code: number) {
    this._code = code
    return this
  }

  public setBody(body: string) {
    this._body = body
    return this
  }

  public setBuffer(data: Buffer) {
    this._buffer = data
    return this.setContentLength(data.byteLength)
  }

  public setFile(path: string, code: number = 200) {
    this._filePath = path
    return this.setCode(code)
  }

  public clearHeaders() {
    this._headers = {}
    return this
  }

  public setHeaders(headers: OutgoingHttpHeaders) {
    this._headers = Object.assign(this._headers, headers)
    return this
  }

  public setHeader(key: string, value: string) {
    this._headers[key] = value
    return this
  }

  public hasHeader(key: string) {
    for (let h in this._headers) {
      if (h.toLowerCase() == key.toLowerCase()) return true
    }
    return false
  }

  public setCookie(key: string, value: string, options: CookieOptions) {
    this._cookies.push(Object.assign<Cookie, CookieOptions>({ key, value }, options))
    return this
  }

  public deleteCookie(key: string, options?: CookieOptions) {
    this._cookies.push(
      Object.assign<Cookie, CookieOptions>({ key, value: '' },
        Object.assign<CookieOptions, CookieOptions>(options || {}, { expires: new Date(0, 0, 0) })
      )
    )
    return this
  }

  public render(path: string, data: {} = {}, code: number = 200) {
    this._templatePath = path
    this._templateData = data
    return this.setCode(code)
  }

  public json(data: any, code: number = 200) {
    return this
      .setBody(JSON.stringify(data))
      .setCode(code)
      .setHeader('Content-Type', 'application/json')
  }

  public html(data: string, code: number = 200) {
    return this
      .setBody(data)
      .setCode(code)
      .setHeader('Content-Type', 'text/html')
  }

  public download(name: string, path: string, code: number = 200) {
    return this
      .setFile(path)
      .setCode(code)
      .setHeader('Content-Disposition', `attachment; filename="${name}"`)
  }

  public file(path: string, code: number = 200) {
    return this
      .setFile(path)
      .setCode(code)
  }

  public get redirect() {
    let $this: Response = this
    return {
      /**
       * Redirects to a named route
       *
       * @param {string} name The name of the route
       * @returns
       */
      to(name: string) {
        let route = Router.findByName(name)
        return $this
          .setCode(302)
          .setHeader('Location', route ? route.path : '/')
      },
      /**
       * Redirects to a new location
       *
       * @param {string} path The url or path to redirect to
       * @returns
       */
      location(path: string) {
        return $this
          .setCode(302)
          .setHeader('Location', path)
      }
    }
  }

}