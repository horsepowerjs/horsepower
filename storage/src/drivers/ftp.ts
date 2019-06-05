import * as path from 'path'
import { Storage } from '../Storage'


declare type Client = import('ftp')

const Client: new () => Client = require.main && require.main.require('ftp')

type FTPOptions = {
  host?: string
  port?: number
  secure?: boolean | 'control' | 'implicit'
  secureOptions?: object
  user?: string
  password?: string
  connTimeout?: number
  pasvTimeout?: number
  keepalive?: number
}

export type FTPConfiguration = {
  driver: 'mongo'
  root: string
  options?: FTPOptions,
}

interface FTPConnection {
  name: string
  client: Client
}

export default class FTPStorage extends Storage<FTPOptions> {

  protected static connections: FTPConnection[] = []

  public async boot(config: FTPConfiguration): Promise<void> {
    return new Promise(resolve => {
      let c = new Client()
      c.on('ready', () => {
        FTPStorage.connections.push({
          client: c,
          name: this.name
        })
        resolve()
      })
      c.connect(config.options)
    })
  }

  public async shutdown() {
    let conn = this.getConnection(this.name)
    if (!conn) return
    let idx = FTPStorage.connections.findIndex(i => i.name == this.name)
    idx > -1 && FTPStorage.connections.splice(idx, 1)
    conn.client.end()
  }

  public async write(filePath: string, data: string | Buffer, options?: object | undefined): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      filePath = this.forceRoot(filePath) as string
      await new Promise(r => conn && conn.client.mkdir(path.dirname(filePath), true, () => r()))
      conn.client.put(data, filePath, (err) => err ? resolve(false) : resolve(true))
    })
  }

  public async read(filePath: string, options?: object | undefined): Promise<Buffer> {
    return new Promise<Buffer>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(Buffer.from(''))
      filePath = this.forceRoot(filePath) as string
      let chunks: any[] = []
      conn.client.get(filePath, (err, stream) => {
        if (err) return resolve(Buffer.from(''))
        stream
          .on('data', chunk => chunks.push(chunk))
          .on('error', () => resolve(Buffer.from('')))
          .on('close', () => resolve(Buffer.concat(chunks)))
          .on('finish', () => resolve(Buffer.concat(chunks)))
          .on('end', () => resolve(Buffer.concat(chunks)))
      })
    })
  }

  public async delete(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      filePath = this.forceRoot(filePath) as string
      conn.client.delete(filePath, (err) => {
        if (err) return resolve(false)
        return resolve(true)
      })
    })
  }

  public async prepend(filePath: string, data: string | Buffer): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async append(filePath: string, data: string | Buffer): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      filePath = this.forceRoot(filePath) as string
      conn.client.append(data, filePath, (err) => {
        if (err) return resolve(false)
        return resolve(true)
      })
    })
  }

  public async copy(source: string, destination: string): Promise<boolean> {
    let conn = this.getConnection(this.name)
    if (!conn) return false
    let data = await this.read(source)
    return await this.write(destination, data)
  }

  public async move(source: string, destination: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      source = this.forceRoot(source) as string
      destination = this.forceRoot(destination) as string
      conn.client.rename(source, destination, (err) => {
        if (err) return resolve(false)
        return resolve(true)
      })
    })
  }

  public async exists(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      filePath = this.forceRoot(filePath) as string
      let dir = path.parse(filePath).dir
      let name = path.parse(filePath).base
      conn.client.list(dir, (err, listing) => {
        if (err) return resolve(false)
        resolve(listing.filter(i => i.name == name).length > 0)
      })
    })
  }

  public async isFile(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      filePath = this.forceRoot(filePath) as string
      let dir = path.parse(filePath).dir
      let name = path.parse(filePath).base
      conn.client.list(dir, (err, listing) => {
        if (err) return resolve(false)
        return resolve(listing.filter(i => i.name == name && i.type == '-').length > 0)
      })
    })
  }

  public async isDirectory(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let conn = this.getConnection(this.name)
      if (!conn) return resolve(false)
      filePath = this.forceRoot(filePath) as string
      let dir = path.parse(filePath).dir
      let name = path.parse(filePath).base
      conn.client.list(dir, (err, listing) => {
        if (err) return resolve(false)
        return resolve(listing.filter(i => i.name == name && i.type.toLowerCase() == 'd').length > 0)
      })
    })
  }

  public toPath(filePath: string): string {
    return this.forceRoot(filePath).toString()
  }

  private getConnection(name: string) {
    return FTPStorage.connections.find(c => c.name == name)
  }
}