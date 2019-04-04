import { DB } from './DB';

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

  public async chunk(rows: number, callback: (rows: any[]) => void): Promise<void>
  public async chunk(callback: (rows: any[]) => void): Promise<void>
  public async chunk(...args: (number | Function)[]): Promise<void> {
    this._init()
    let rows = (args.length == 2 ? args[0] : 10) as number
    let callback = (args.length == 1 ? args[0] : args[1]) as (rows: any[]) => void
    return await super.chunk(rows, callback)
  }
}