import { OutgoingHttpHeaders } from 'http'
import { Router } from 'red5'
import { Client } from './Client'

export class Response {

  private _filePath: string | null = null
  private _templatePath: string | null = null
  private _templateData: {} | null = null
  // private _media: MediaFile | null = null
  private _buffer: Buffer | null = null

  public constructor(private client: Client, public _body: string = '', public _headers: OutgoingHttpHeaders = {
    'Content-Type': 'text/html'
  }, public _code: number = 200, public _length: number = 0) { }

  public get code(): number { return this._code }
  public get body(): string { return this._body }
  public get headers(): OutgoingHttpHeaders { return this._headers }
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

  public render(path: string, data: {} = {}, code = 200) {
    this._templatePath = path
    this._templateData = data
    return this.setCode(code)
  }

  public setFile(path: string, code = 200) {
    this._filePath = path
    return this.setCode(code)
  }

  public setBuffer(data: Buffer) {
    this._buffer = data
    return this.setContentLength(data.byteLength)
  }

  public json(data: any, code = 200) {
    return this
      .setBody(JSON.stringify(data))
      .setCode(code)
      .setHeaders({ 'Content-Type': 'application/json' })
  }

  public html(data: string, code = 200) {
    return this
      .setBody(data)
      .setCode(code)
      .setHeaders({ 'Content-Type': 'text/html' })
  }

  public get redirect() {
    let $this: Response = this
    return {
      to: function (name: string) {
        let route = Router.findByName(name)
        return $this
          .setCode(302)
          .setHeader('Location', route ? route.path : '/')
      },
      location: function (path: string) {
        return $this
          .setCode(302)
          .setHeaders({ 'Location': path })
      }
    }
  }

}