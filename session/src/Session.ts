import * as path from 'path'
import { CookieSerializeOptions, parse, serialize } from 'cookie'
import { Client, storagePath, getConfig, AppSettings } from '@red5/server'
import { Storage } from '@red5/storage'
import * as crypto from 'crypto'
import { stat, writeFile, rename, unlink } from 'fs'

export interface SessionItem {
  key: string
  value: any
  expires: Date | null
}

export interface SessionFlashItem {
  key: string
  value: any
  count: number
}

export interface SessionRecord {
  id: string | undefined | null
  items: SessionItem[]
  flash: SessionFlashItem[]
  creation: Date | undefined | null
  expires: Date | undefined | null
  csrf: string
  cookie: CookieSerializeOptions & { expires?: Date | number | undefined }
}

const SESSION_ROOT = 'framework/session'

export class Session {
  private readonly _originalRecord: SessionRecord = { id: null, creation: null, expires: null, csrf: '', cookie: { path: '/' }, items: [], flash: [] }
  private readonly _store: 'file' = 'file'
  private readonly _root: string = storagePath(SESSION_ROOT)

  private _started: boolean = false
  private _record: SessionRecord = this._originalRecord
  private store: Storage

  public constructor(private client: Client) {
    this.client.session = <any>this
    let app = getConfig('app') as AppSettings
    this._store = app.session && app.session.store ? app.session.store : 'file'
    this.store = Storage.mount('session')
  }

  /**
   * Starts an already active session or starts a new session
   *
   * @param {CookieSerializeOptions} options
   * @memberof Session
   */
  public async start(options?: CookieSerializeOptions) {
    // Check if the session has already been started
    if (this._started) return
    this._started = true
    if (options) this._record.cookie = options
    // Get the cookies
    let cookies = parse(<string>this.client.request.headers.cookie || '')
    // Get the cookie sessid
    this._record.id = cookies.sessid || this._generateHash()

    let expires
    if (options && options.expires instanceof Date) {
      expires = options && options.expires || undefined
    } else if (options && typeof options.expires == 'number') {
      expires = new Date(Date.now() + options.expires)
    }

    if (this._store == 'file') {
      const file = `${this._record.id}.sess`
      if (await this.store.exists(file)) {
        // A session with this id already exists, lets load it
        this._record = JSON.parse((await this.store.load(file)).toString())
        this._record.cookie.expires = expires
        this._record.expires = expires
      } else {
        // No session found start a new one
        this._record.creation = new Date
        this._record.expires = this._record.cookie.expires
        this._record.id = this._generateHash()
      }
    }
    this._record.flash.forEach(i => i.count++)
    this._setCookieHeader()
  }

  /**
   * Ends the current session and keeps the associated session data
   *
   * @memberof Session
   */
  public async end() {
    // The session hasn't been started yet
    if (!this._started) return
    // Remove the flashed items
    this._record.flash = this._record.flash.reduce<SessionFlashItem[]>((arr, itm) => itm.count > 0 ? arr : arr.concat(itm), [])
    await this._save()
    this._record = this._originalRecord
    this._started = false
  }

  /**
   * Ends the session and destroys the data associated with the session
   *
   * @async
   * @memberof Session
   */
  public async destroy() {
    // The session hasn't been started yet
    if (!this._started) return
    if (this._store == 'file') {
      let sessionPath = path.join(this._root, `${this._record.id}.sess`)
      await new Promise<void>(r => unlink(sessionPath, () => r()))
    }
    this._record = this._originalRecord
    this._started = false
    this._deleteCookieHeader()
  }

  /**
   * Regenerates the session id
   *
   * @memberof Session
   */
  public async regenerateId() {
    let sessionPath = path.join(this._root, `${this._record.id}.sess`)
    this._record.id = this._generateHash()
    let newSessionPath = path.join(this._root, `${this._record.id}.sess`)

    if (this._store == 'file') {
      let isFile = await new Promise(r => stat(sessionPath, (e, stat) => { return e ? r(false) : r(stat.isFile()) }))
      if (isFile) {
        // Rename the current session file to the new session file
        await new Promise(r => rename(sessionPath, newSessionPath, () => r()))
      } else {
        // Create a new session file
        await new Promise<void>(r => writeFile(newSessionPath, JSON.stringify(this._record), () => r()))
      }
    }

    // Set the new session id header
    this._setCookieHeader()
  }

  public generateCSRF(length: number = 32) {
    this._record.csrf = crypto.randomBytes(length).toString('hex')
  }

  /**
   * Gets the value of a session key
   *
   * @param {string} key The key to lookup
   * @param {*} [fallback=''] The value to fallback to if the key isn't found
   * @returns
   * @memberof Session
   */
  public get(key: string, fallback: any = '') {
    let item = this._record.items.find(i => i.key == key)
    if (!item) {
      let item = this._record.flash.find(i => i.key == key)
      if (item) return item.value
      else return fallback
    }
    return item.value
  }

  /**
   * Gets the value of a flashed session key
   *
   * @param {string} key The key to lookup
   * @param {*} [fallback=''] The value to fallback to if the key isn't found
   * @returns
   * @memberof Session
   */
  public flashed(key: string, fallback: any = '') {
    let item = this._record.flash.find(i => i.key == key)
    if (item) return item.value
    else return fallback
  }

  /**
   * Deletes an item from the session
   *
   * @param {string} key The item key
   * @returns
   * @memberof Session
   */
  public delete(key: string) {
    let idx = this._record.items.findIndex(i => i.key == key)
    if (idx > -1) return this._record.items.splice(idx, 1).length > 0
    return false
  }

  /**
   * Sets a value or updates an existing one.
   *
   * @param {string} key The key to set
   * @param {*} value The value to set
   * @param {(Date | null)} [expires=null] The time the key expires, `null` to never expire
   * @returns
   * @memberof Session
   */
  public set(key: string, value: any, expires: Date | null = null) {
    let itm = this._record.items.find(i => i.key == key)
    if (itm) itm.value = value
    else this._record.items.push({ key, value, expires })
    return this
  }

  /**
   * Sets a value that is good till the end of the next request
   *
   * @param {string} key The key to set
   * @param {*} value The value to set
   * @returns
   * @memberof Session
   */
  public flash(key: string, value: any) {
    let itm = this._record.flash.find(i => i.key == key)
    if (itm) itm.value = value
    else this._record.flash.push({ key, value, count: 0 })
    return this
  }

  /**
   * Gets the expiration date of the session
   *
   * @returns
   * @memberof Session
   */
  public expiration() {
    return this._record.expires
  }

  /**
   * Gets the expiration date of a session item
   *
   * @param {string} key
   * @returns
   * @memberof Session
   */
  public itemExpiration(key: string) {
    let item = this._record.items.find(i => i.key == key)
    if (item) return item.expires
    return null
  }

  /**
   * Updates the expiration of the session
   *
   * @param {(Date | null)} date The new expiration date `null` to never expire
   * @memberof Session
   */
  public increaseTTL(seconds: number) {
    let exp = this._record.expires ? this._record.expires.getTime() : new Date().getTime()
    this._record.expires = new Date(exp + (seconds * 1000))
    this._record.cookie.expires = this._record.expires
    this._setCookieHeader()
    return this._record.expires
  }

  /**
   * Updates the expiration of a session item
   *
   * @param {string} key The item key to update
   * @param {(Date | null)} date The new expiration date `null` to never expire
   * @returns
   * @memberof Session
   */
  public increaseItemTTL(key: string, seconds: number) {
    let item = this._record.items.find(i => i.key == key)
    if (!item) return
    let exp = item.expires ? item.expires.getTime() : new Date().getTime()
    item.expires = new Date(exp + (seconds * 1000))
    return item.expires
  }

  private async _save() {
    // let cookies = parse(<string>this.client.request.headers.cookie || '')
    // Get the cookie sessid
    // let id = cookies.sessid || ''
    if (this._record.id && this._store == 'file') {
      let session = `${this._record.id}.sess`
      let exists = await this.store.exists(session)
      if (!exists) {
        await this.store.save(session, JSON.stringify(this._record))
      }
    }
    return false
  }

  private _generateHash() {
    let md5 = crypto.createHash('md5')
    let hash = md5.update((Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + (Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + (Math.random() * Number.MAX_SAFE_INTEGER).toString(36))
    return hash.digest('hex').toString()
  }

  private _setCookieHeader() {
    this.client.response.setHeader('Set-Cookie', serialize('sessid', this._record.id || '', this._record.cookie))
  }

  private _deleteCookieHeader() {
    let options: object = JSON.parse(JSON.stringify(this._record.cookie))
    options = Object.assign(options, { expires: new Date(0, 0, 0) })
    this.client.response.setHeader('Set-Cookie', serialize('sessid', this._record.id || '', options))
  }
}