export * from './Storage'
export { FileStorage } from './drivers/file'

import { FileConfiguration } from './drivers/file'
import { MongoConfiguration } from './drivers/mongo'
import { S3Configuration } from './drivers/s3'
import { FTPConfiguration } from './drivers/ftp'

type StorageConfig = FileConfiguration | MongoConfiguration | S3Configuration | FTPConfiguration

export interface StorageSettings {
  default: string
  cloud?: string
  disks: { [key: string]: StorageConfig }
}