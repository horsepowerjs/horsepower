import { DB, DBRaw, DBValue, RowDataPacket } from './DB';
import { Collection } from '@red5/server'

export interface FieldData {
  column: string
  value: any
}

type NonAbstractModel<T extends Model> = (new () => T) & typeof Model

export abstract class Model extends DB {

  /** @type {string} The table that this model belongs to */
  protected abstract $table: string

  /** @type {string} The table's primary key field or an array of fields that makeup the primary key */
  protected $primaryKey: string | string[] = 'id'

  /** @type {boolean} The primary key is assumed to be incrementing, disable this if it does not */
  protected $incrementing: boolean = true

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
          mod.set(k, row[k])
        }
      }
      return collection
    } else {
      let mod = new model()
      for (let k in data) {
        mod.set(k, data[k])
      }
      return mod
    }
  }

  private _init() {
    this.table(this.$table)
    this.$connection && super._connect(this.$connection)
  }

  public async get(): Promise<any[]> {
    this._init()
    return await super.get()
  }

  public set(column: string, value: any) {
    this.fieldData.push({ column, value })
    return this
  }

  public async save(): Promise<boolean> {
    // let tbl = DB.table(this.$table)
    // if (Array.isArray(this.$primaryKey)) {
    //   this.$primaryKey.forEach(key => {
    //     let data = this.fieldData.find(i => i.column == key)
    //     tbl.where(key, data && data.value || '')
    //   })
    // } else {
    //   let data = this.fieldData.find(i => i.column == this.$primaryKey)
    //   tbl.where(this.$primaryKey, data && data.value || '')
    // }
    // let item = await tbl.first()
    // if (!item) {
    let items: string[] = this.fieldData.map(i => [i.column, i.value]).flat()
    let queryParams = this.fieldData.map(i => '?? = ?').join(', ')
    return await DB.insert(`insert into ?? set  ${queryParams}`, ...[this.$table, ...items])
    // } else {
    //   console.log('here')
    // }
    // return true
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

  public static async find<T extends Model>(this: NonAbstractModel<T>, primaryKey: DBValue | object): Promise<T | null> {
    let c = Reflect.construct(this, []) as T
    c.table(c.$table)
    // If the primary key is a single value and the primary key data is not an object
    if (typeof c.$primaryKey == 'string' && typeof primaryKey != 'object') {
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

    // We now have something to query try and find the item in the database
    let first = await c.first()
    if (!first) return null
    return Model.convert(this, first)
  }

  public static async firstOrFail<T extends Model>(this: NonAbstractModel<T>, primaryKey: any | object): Promise<T> {
    let r = await this.find<T>(primaryKey)
    if (!r) throw new Error(`Could not find anything for "${this.name}"`)
    return r
  }

  public static async firstOrCreate<T extends Model>(this: NonAbstractModel<T>, primaryKey: any | object): Promise<T> {
    let r = await this.find<T>(primaryKey)
    if (r) return r
    return Reflect.construct(this, []) as T
  }

  public static async all<T extends Model>(this: NonAbstractModel<T>): Promise<Collection<T>> {
    let model = Reflect.construct(this, []) as T
    let items = await model.get()
    return Model.convert(this, items)
  }
}