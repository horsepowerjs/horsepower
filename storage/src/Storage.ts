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
  /**
   * Saves a file to storage if the file exists overwrite it.
   * If the folder path doesn't exist save will automatically create the path.
   *
   * @param {string} filePath The location of the file/directory
   * @param {(string | Buffer)} data The data to save
   * @param {object} [options] The save options for when saving the file
   * @returns {Promise<boolean>}
   */
  public abstract save(filePath: string, data: string | Buffer, options?: object): Promise<boolean>
  /**
   * Loads a file from file storage
   *
   * @param {string} filePath The location of the file/directory
   * @param {object} [options] The save options for when saving the file
   * @returns {(Promise<Buffer>)}
   */
  public abstract load(filePath: string, options?: object): Promise<Buffer>
  /**
   * Deletes a file from storage
   *
   * @param {string} filePath The location of the file/directory
   * @returns {Promise<boolean>}
   */
  public abstract delete(filePath: string): Promise<boolean>
  /**
   * Prepends data to the beginning of a file
   *
   * @param {string} filePath The location of the file
   * @param {(string | Buffer)} data The data to prepend to the beginning of the file
   * @returns {Promise<boolean>}
   */
  public abstract prepend(filePath: string, data: string | Buffer): Promise<boolean>
  /**
   * Appends data to the end of a file
   *
   * @param {string} filePath The location of the file
   * @param {(string | Buffer)} data The data to append to the end of the file
   * @returns {Promise<boolean>}
   */
  public abstract append(filePath: string, data: string | Buffer): Promise<boolean>
  /**
   * Copies a file or directory from one location to another location
   *
   * @param {string} source The original location of the file/directory
   * @param {string} destination The new location of the file/directory
   * @returns {Promise<boolean>}
   */
  public abstract copy(source: string, destination: string): Promise<boolean>
  /**
   * Moves a file or directory from one location to another location
   *
   * @param {string} source The original location of the file/directory
   * @param {string} destination The new location of the file/directory
   * @returns {Promise<boolean>}
   */
  public abstract move(source: string, destination: string): Promise<boolean>
  /**
   * Checks if a file or directory exists
   *
   * @param {string} filePath The location of the file/directory
   * @returns {Promise<boolean>}
   */
  public abstract exists(filePath: string): Promise<boolean>
  /**
   * Checks if a path is a file
   *
   * @abstract
   * @param {string} filePath The path to the file
   * @returns {Promise<boolean>}
   * @memberof Storage
   */
  public abstract isFile(filePath: string): Promise<boolean>
  /**
   * Checks if a path is a directory
   *
   * @abstract
   * @param {string} filePath The path to the directory
   * @returns {Promise<boolean>}
   * @memberof Storage
   */
  public abstract isDirectory(filePath: string): Promise<boolean>
  /**
   * Gets the full path to a file or directory
   *
   * @abstract
   * @param {string} filePath The path to the file or directory
   * @returns {string}
   * @memberof Storage
   */
  public abstract toPath(filePath: string): string

  protected disk: StorageDisk
  protected get root(): string {
    return this.disk.root
  }

  public name: string = ''

  private static config: StorageSettings | null = null


  public constructor(config: StorageDisk) {
    this.disk = Object.freeze(config)
  }

  /**
   * Copies a file from one storage driver to another
   *
   * @param {Storage | string} source The source storage driver
   * @param {string} sourceObject The path of the file on the source driver
   * @param {string} destinationObject The path to the destination on the current driver
   * @returns
   */
  public async copyFrom(source: Storage | string, sourceObject: string, destinationObject: string) {
    let storageSource = typeof source == 'string' ? Storage.mount(source) : source
    if (await storageSource.exists(sourceObject)) {
      let storageSource = typeof source == 'string' ? Storage.mount(source) : source
      let file = await storageSource.load(sourceObject)
      return await this.save(destinationObject, file)
    }
  }

  /**
   * Moves a file from one storage driver to another
   *
   * @param {Storage | string} source The source storage driver
   * @param {string} sourceObject The path of the file on the source driver
   * @param {string} destinationObject The path to the destination on the current driver
   * @returns
   */
  public async moveFrom(source: Storage | string, sourceObject: string, destinationObject: string) {
    let storageSource = typeof source == 'string' ? Storage.mount(source) : source
    if (await storageSource.exists(sourceObject)) {
      let file = await storageSource.load(sourceObject)
      await this.save(destinationObject, file)
      return await storageSource.delete(sourceObject)
    }
  }

  /**
   * This forces the root directory to be the root of the driver.
   * No paths will be able to access other items outside of the drivers root.
   *
   * @param {string} root The root of the driver
   * @param {string} objectPath The path to the object
   * @returns {string} The forced path
   */
  protected forceRoot(objectPath: string): string {
    return path.posix.join(this.root, path.posix.resolve('/', objectPath))
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

  public static isFile(path: string) {
    return this.mount().isFile(path)
  }

  public static isDirectory(path: string) {
    return this.mount().isDirectory(path)
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

  public static copyFrom(source: Storage | string, sourceFile: string, destinationFile: string) {
    return this.mount().copyFrom(source, sourceFile, destinationFile)
  }

  public static moveFrom(source: Storage | string, sourceFile: string, destinationFile: string) {
    return this.mount().moveFrom(source, sourceFile, destinationFile)
  }

  public static path(path: string) {
    return this.mount().toPath(path)
  }

  /**
   * Mounts the default disk
   *
   * @static
   * @template T
   * @returns {T}
   * @memberof Storage
   */
  public static mount<T extends Storage>(): T

  /**
   * Mounts a particular disk
   *
   * @static
   * @template T
   * @param {string} disk The name of the disk
   * @returns {T}
   * @memberof Storage
   */
  public static mount<T extends Storage>(disk: string): T
  /**
   * Mounts a disk not defined within the config
   *
   * @static
   * @param {{ root: string }} disk
   * @returns {Storage}
   * @memberof Storage
   */
  public static mount<T extends Storage>(disk: StorageDisk): T
  public static mount<T extends Storage>(driver?: string | StorageDisk): T {
    if (typeof driver == 'string') {
      if (driver == 'tmp') {
        return this.getDriver({
          driver: 'file',
          root: require('os').tmpdir()
        }) as T
      }
      this.config = getConfig<StorageSettings>('storage') || null

      if (!this.config) throw new Error('No storage configuration file found at "config/storage.js"')
      if (!driver) driver = this.config.default
      let name = Object.keys(this.config.disks).find(disk => disk == driver)
      let config: StorageDisk | null = null

      if (!name) throw new Error(`No storage found for "${name}"`)
      config = this.config.disks[name]
      if (!config) throw new Error(`Cannot find storage driver "${driver}"`)

      let storageDriver = this.getDriver(config)
      storageDriver.name = name
      return storageDriver as T
    } else if (driver) {
      return this.getDriver(driver) as T
    }
    throw new Error(`Cannot find and mount the driver`)
  }

  private static getDriver(config: StorageDisk): Storage {
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