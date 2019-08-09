import { DB, DBRaw, DBValue, RowDataPacket } from './DB';
import { Collection } from '@red5/server'

export interface FieldData {
  column: string
  value: any
}

type NonAbstractModel<T extends Model> = (new () => T) & typeof Model

export abstract class Model extends DB {

  /** @type {string} The table that this model belongs to */
  protected abstract $table: string = ''

  /** @type {string} The table's primary key field or an array of fields that makeup the primary key */
  protected $primaryKey: string | string[] = 'id'

  /** @type {boolean} The primary key is assumed to be incrementing, disable this if it does not */
  protected $incrementing: boolean = true

  /** @type {string[]} An array of columns that will be referenced when filling the model */
  protected $fillable: string[] = []

  /**
   * @type {string} An optional connection name that is defined in `config/db.js`.
   * If a connection name isn't set, then use the default connection defined in `config/db.js`.
   */
  protected $connection?: string

  /**
   * @type {[key: string]: any} Additional fields not specified in the database that are generated on the fly.
   */
  protected $attributes: { [key: string]: any } = {}

  private fieldData: FieldData[] = []

  protected constructor() {
    super()
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        let data = target.fieldData.find(i => i.column == prop)
        if (!data) return Reflect.get(target, prop, receiver)
        return data.value
      },
      set: (target, prop, value, receiver) => {
        let item = target.fieldData.find(i => i.column == prop)
        if (item) item.value = value
        else if (typeof target[prop] != 'undefined') Reflect.set(target, prop, value, receiver)
        else target.fieldData.push({ column: <string>prop, value })
        return true
      }
    })
  }

  [Symbol.iterator]() {
    let idx = -1
    let data = this.fieldData
    return {
      next: () => {
        return data[idx + 1] ?
          { value: data[++idx].value, done: false } :
          { done: true }
      }
    }
  }

  /**
   * Converts Database data to a model or collection of models
   */
  public static convert<T extends Model>(model: NonAbstractModel<T>, data: RowDataPacket): T
  public static convert<T extends Model>(model: NonAbstractModel<T>, data: RowDataPacket[]): Collection<T>
  public static convert<T extends Model>(model: NonAbstractModel<T>, data: RowDataPacket | RowDataPacket[]): Collection<T> | T {
    if (Array.isArray(data)) {
      let collection = new Collection<T>()
      for (let row of data) {
        let mod = new model()
        collection.add(mod)
        for (let k in row) {
          mod.setOrAddItem(k, row[k])
        }
      }
      return collection
    } else {
      let mod = new model()
      for (let k in data) {
        mod.setOrAddItem(k, data[k])
      }
      return mod
    }
  }

  private _init() {
    this.table(this.$table)
    super._connect(this.$connection)
  }

  public fill(items: Collection<{ key: string, value: any }>) {
    for (let item of items) {
      if (this.$fillable.length == 0 || this.$fillable.includes(item.key)) {
        this.setOrAddItem(item.key, item.value)
      }
    }
  }

  public async get(): Promise<any[]> {
    this._init()
    return await super.get()
  }

  /** @internal */
  private setOrAddItem(column: string, value: any) {
    let record = this.fieldData.find(i => i.column == column)
    if (record) record.value = value
    else this.fieldData.push({ column, value })
    return this
  }

  public async save(): Promise<boolean> {
    let items: string[] = this.fieldData.reduce<string[]>((a, i) => a.concat(i.column, i.value), [])
    let queryParams = this.fieldData.map(i => '?? = ?').join(', ')
    return await DB.insert(`
    insert into ?? set ${queryParams}
    on duplicate key update
      ${queryParams}
    `, ...[this.$table, ...items, ...items])
  }

  public async exists(...fields: string[]): Promise<boolean> {
    let tbl = DB.table(this.$table)
    if (fields.length > 0) {
      for (let fld of fields) {
        let data = this.fieldData.find(i => i.column == fld)
        tbl.where(fld, data && data.value || '')
      }
    }
    return !!((await tbl.setSelect(new DBRaw('1')).get()).length)
  }

  public async chunk(rows: number, callback: (rows: any[]) => void): Promise<void>
  public async chunk(callback: (rows: any[]) => void): Promise<void>
  public async chunk(...args: (number | Function)[]): Promise<void> {
    this._init()
    let rows = (args.length == 2 ? args[0] : 10) as number
    let callback = (args.length == 1 ? args[0] : args[1]) as (rows: any[]) => void
    return await super.chunk(rows, callback)
  }

  private static _makeFindQuery<T extends Model>(primaryKey: any) {
    let c = Reflect.construct(this, []) as T

    // If the primary key is a string value and the primary key data is an array
    if (typeof c.$primaryKey == 'string' && Array.isArray(primaryKey)) {
      c.whereIn(c.$primaryKey, primaryKey)
    }

    // If the primary key is a single value and the primary key data is not an object
    else if (typeof c.$primaryKey == 'string' && typeof primaryKey != 'object') {
      c.where(c.$primaryKey, primaryKey)
    }

    // If the primary key columns value is an array of strings and the primary key data is an object
    else if (Array.isArray(c.$primaryKey) && typeof primaryKey == 'object') {
      for (let k of c.$primaryKey) {
        c.where(k, primaryKey[k])
      }
    }

    // Nothing matched return
    else {
      return null
    }
    return c
  }

  public static async find<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue | object): Promise<T | null>
  public static async find<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue[] | object[]): Promise<Collection<T>>
  public static async find<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue | object | DBValue[] | object[]): Promise<Collection<T> | T | null> {

    let c = this._makeFindQuery(primaryKey)
    if (!c) return null

    // We now have something to query try and find the item in the database
    let items = await c.get()

    // If no item was found in the database return null
    if (!items.length) return null

    // If an item was found return the model
    return Model.convert(this, items.length > 1 ? items : items[0])
  }

  public static async findOrFail<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue[] | object[]): Promise<Collection<T>>
  public static async findOrFail<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue | object): Promise<T | null>
  public static async findOrFail<T extends Model>(this: NonAbstractModel<T>, primaryKey: any | object | DBValue[] | object[]): Promise<Collection<T> | T> {
    let r = await this.find<T>(primaryKey) as Collection<T> | T | null
    if ((r instanceof Collection && r.length == 0) || !r) throw new Error(`Could not find any Models for "${this.name}"`)
    return r
  }

  public static async first<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue | object): Promise<T | null> {

    let c = this._makeFindQuery(primaryKey)
    if (!c) return null

    // We now have something to query try and find the item in the database
    let item = await c.first()

    // If no item was found in the database return null
    if (!item) return null

    // If an item was found return the model
    return Model.convert(this, item)
  }

  public static async firstOrFail<T extends Model>(this: NonAbstractModel<T>, primaryKey: any | object): Promise<T> {
    let r = await this.first<T>(primaryKey)
    if (!r) throw new Error(`Could not find a Model for "${this.name}"`)
    return r
  }

  public static async firstOrCreate<T extends Model>(this: NonAbstractModel<T>, primaryKey: any | object): Promise<T> {
    let r = await this.first<T>(primaryKey)
    if (r) return r
    return Reflect.construct(this, []) as T
  }

  public static async all<T extends Model>(this: NonAbstractModel<T>): Promise<Collection<T>> {
    let model = Reflect.construct(this, []) as T
    let items = await model.get()
    return Model.convert(this, items)
  }
}