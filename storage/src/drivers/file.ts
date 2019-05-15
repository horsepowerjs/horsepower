import { Storage } from '../Storage'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

export default class extends Storage {

  /**
   * Saves a file to storage if the file exists overwrite it.
   * If the folder path doesn't exist save will automatically create the path.
   *
   * @param {string} filePath The location of the file/directory
   * @param {(string | Buffer)} data The data to save
   * @returns {Promise<boolean>}
   */
  public save(filePath: string, data: string | Buffer, options?: {
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
  }): Promise<boolean> {
    return new Promise(async resolve => {
      let dir = path.parse(filePath).dir
      await new Promise(r => mkdirp(path.join(this.root, dir), (err) => { err ? r(false) : r(true) }))
      try {
        let resource = path.join(this.root, filePath)
        let writeStream: fs.WriteStream = fs.createWriteStream(resource, Object.assign({ flags: 'w' }, options))
        writeStream.on('error', () => resolve(false))
        writeStream.on('close', () => resolve(true))
        writeStream.write(data)
        writeStream.destroy()
      } catch (e) {
        resolve(false)
      }
    })
  }

  /**
   * Loads a file from file storage
   *
   * @param {string} filePath The location of the file/directory
   * @returns {(Promise<Buffer>)}
   */
  public load(filePath: string): Promise<Buffer> {
    return new Promise(resolve => {
      let chunks: any[] = []
      let resource = path.join(this.root, filePath)
      let readStream = fs.createReadStream(resource)
      readStream.on('data', (data) => chunks.push(data))
      readStream.on('end', () => readStream.destroy())
      readStream.on('close', () => resolve(Buffer.concat(chunks)))
    })
  }

  /**
   * Deletes a file from storage
   *
   * @param {string} filePath The location of the file/directory
   * @returns {Promise<boolean>}
   */
  public delete(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
      fs.unlink(path.join(this.root, filePath), err => {
        resolve(!err)
      })
    })
  }

  /**
   * Prepends data to the beginning of a file
   *
   * @param {string} filePath The location of the file
   * @param {(string | Buffer)} data The data to prepend to the beginning of the file
   * @returns {Promise<boolean>}
   */
  public prepend(filePath: string, data: string | Buffer): Promise<boolean> {
    return new Promise(async resolve => {
      let fileData = await this.load(filePath)
      data = data.toString() + fileData.toString()
      resolve(await this.save(filePath, data))
    })
  }

  /**
   * Appends data to the end of a file
   *
   * @param {string} filePath The location of the file
   * @param {(string | Buffer)} data The data to append to the end of the file
   * @returns {Promise<boolean>}
   */
  public append(filePath: string, data: string | Buffer): Promise<boolean> {
    return this.save(filePath, data, { flags: 'a' })
  }

  /**
   * Copies a file or directory from one location to another location
   *
   * @param {string} source The original location of the file/directory
   * @param {string} destination The new location of the file/directory
   * @returns {Promise<boolean>}
   */
  public copy(source: string, destination: string): Promise<boolean> {
    return new Promise(async resolve => {
      let dir = path.parse(destination).dir
      await new Promise(r => mkdirp(path.join(this.root, dir), (err) => { err ? r(false) : r(true) }))
      let readStream = fs.createReadStream(path.join(this.root, source))
      let writeStream = fs.createWriteStream(path.join(this.root, destination))
      readStream.pipe(writeStream)
      readStream.on('finish', () => {
        readStream.destroy()
        writeStream.destroy()
      })
      readStream.on('close', () => resolve(true))
    })
  }

  /**
   * Moves a file or directory from one location to another location
   *
   * @param {string} source The original location of the file/directory
   * @param {string} destination The new location of the file/directory
   * @returns {Promise<boolean>}
   */
  public move(source: string, destination: string): Promise<boolean> {
    return new Promise(async resolve => {
      fs.rename(path.join(this.root, source), path.join(this.root, destination), (err) => {
        resolve(!err)
      })
    })
  }

  /**
   * Checks if a file or directory exists
   *
   * @param {string} filePath The location of the file/directory
   * @returns {Promise<boolean>}
   */
  public exists(filePath: string): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      fs.stat(path.join(this.root, filePath), (err, stat) => {
        if (err) resolve(false)
        else if (stat.isFile()) resolve(true)
        else resolve(stat.isDirectory())
      })
    })
  }

  public isFile(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      fs.stat(path.join(this.root, filePath), (err, stat) => {
        if (err) return resolve(false)
        return resolve(stat.isFile())
      })
    })
  }

  public isDirectory(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      fs.stat(path.join(this.root, filePath), (err, stat) => {
        if (err) return resolve(false)
        return resolve(stat.isDirectory())
      })
    })
  }

  public toPath(filePath: string) {
    return path.join(this.root, filePath)
  }
}