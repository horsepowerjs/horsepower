import * as path from 'path'
import { CookieSerializeOptions, parse, serialize } from 'cookie'
import { Client, storagePath, getConfig, AppSettings } from '@red5/server'
import * as crypto from 'crypto'
import { stat, readFile, writeFile } from 'fs'

export interface SessionItem {
  key: string
  value: any
  expires: Date | null
}

export interface SessionRecord {
  id: string | null
  items: SessionItem[]
  expires: Date | null
  csrf: string
  options: CookieSerializeOptions
}

const SESSION_ROOT = 'framework/session'

export class Session {
  // private _database: string = 'sessions'
  // private _closed: boolean = false
  private _started: boolean = false
  private _originalRecord: SessionRecord = { id: null, items: [], expires: null, csrf: '', options: { path: '/' } }
  private _record: SessionRecord = this._originalRecord

  public constructor(private client: Client) {
    this.client.session = <any>this
  }

  public async start(options?: CookieSerializeOptions) {
    if (this._started) return
    this._started = true
    if (options) this._record.options = options
    // Get the cookies
    let cookies = parse(<string>this.client.request.headers.cookie || '')
    // Get the cookie sessid
    this._record.id = cookies.sessid || this._generateHash()
    let app = getConfig('app') as AppSettings
    let store = app.session && app.session.store ? app.session.store : 'file'
    if (store == 'file') {
      let sessionStoragePath = storagePath(path.join(SESSION_ROOT, `${this._record.id}.sess`))
      let isFile = await new Promise(r => stat(sessionStoragePath, (e, stat) => { return e ? r(false) : r(stat.isFile()) }))
      if (isFile) {
        this._record = await new Promise<SessionRecord>(r => readFile(sessionStoragePath, (e, data) => r(JSON.parse(data.toString()))))
      } else {
        await new Promise<void>(r => writeFile(sessionStoragePath, JSON.stringify(this._record), () => r()))
      }
    }
    this.client.response.setHeader('Set-Cookie', serialize('sessid', this._record.id || '', this._record.options))
  }

  public async end() {
    await this._save()
    this._record = this._originalRecord
  }

  private _generateHash() {
    let md5 = crypto.createHash('md5')
    let hash = md5.update((Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + (Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + (Math.random() * Number.MAX_SAFE_INTEGER).toString(36))
    return hash.digest('hex').toString()
  }

  public generateCSRF(length: number = 32) {
    this._record.csrf = crypto.randomBytes(length).toString('hex')
  }

  /**
   * Gets the value of a session key
   *
   * @param {string} key The key to look up
   * @param {*} [fallback=''] The value to fallback to if the key isn't found
   * @returns
   * @memberof Session
   */
  public get(key: string, fallback: any = '') {
    let item = this._record.items.find(i => i.key == key)
    if (!item) return fallback
    return item.value
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
   * Sets a key value or updates an existing one.
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
    this._save()
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
    this._record.options.expires = this._record.expires
    this.client.response.setHeader('Set-Cookie', serialize('sessid', this._record.id || '', this._record.options))
    this._save()
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
    this._save()
    return item.expires
  }

  private async _save() {
    let cookies = parse(<string>this.client.request.headers.cookie || '')
    // Get the cookie sessid
    let id = cookies.sessid || ''
    let app = getConfig('app') as AppSettings
    let store = (app.session && app.session.store ? app.session.store : 'file').toLowerCase()
    if (store == 'file') {
      let session = storagePath(path.join(SESSION_ROOT, `${id}.sess`))
      let isFile = await new Promise(r => stat(session, (e, stat) => { return e ? r(true) : r(stat.isFile()) }))
      if (!isFile) {
        await new Promise<SessionRecord>(r => writeFile(session, JSON.stringify(this._record), () => r()))
        return true
      }
    }
    return false
  }

  // private static confFile = ''
  // public static setConfigFile(confFile: string) {
  //   this.confFile = confFile
  // }

  // private _record: AdminSessionModel = {
  //   id: '',
  //   ttl: new Date(),
  //   csrf: '',
  //   flash: [],
  //   cookie: {
  //     path: '/'
  //   },
  //   data: {}
  // }

  // public get csrf(): string { return this._record.csrf }


  // public async start(options?: CookieSerializeOptions) {
  //   if (this._started) return
  //   this._started = true
  //   // Get the cookies
  //   let cookies = cookie.parse(<string>this.req.headers.cookie || '')
  //   // Get the cookie sessid
  //   let id = cookies.sessid || ''
  //   // Try to find the record in the database
  //   let record = await mongoClient.select<AdminSessionModel>(this._database, { id }, 1)
  //   if (!record) {
  //     // Create the session information
  //     this._createSession(options)
  //     // Save the session information
  //     await mongoClient.insert<AdminSessionModel>(this._database, this._record)
  //     return
  //   }
  //   this._record = record
  //   // Send the new cookie info to the client
  //   this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', this._record.id, this._record.cookie))
  // }

  // /**
  //  * Increases the expiration by "x" seconds
  //  *
  //  * @param {number} seconds The number of seconds
  //  * @memberof Session
  //  */
  // public increaseTTL(seconds: number) {
  //   this._record.ttl = new Date(this._record.ttl.getTime() + (seconds * 1000))
  //   this._record.cookie.expires = this._record.ttl
  //   this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', this._record.id, this._record.cookie))
  // }

  // /**
  //  * Sets the expiration "x" seconds into the future.
  //  *
  //  * @param {number} seconds The number of seconds
  //  * @memberof Session
  //  */
  // public setTTL(seconds: number) {
  //   this._record.ttl = new Date(Date.now() + (seconds * 1000))
  //   this._record.cookie.expires = this._record.ttl
  //   this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', this._record.id, this._record.cookie))
  // }

  // /**
  //  * Destroys the current session.
  //  *
  //  * @memberof Session
  //  */
  // public async destroy() {
  //   // Set the expiration to 1 year ago
  //   let newDate = new Date(Date.now() - 3.154e10)
  //   this._record.cookie.expires = newDate
  //   this._record.ttl = newDate
  //   this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', this._record.id, this._record.cookie))
  // }

  // /**
  //  * Writes the session data to disk.
  //  *
  //  * @memberof Session
  //  */
  // public async close() {
  //   if (this._closed || !this._started) return
  //   this._closed = true
  //   // Remove the flashed items
  //   this._unflash()
  //   // Increment flashed items that still exist
  //   this._record.flash.forEach(i => i.hits++)
  //   // Update the mongo database
  //   await mongoClient.update(this._database, { id: this._record.id }, { $set: this._record })
  // }

  // /**
  //  * Regenerates the session id.
  //  *
  //  * @static
  //  * @memberof Session
  //  */
  // public async regenerate() {
  //   let currId = this._record.id
  //   this._createSession()
  //   await mongoClient.update(this._database, { id: currId }, { $set: this._record })
  // }


  // /**
  //  * Sets a session value that only lives through the subsequent request
  //  *
  //  * @param {string} key The key to save. Supports nested objects by dot separator.
  //  * @param {*} value The value to save in the key.
  //  * @memberof Session
  //  */
  // public flash(key: string, value: any) {
  //   this.set(key, value)
  //   this._record.flash.push({ key, hits: 0 })
  // }

  // /**
  //  * Sets a key in the session data.
  //  *
  //  * @param {string} key The key to save. Supports nested objects by dot separator.
  //  * @param {*} value The value to save in the key.
  //  * @memberof Session
  //  */
  // public set(key: string, value: any) {
  //   let path = key.split('.')
  //   let target = path.pop() as string
  //   function setItm(obj: any) {
  //     if (path.length == 0) {
  //       obj[target] = value
  //       return
  //     }
  //     let itm = path.shift() as string
  //     if (!obj[itm]) obj[itm] = {}
  //     setItm(obj[itm])
  //     return obj
  //   }
  //   setItm(this._record.data)
  // }

  // /**
  //  * Gets an item from the session data.
  //  *
  //  * @param {string} key The key to find. Supports nested objects by dot separator.
  //  * @param {*} [defaultValue='']
  //  * @returns
  //  * @memberof Session
  //  */
  // public get(key: string, defaultValue: any = '') {
  //   let path = key.split('.')
  //   let data = path.reduce((obj, key) => typeof obj == 'object' ? obj[key] : null, this._record.data)
  //   return data || defaultValue
  // }

  // /**
  //  * Deletes an item from the object
  //  *
  //  * @param {string} key The key to find. Supports nested objects by dot separator.
  //  * @memberof Session
  //  */
  // public remove(key: string) {
  //   let path = key.split('.')
  //   let keyParent = path
  //     // Get new array without last item
  //     .slice(0, path.length - 1)
  //     // Reduce the data
  //     .reduce((obj, key) => obj != undefined ? obj[key] : undefined, this._record.data)
  //   // If we have something, delete it
  //   if (typeof keyParent != 'undefined' || keyParent != undefined) delete keyParent[path[path.length - 1]]
  // }

  // /**
  //  * Checks if the key exists.
  //  *
  //  * @param {string} key The key to find. Supports nested objects by dot separator.
  //  * @returns
  //  * @memberof Session
  //  */
  // public is(key: string) {
  //   return !!this.get(key, false)
  // }

  // private _updateId() {
  //   this._record.id = crypto.createHash('md5').update(((Math.random() * 1e6) + Date.now()).toString()).digest('hex').toString()
  // }

  // private _createSession(options?: CookieSerializeOptions) {
  //   // Create a new session id
  //   this._updateId()
  //   this.setTTL(60 * 60 * 24 * 7)
  //   // Merge the cookie options with the default options
  //   this._record.cookie = Object.assign(this._record.cookie, options)
  //   // Send the cookie info to the client
  //   this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', this._record.id, this._record.cookie))
  // }

  // private _unflash() {
  //   // Find items that need to be removed
  //   let toRemove = this._record.flash.filter(i => i.hits > 0)
  //   let i = toRemove.length
  //   while (i--) {
  //     let idx = this._record.flash.findIndex(c => c.key == toRemove[i].key)
  //     // Delete the flashed item and it's reference
  //     this._record.flash.splice(idx, 1)
  //     this.remove(toRemove[i].key)
  //   }
  // }
}