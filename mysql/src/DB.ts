import * as mysql from 'mysql'
import { configPath } from '@red5/server'

declare type DBValue = string | number | DBRaw
declare type DBComp = '=' | '<' | '>' | '>=' | '<=' | '!=' | '<>'
declare type DBSort = 'asc' | 'desc'
declare type DBWhereType = 'and' | 'or'

interface DBPaginate {
  /**
   * The results for the current page
   *
   * @type {any[]}
   * @memberof DBPaginate
   */
  results: any[]
  /**
   * The number of results for the current page
   *
   * @type {number}
   * @memberof DBPaginate
   */
  count: number
  /**
   * The total number of results for all pages
   *
   * @type {number}
   * @memberof DBPaginate
   */
  total: number
  /**
   * The total number of pages
   *
   * @type {number}
   * @memberof DBPaginate
   */
  pages: number
  /**
   * The current starting offset of the result set (zero based)
   *
   * @type {number}
   * @memberof DBPaginate
   */
  offset: number
  /**
   * The start position and end position of the current result set (non-zero based)
   *
   * @type {{ start: number, end: number }}
   * @memberof DBPaginate
   */
  range: {
    /**
     * The starting position
     *
     * @type {number}
     */
    start: number,
    /**
     * The ending position
     *
     * @type {number}
     */
    end: number
  }
  /**
   * A test of whether or not this is the last page in the result set
   *
   * @type {boolean}
   * @memberof DBPaginate
   */
  lastPage: boolean
}

interface DBConfig {
  default?: boolean
  driver: string
  database: string
  username: string
  password: string
  hostname: string
  port?: number
}

interface DBConfigs {
  [key: string]: DBConfig
}

interface DBPool {
  name: string
  pool: mysql.Pool
}

class DBKeyVal {
  public constructor(
    public readonly column: string,
    public readonly comp: DBComp,
    public readonly value: DBValue,
    public readonly type: DBWhereType = 'and'
  ) { }
}
class DBRaw {
  public constructor(
    public readonly value: string,
    public readonly replacements: any[] = [],
    public readonly type: DBWhereType = 'and'
  ) { }
}

class DBBetween {
  public constructor(
    public readonly column: string,
    public readonly value1: any,
    public readonly value2: any,
    public readonly not: boolean,
    public readonly type: DBWhereType = 'and'
  ) { }
}

class DBIn {
  public constructor(
    public readonly column: string,
    public readonly items: any[],
    public readonly not: boolean,
    public readonly type: DBWhereType = 'and'
  ) { }
}

class DBNull {
  public constructor(
    public readonly column: string,
    public readonly not: boolean,
    public readonly type: DBWhereType = 'and'
  ) { }
}

const operators = ['=', '<', '>', '>=', '<=', '!=', '<>']

export class DB {
  private static _connectionPools: DBPool[] = []
  private static _configuration?: DBConfigs

  private _pool?: mysql.Pool
  private _connName?: string

  private _table?: string
  private _limit?: number
  private _limitStart?: number
  private _distinct: boolean = false

  private _groupBy: { column: string, sort: DBSort }[] = []
  private _orderBy: { column: string, sort: DBSort }[] = []
  private _where: (DBKeyVal | DBRaw | DBBetween | DBIn | DBNull)[] = []
  private _having: (DBKeyVal | DBRaw | DBBetween | DBIn | DBNull)[] = []
  private _select: (string | DBRaw)[] = []

  private _placeholders: DBValue[] = []

  /**
   * DB should not be instantiated outside of itself.
   */
  protected constructor() { }

  public static table(name: string) {
    let db = new DB
    db._table = name
    return db
  }

  public static connect(name: string, table = '') {
    let db = new DB
    db.table(table)
    db._connName = name
    return this
  }

  protected async connect(name: string | undefined) {
    return new Promise(resolve => {
      // Get the configurations from file if it hasn't been read yet
      if (!DB._configuration) DB._configuration = require(configPath('db')) as DBConfigs

      // Find the requested configuration within the configurations
      let [alias, db] = Object.entries(DB._configuration).find(e => {
        let key = e[0], value = e[1], n = (name || '').trim().length
        if (n > 0 && key == name) return true
        if (n == 0 && value.default === true && value.driver.toLowerCase() == 'mysql') return true
        return false
      }) || [null, null]

      // Attempt to find a pool in the connection pools if there isn't a reference set
      if (!this._pool) {
        let pool = DB._connectionPools.find(i => i.name == alias)
        if (pool) {
          this._pool = pool.pool
          return resolve(true)
        }
      }

      // If a pool still hasn't been found create a new pool
      if (db && alias && !this._pool) {
        if (this._pool) return resolve(true)
        let pool = mysql.createPool({
          host: db.hostname,
          user: db.username,
          password: db.password,
          database: db.database,
          port: db.port || 3306
        })
        this._pool = pool
        DB._connectionPools.push({ name: <string>alias, pool })
        resolve(true)
      } else {
        resolve(true)
      }
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  /// Begin: Methods that transform queries
  //////////////////////////////////////////////////////////////////////////////

  public table(name: string) {
    this._table = name
    return this
  }

  public limit(limit: number | undefined, offset: number | undefined = 0) {
    this._limit = limit
    this._limitStart = offset
    return this
  }

  public orderBy(column: string, sort: DBSort = 'asc') {
    this._orderBy.push({ column, sort })
    return this
  }

  public groupBy(column: string, sort: DBSort = 'asc') {
    this._groupBy.push({ column, sort })
    return this
  }

  public distinct() {
    this._distinct = true
    return this
  }

  public select(...column: (string | DBRaw)[]) {
    this._select = this._select.concat(...column)
    return this
  }

  public setSelect(...column: (string | DBRaw)[]) {
    this._select = column
    return this
  }

  public where(column: string, comp: DBComp, value: DBValue): DB
  public where(column: string, value: DBValue): DB
  public where(raw: DBRaw): DB
  public where(...args: any[]): DB {
    if (args[0] instanceof DBRaw) {
      this._where.push(args[0])
    } else {
      this._addFilter('where', 'and', ...args)
    }
    return this
  }

  public orWhere(column: string, comp: DBComp, value: DBValue): DB
  public orWhere(column: string, value: DBValue): DB
  public orWhere(...args: any[]): DB {
    this._addFilter('where', 'or', ...args)
    return this
  }

  public whereIn(column: string, items: any[]) {
    this._where.push(new DBIn(column, items, false, 'and'))
    // this._addWhere()'and', column, items)
    return this
  }

  public whereNotIn(column: string, items: any[]) {
    this._where.push(new DBIn(column, items, true, 'and'))
    // this._addWhere()'and', column, items)
    return this
  }

  public whereBetween(column: string, value1: any, value2: any, type: DBWhereType = 'and') {
    this._where.push(new DBBetween(column, value1, value2, false, type))
    return this
  }

  public whereNotBetween(column: string, value1: any, value2: any, type: DBWhereType = 'and') {
    this._where.push(new DBBetween(column, value1, value2, true, type))
    return this
  }

  public whereNull(column: string) {
    this._where.push(new DBNull(column, false))
    return this
  }

  public whereNotNull(column: string) {
    this._where.push(new DBNull(column, true))
    return this
  }


  public having(column: string, comp: DBComp, value: DBValue): DB
  public having(column: string, value: DBValue): DB
  public having(raw: DBRaw): DB
  public having(...args: any[]): DB {
    if (args[0] instanceof DBRaw) {
      this._having.push(args[0])
    } else {
      this._addFilter('having', 'and', ...args)
    }
    return this
  }

  public orHaving(column: string, comp: DBComp, value: DBValue): DB
  public orHaving(column: string, value: DBValue): DB
  public orHaving(raw: DBRaw): DB
  public orHaving(...args: any[]): DB {
    this._addFilter('having', 'or', ...args)
    return this
  }

  private _addFilter(addTo: 'where' | 'having', ...args: any[]) {
    let type = args[0], column = args[1], comp: DBComp = '=', value = ''

    if (args.length == 4) {
      comp = args[2]
      value = args[3]
    } else if (args.length == 3) {
      value = args[2]
    }
    if (addTo == 'where') this._where.push(new DBKeyVal(column, comp, value, type))
    else if (addTo == 'having') this._having.push(new DBKeyVal(column, comp, value, type))
    return this
  }

  //////////////////////////////////////////////////////////////////////////////
  /// End: Methods that transform queries
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  /// Begin: Methods that initiate queries
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Connects to the database if no connection is found then executes the query
   *
   * @returns
   * @memberof DB
   */
  public async get() {
    await this.connect(this._connName)
    let query = this.buildSelectString()
    console.log(query, '=>', this._placeholders)
    return new Promise<any[]>(resolve => {
      this._pool && this._pool.getConnection((err, connection) => {
        if (err) return resolve([])
        connection.query(query, this._placeholders, (error, results: any[]) => {
          connection.release()
          if (error) throw error
          resolve(results)
        })
      })
      // if (!this.pool) return resolve([])
    })
  }

  /**
   * Gets the first row in the result set
   *
   * @returns
   * @memberof DB
   */
  public async first() {
    let s = this._limit, sl = this._limitStart
    let row = (await this.limit(1, 0).get())[0]
    this.limit(s, sl)
    return row
  }

  /**
   * Executes a query multiple times incrementing the offset until no more results are found
   *
   * @param {number} max
   * @param {number} offset
   * @param {(results: any[]) => void} callback
   * @returns {Promise<DB>}
   * @memberof DB
   */
  public async chunk(max: number, offset: number, callback: (results: any[]) => void): Promise<DB>
  /**
   * Executes a query multiple times incrementing the offset until no more results are found
   *
   * @param {number} max
   * @param {(results: any[]) => void} callback
   * @returns {Promise<DB>}
   * @memberof DB
   */
  public async chunk(max: number, callback: (results: any[]) => void): Promise<DB>
  public async chunk(...args: (number | Function)[]): Promise<DB> {
    let count = 0
    let max = args[0] as number
    let offset = (args.length == 3 ? args[1] : 0) as number
    let callback = (args.length == 3 ? args[2] : args[1]) as Function
    let oLim = this._limit, oOff = this._limitStart
    do {
      // Set the limit for the next query
      this.limit(max, offset)
      // Get the results
      let results = await this.get()
      // Update the offset
      offset += results.length
      // Update the count
      count = results.length
      // Only run the callback if the result count is greater than 0
      count > 0 && callback(await results)
    } while (count == max && max > 0)

    // Reset the original limit settings
    this.limit(oLim, oOff)
    return this
  }

  /**
   * Gets a count of results that would be found
   *
   * @returns
   * @memberof DB
   */
  public async count() {
    let select = this._select
    let count = (await this.setSelect(new DBRaw('count(*) as c')).get())[0]['c']
    this.setSelect(...select)
    return <Promise<number>>count
  }

  public async max(column: string) {
    let select = this._select
    let max = (await this.setSelect(new DBRaw('max(??) as m', [column])).get())[0]['m']
    this.setSelect(...select)
    return <Promise<any>>max
  }

  public async min(column: string) {
    let select = this._select
    let min = (await this.setSelect(new DBRaw('min(??) as m', [column])).get())[0]['m']
    this.setSelect(...select)
    return <Promise<any>>min
  }

  public async avg(column: string) {
    let select = this._select
    let avg = (await this.setSelect(new DBRaw('avg(??) as m', [column])).get())[0]['m']
    this.setSelect(...select)
    return <Promise<any>>avg
  }

  public async sum(column: string) {
    let select = this._select
    let sum = (await this.setSelect(new DBRaw('sum(??) as s', [column])).get())[0]['s']
    this.setSelect(...select)
    return <Promise<any>>sum
  }

  public async exists() {
    let select = this._select
    let len = (await this.setSelect(new DBRaw('1')).get()).length
    this.setSelect(...select)
    return len > 0
  }

  public async doesntExist() {
    let select = this._select
    let exists = await this.exists()
    this.setSelect(...select)
    return !exists
  }

  /**
   * Gets the results with a limit and the total number of results if the limit were removed
   *
   * @returns
   * @memberof DB
   */
  public async calcFoundRows() {
    // Get the original values
    let limit = this._limit, limitStart = this._limitStart, select = this._select

    // Get the results
    let results = await this.get()

    // Get the results without a limit and with a count(*)
    this.limit(undefined, undefined).setSelect(new DBRaw('count(*) as c'))
    let total = (await this.get())[0]['c']

    // Reset the values back to their original values
    this.limit(limit, limitStart).setSelect(...select)

    // Return the data
    return { results, total }
  }

  /**
   * Gets query information based on the current page and the results per page
   *
   * @param {number} page The current page
   * @param {number} resultsPerPage The number of results per page
   * @returns
   * @memberof DB
   */
  public async paginate(page: number, resultsPerPage: number) {
    // Set 'page' and 'resultsPerPage' to 1 if the value is less than 1 or contains non-digit values
    page = page < 1 || !/\d+/.test(page.toString()) ? 1 : page
    resultsPerPage = resultsPerPage < 1 || !/\d+/.test(resultsPerPage.toString()) ? 1 : resultsPerPage

    // Get the original values
    let limit = this._limit, limitStart = this._limitStart, select = this._select

    // Set the limit and get the query info
    let offset = (page - 1) * resultsPerPage
    let info = await this.limit(resultsPerPage, offset).calcFoundRows()

    // Reset the values back to their original values
    // This happens in 'calcFoundRows', however we need to do it again
    this.limit(limit, limitStart).setSelect(...select)

    // Get the number of pages if 'resultsPerPage' is greater than '0'
    let pages = Math.ceil(info.total / resultsPerPage)

    return <DBPaginate>{
      results: info.results,
      count: info.results.length,
      total: info.total,
      pages,
      offset,
      range: { start: offset + 1, end: offset + info.results.length },
      lastPage: pages == page
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  /// End: Methods that initiate queries
  //////////////////////////////////////////////////////////////////////////////

  public buildSelectString() {
    if (!this._table) throw new Error('Table name not set')

    this._placeholders = []
    // Create the column list string
    let columns = this._select.length == 0 ? '*' : this._select.map(i => {
      if (i instanceof DBRaw) return i.value
      if (/\(|\*|,|\)/.test(i)) return i
      return '??'
    }).join(', ')
    this._placeholders.push(...(<string[]>this._select.filter(i => i instanceof DBRaw || !(/\(|\*|,|\)/.test(i)))))
    this._placeholders = this._placeholders.reduce<DBValue[]>((arr, itm) => {
      if (itm instanceof DBRaw) return arr.concat(itm.replacements)
      return arr.concat(itm)
    }, [])

    // Create the initial select string
    let str = [`select ${this._distinct ? 'distinct' : ''} ${columns} from ??`]
    this._placeholders.push(this._table)

    // If there are where items, build the where item list
    if (this._where.length > 0) {
      let where = this._getFilter(this._where)
      str.push(`where ${where}`)
    }

    // If there is grouping group the items
    if (this._groupBy.length > 0) {
      str.push(`group by ${this._groupBy.map(i => `?? ${i.sort}`).join(', ')}`)
      this._placeholders.push(...this._groupBy.map(i => i.column))
    }

    if (this._having.length > 0) {
      let having = this._getFilter(this._having)
      str.push(`having ${having}`)
    }

    // If there is ordering order the items
    if (this._orderBy.length > 0) {
      str.push(`order by ${this._orderBy.map(i => `?? ${i.sort}`).join(', ')}`)
      this._placeholders.push(...this._orderBy.map(i => i.column))
    }

    // If there is a limit
    if (this._limit && this._limit > 0) {
      str.push(`limit ${this._limitStart || 0}, ${this._limit}`)
    }
    // console.log(str.join(' '))
    return str.join(' ')
  }

  private _getFilter(filters: any[]) {
    return filters.map((i, idx) => {
      if (i instanceof DBRaw) {
        this._placeholders.push(...i.replacements)
        return i.value
      } else if (i instanceof DBBetween) {
        this._placeholders.push(i.column, i.value1, i.value2)
        return `${idx == 0 ? '' : i.type} ?? ${i.not ? 'not' : ''} between ? and ?`
      } else if (i instanceof DBIn) {
        this._placeholders.push(i.column, ...i.items)
        return `${idx == 0 ? '' : i.type} ?? ${i.not ? 'not' : ''} in(${i.items.map(v => '?').join(',')})`
      } else if (i instanceof DBNull) {
        this._placeholders.push(i.column)
        return `${idx == 0 ? '' : i.type} ?? ${i.not ? 'not' : ''} null`
      } else if (i instanceof DBKeyVal) {
        this._placeholders.push(i.column, i.value)
        return `${idx == 0 ? '' : i.type} ?? ${operators.includes(i.comp) ? i.comp : '='} ?`.trim()
      }
    }).join(' ')
  }

  // private tickItem(item: string) {
  //   return item.replace(/(\w+)\b(?<!\bas)/g, '`$1`')
  // }
}