import * as path from 'path'

export interface StorageDisk {
  driver: string
  root: string
}

export interface StorageConfig {
  default: string
  cloud?: string
  disks: { [key: string]: StorageDisk }
}

export abstract class Storage {
  public abstract save(filePath: string, data: string | Buffer): Promise<boolean>
  public abstract load(filePath: string): Promise<string | Buffer>
  public abstract delete(filePath: string): Promise<boolean>
  public abstract prepend(filePath: string, data: string | Buffer): Promise<boolean>
  public abstract append(filePath: string, data: string | Buffer): Promise<boolean>
  public abstract copy(source: string, destination: string): Promise<boolean>
  public abstract move(source: string, destination: string): Promise<boolean>

  protected disk: StorageDisk
  protected get root(): string {
    return this.disk.root
  }

  private static config: StorageConfig | null = null

  public static setConfig(confFile: StorageConfig) {
    this.config = confFile
  }

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

  // public static download(path: string) {
  //   return this.mount().download(path)
  // }

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
    if (!this.config) throw new Error('No configuration file loaded')
    if (!driver) driver = this.config.default
    let name = Object.keys(this.config.disks).find(disk => disk == driver)
    let config: StorageDisk | null = null
    if (typeof name == 'string') config = this.config.disks[name]
    if (!config) throw new Error(`Cannot find config for "${driver}"`)
    try {
      // Try and load the driver from red5-storage
      let driver = require(path.join(__dirname, './drivers', config.driver))
      return new driver.default(config) as Storage
    } catch (e) {
      try {
        // Try and load the driver from the root node_modules
        if (require.main && require.main.require) {
          let driver = require.main.require(config.driver)
          return new driver.default(config) as Storage
        }
      } catch (e) { }
    }
    throw new Error(`Cannot find driver "${config.driver}"`)
  }
}