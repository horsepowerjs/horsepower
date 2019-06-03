import { Storage, StorageDisk } from '../Storage'
import { } from 'aws-sdk/clients/s3'

declare type ClientConfiguration = import('aws-sdk/clients/s3').ClientConfiguration
declare type S3 = new (config: ClientConfiguration) => import('aws-sdk/clients/s3')
declare type PutObjectRequest = import('aws-sdk/clients/s3').PutObjectRequest
declare type GetObjectRequest = import('aws-sdk/clients/s3').GetObjectRequest
declare type DeleteObjectRequest = import('aws-sdk/clients/s3').DeleteObjectRequest
const S3: S3 = require.main && require.main.require('aws-sdk/clients/s3')

interface S3Connection {
  name: string
  conn: import('aws-sdk/clients/s3')
  bucket: string
}

export default class AmazonS3Storage extends Storage<ClientConfiguration> {

  public static connections: S3Connection[] = []

  public async boot(config: StorageDisk<ClientConfiguration>) {
    AmazonS3Storage.connections.push({
      name: this.name,
      conn: new S3(config.options),
      bucket: config.root
    })
  }

  public async save(filePath: string, data: string | Buffer, options?: PutObjectRequest | undefined): Promise<boolean> {
    return new Promise(resolve => {
      let conn = this.getConnection()
      if (!conn) return false
      let v = {
        Bucket: conn.bucket,
        Key: filePath,
        Body: data,
        ACL: 'public-read'
      }
      if (options) v = Object.assign(v, options)
      conn.conn.putObject(v, (err, data) => {
        // if (err) return resolve(false)
        resolve(true)
      })
    })
  }

  public async load(filePath: string, options?: GetObjectRequest | undefined): Promise<Buffer> {
    return new Promise(resolve => {
      let conn = this.getConnection()
      if (!conn) return false
      let v = <GetObjectRequest>{
        Bucket: conn.bucket,
        Key: filePath
      }
      if (options) v = Object.assign(v, options)
      conn.conn.getObject(v, (err, data) => {
        // if (err) return resolve(Buffer.concat([]))
        if (data.Body) return resolve(Buffer.from(data.Body.toString()))
        return resolve(Buffer.concat([]))
      })
    })
  }

  public async delete(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
      let conn = this.getConnection()
      if (!conn) return false
      conn.conn.deleteObject({
        Bucket: conn.bucket,
        Key: filePath
      }, (err, data) => {
        resolve(!!data.DeleteMarker)
      })
    })
  }

  public async prepend(filePath: string, data: string | Buffer): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async append(filePath: string, data: string | Buffer): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async copy(source: string, destination: string): Promise<boolean> {
    return new Promise(resolve => {
      let conn = this.getConnection()
      if (!conn) return false
      conn.conn.copyObject({
        Bucket: conn.bucket,
        CopySource: source,
        Key: destination
      }, (err, data) => {
        resolve(!!data.CopyObjectResult)
      })
    })
  }

  public async move(source: string, destination: string): Promise<boolean> {
    await this.copy(source, destination)
    return await this.delete(source)
  }

  public async exists(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
      let conn = this.getConnection()
      if (!conn) return false
      conn.conn.listObjects({
        Bucket: conn.bucket,
        Prefix: filePath,
        MaxKeys: 1
      }, (err, data) => {
        resolve(data.Contents && data.Contents.length > 0)
      })
    })
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

  private getConnection() {
    return AmazonS3Storage.connections.find(i => i.name == this.name)
  }

}