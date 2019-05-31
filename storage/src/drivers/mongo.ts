import { Storage, StorageDisk } from '../Storage'
import { Readable } from 'stream'
// import { MongoClient, GridFSBucket } from 'mongodb'

declare type MongoClient = import('mongodb').MongoClient
declare type GridFSBucket = import('mongodb').GridFSBucket
declare type Db = import('mongodb').Db

const mongo = require.main && require.main.require('mongodb')
const MongoClient: MongoClient = mongo.MongoClient
const Db: new () => Db = mongo.Db
const GridFSBucket: new (dbName: Db) => GridFSBucket = mongo.GridFSBucket

export declare type MongoOptions = {
  username?: string
  password?: string
  host?: string
  port?: number
  db: string
}

interface File {
  _id: import('mongodb').ObjectId
  length: number
  chunkSize: number
  uploadDate: Date
  filename: string
  md5: string
}

export default class MongoDriver extends Storage<MongoOptions> {

  protected static client: MongoClient | null = null
  protected bucket!: GridFSBucket

  private async _connect() {
    if (MongoDriver.client) return
    if (!this.disk.options || !this.disk.options.db) throw new Error(`No database set for "options.db"`)
    let username = this.disk.options && this.disk.options.username || ''
    let password = this.disk.options && this.disk.options.password || ''

    let user = ''
    if (username) user += username
    if (username && password) user += ':' + password
    if (user.length > 0) user += '@'

    let host = this.disk.options && this.disk.options.host || 'localhost'
    let port = this.disk.options && this.disk.options.port || 27017
    let url = `mongodb://${user}${host}:${port}`
    MongoDriver.client = await MongoClient.connect(url, { useNewUrlParser: true })
    if (MongoDriver.client) this.bucket = new GridFSBucket(MongoDriver.client.db(this.disk.options.db))
  }

  public async save(filePath: string, data: string | Buffer): Promise<boolean> {
    await this._connect()
    if (!MongoDriver.client) return false
    let bucket: GridFSBucket = new GridFSBucket(MongoDriver.client.db(this.disk.options.db))
    return new Promise<boolean>(resolve => {
      let r = new Readable()
      r._read = () => { }
      r.push(data)
      r.push(null)
      r.pipe(bucket.openUploadStream(filePath, {
        // metadata: {
        //   mime: mimeType,
        //   type: mimeType.split('/')[0] || 'unknown',
        //   ext: mimeType.split('/')[1] || 'unknown'
        // }
      }))
        .on('finish', () => resolve(true))
        .on('error', () => resolve(false))
    })
  }

  public async load(filePath: string, options?: object | undefined): Promise<Buffer> {
    return new Promise(async resolve => {
      try {
        await this._connect()
        if (!MongoDriver.client) resolve(Buffer.concat([]))
        let file = await this.findFile(filePath)
        if (file) {
          let chunks: any[] = []
          this.bucket.openDownloadStream(file._id)
            .on('data', chunk => chunks.push(chunk))
            .on('error', () => Buffer.concat([]))
            .on('close', () => resolve(Buffer.concat(chunks)))
        } else {
          resolve(Buffer.concat([]))
        }
      } catch (e) {
        resolve(Buffer.concat([]))
      }
    })
  }

  public async delete(filePath: string): Promise<boolean> {
    await this._connect()
    if (!MongoDriver.client) return false
    let bucket: GridFSBucket = new GridFSBucket(MongoDriver.client.db(this.disk.options.db))
    let file = await this.findFile(filePath)
    if (file) {
      await bucket.delete(file._id)
      return true
    }
    return false
  }

  public async prepend(filePath: string, data: string | Buffer): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async append(filePath: string, data: string | Buffer): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async copy(source: string, destination: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async move(source: string, destination: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async exists(filePath: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async isFile(filePath: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async isDirectory(filePath: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public toPath(filePath: string): string {
    throw new Error('Method not implemented.');
  }

  private async findFile(filename: string) {
    if (!MongoDriver.client) return null
    let collection = MongoDriver.client.db(this.disk.options.db).collection('fs.files')
    if (!collection) return null
    return await collection.findOne<File>({ filename })
  }
}