import { DB, DBRaw, RowDataPacket } from './DB';

export interface FieldData {
  column: string
  value: any
}

export abstract class Model extends DB {

  /** @type {string} The table that this model belongs to */
  protected abstract $table: string

  /** @type {string} The table's primary key field or an array of fields that makeup the primary key */
  protected $primaryKey: string | string[] = 'id'

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
    return true
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

  public static async find<T extends Model>(primaryKey: any | object): Promise<RowDataPacket | null> {
    let c = new this() as T
    if (typeof c.$primaryKey == 'string') {
      c.where(c.$primaryKey, primaryKey)
    } else if (Array.isArray(c.$primaryKey) && typeof primaryKey == 'object') {
      for (let k of c.$primaryKey) {
        c.where(k, primaryKey[k])
      }
    }
    return await c.first()
  }

  public static async findOrFail(primaryKey: any | object): Promise<RowDataPacket | null> {
    let r = await this.find(primaryKey)
    if (!r) throw new Error(`Could not find anything for ${this.constructor.name}`)
    return r
  }

  public static async findOrCreate<T extends Model>(primaryKey: any | object) {
    let r = await this.find(primaryKey)
    if (r) return r
    return new this() as T
  }
}