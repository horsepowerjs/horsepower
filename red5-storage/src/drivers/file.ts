import { Storage } from '../Storage'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdir from 'mkdirp'

export default class extends Storage {

  /**
   * Saves a file to storage if the file exists overwrite it.
   * If the folder path doesn't exist save will automatically create the path.
   *
   * @param {string} filePath The path to the file
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
      await new Promise(r => mkdir(path.join(this.root, dir), (err) => { err ? r(false) : r(true) }))
      try {
        let resource = path.join(this.root, filePath)
        let stream: fs.WriteStream = fs.createWriteStream(resource, Object.assign({ flags: 'w' }, options))
          .on('error', () => resolve(false))
          .on('finish', () => resolve(true))
        stream.write(data)
        stream.close()
      } catch (e) {
        resolve(false)
      }
    })
  }

  /**
   * Loads a file from file storage
   *
   * @param {string} filePath
   * @returns {(Promise<string | Buffer>)}
   */
  public load(filePath: string): Promise<string | Buffer> {
    return new Promise(resolve => {
      let output = ''
      let resource = path.join(this.root, filePath)
      fs.createReadStream(resource, { encoding: 'binary' })
        .on('data', (data) => output += data)
        .on('end', () => resolve(output))
    })
  }

  /**
   * Deletes a file from storage
   *
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  public delete(filePath: string): Promise<boolean> {
    return new Promise(resolve => {
      fs.unlink(path.join(this.root, 'storage', filePath), (err) => {
        resolve(!err)
      })
    })
  }

  /**
   * Prepends data to the beginning of a file
   *
   * @param {string} filePath
   * @param {(string | Buffer)} data
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
   * @param {string} filePath
   * @param {(string | Buffer)} data
   * @returns {Promise<boolean>}
   */
  public append(filePath: string, data: string | Buffer): Promise<boolean> {
    return this.save(filePath, data, { flags: 'a' })
  }

  /**
   * Copies a file in on location to another location
   *
   * @param {string} source
   * @param {string} destination
   * @returns {Promise<boolean>}
   */
  public copy(source: string, destination: string): Promise<boolean> {
    return new Promise(async resolve => {
      let dir = path.parse(destination).dir
      await new Promise(r => mkdir(path.join(this.root, dir), (err) => { err ? r(false) : r(true) }))
      fs.createReadStream(path.join(this.root, source))
        .pipe(fs.createWriteStream(path.join(this.root, destination)))
        .on('finish', () => resolve(true))
    })
  }

  /**
   * Moves a file from one location to another location
   *
   * @param {string} source
   * @param {string} destination
   * @returns {Promise<boolean>}
   */
  public move(source: string, destination: string): Promise<boolean> {
    return new Promise(async resolve => {
      fs.rename(path.join(this.root, source), path.join(this.root, destination), (err) => {
        resolve(!err)
      })
    })
  }
}