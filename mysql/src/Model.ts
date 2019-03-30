import { DB } from './DB';

declare type ChunkType = [number, number, ((results: any[]) => void)] | [number, ((results: any[]) => void)]

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

  private init() {
    this.table(this.$table)
    this.$connection && super.connect(this.$connection)
  }

  public async get(): Promise<any[]> {
    this.init()
    return await super.get()
  }

  public async chunk(max: number, offset: number, callback: (results: any[]) => void): Promise<DB>
  public async chunk(max: number, callback: (results: any[]) => void): Promise<DB>
  public async chunk(...args: ChunkType): Promise<DB> {
    this.init()
    return await super.chunk(...args)
  }
}