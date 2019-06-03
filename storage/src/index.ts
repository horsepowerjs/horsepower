export * from './Storage'
export { FileStorage } from './drivers/file'

import { FileConfiguration } from './drivers/file'
import { MongoConfiguration } from './drivers/mongo'
import { S3Configuration } from './drivers/s3'

type StorageConfig = FileConfiguration | MongoConfiguration | S3Configuration

export interface StorageSettings {
  default: string
  cloud?: string
  disks: { [key: string]: StorageConfig }
}