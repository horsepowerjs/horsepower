import { URL } from 'url'
import * as http from 'http'
import * as https from 'https'
import { Storage } from '../Storage'


declare type Client = import('ftp')

const Client: new (options?: FTPOptions) => Client = require.main && require.main.require('ftp')

type FTPOptions = {
  host: string
  port: number
  secure: boolean | 'control' | 'implicit'
  secureOptions: object
  user: string
  password: string
  connTimeout: number
  pasvTimeout: number
  keepalive: number
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

export default class FTPStorage extends Storage<{}> {

  protected static connections: FTPConnection[] = []

  public async boot(config: FTPConfiguration) {
    FTPStorage.connections.push({
      client: new Client(config.options),
      name: this.name
    })
  }

  public async write(filePath: string, data: string | Buffer, options?: object | undefined): Promise<boolean> {
    return new Promise(resolve => {
      let req = this.getScheme().request('/write')
        .on('error', () => resolve(false))
        .on('finish', () => resolve(true))
      req.write({
        filename: filePath,
        data
      })
      req.end()
    })
  }

  public async read(filePath: string, options?: object | undefined): Promise<Buffer> {
    return new Promise(resolve => {
      let chunks: any[] = []
      let req = this.getScheme().request('/read', res => {
        res.on('data', data => chunks.push(data))
        res.on('end', () => res.destroy())
        res.on('close', () => resolve(Buffer.concat(chunks)))
      })
      req.write({ filename: filePath })
      req.end()
    })
  }

  public async delete(filePath: string): Promise<boolean> {
    throw new Error('Method not implemented.');
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

  private getScheme(): typeof http | typeof https {
    return /^https/i.test(this.root) ? https : http
  }
}