import * as path from 'path'
import { getConfig } from '@red5/server'


export interface StorageDisk {
  driver: string
  root: string
  options?: { [key: string]: any }
}

export interface StorageSettings {
  default: string
  cloud?: string
  disks: { [key: string]: StorageDisk }
}

export abstract class Storage {
  public abstract save(filePath: string, data: string | Buffer): Promise<boolean>
  public abstract load(filePath: string): Promise<string | Buffer>
  public abstract delete(filePath: string): Promise<boolean>
  public abstract prepend(filePath: string, data: string | Buffer): Promise<boolean>
  public abstract exists(filePath: string): Promise<boolean>
  public abstract append(filePath: string, data: string | Buffer): Promise<boolean>
  public abstract copy(source: string, destination: string): Promise<boolean>
  public abstract move(source: string, destination: string): Promise<boolean>

  protected disk: StorageDisk
  protected get root(): string {
    return this.disk.root
  }

  private static config: StorageSettings | null = null


  public constructor(config: StorageDisk) {
    this.disk = Object.freeze(config)
  }

  public static save(path: string, data: string | Buffer) {
    return this.mount().save(path, data)
  }

  public static load(path: string) {
    return this.mount().load(path)
  }

  public static delete(path: string) {
    return this.mount().delete(path)
  }

  public static exists(path: string) {
    return this.mount().exists(path)
  }

  public static prepend(path: string, data: string | Buffer) {
    return this.mount().prepend(path, data)
  }

  public static append(path: string, data: string | Buffer) {
    return this.mount().append(path, data)
  }

  public static copy(source: string, destination: string) {
    return this.mount().copy(source, destination)
  }

  public static move(source: string, destination: string) {
    return this.mount().move(source, destination)
  }

  /**
   * Mounts the default disk
   *
   * @static
   * @template T
   * @returns {T}
   * @memberof Storage
   */
  public static mount(): Storage

  /**
   * Mounts a particular disk
   *
   * @static
   * @template T
   * @param {string} disk The name of the disk
   * @returns {T}
   * @memberof Storage
   */
  public static mount(disk: string): Storage
  public static mount(driver?: string): Storage {

    this.config = getConfig<StorageSettings>('storage') || null

    if (!this.config) throw new Error('No storage configuration file found at "config/storage.js"')
    if (!driver) driver = this.config.default
    let name = Object.keys(this.config.disks).find(disk => disk == driver)
    let config: StorageDisk | null = null
    if (typeof name == 'string') config = this.config.disks[name]
    if (!config) throw new Error(`Cannot find config for "${driver}"`)
    try {
      // Try and load a builtin driver from the "drivers" directory
      let driver = require(path.join(__dirname, './drivers', config.driver))
      return new driver.default(config) as Storage
    } catch (e) {
      try {
        // Try and load the driver from the root "node_modules" in the users project
        if (require.main && require.main.require) {
          let driver = require.main.require(config.driver)
          return new driver.default(config) as Storage
        }
        throw new Error(`Cannot find and mount the driver "${config.driver}"`)
      } catch (e) {
        throw new Error(`Cannot find and mount the driver "${config.driver}"`)
      }
    }
  }
}