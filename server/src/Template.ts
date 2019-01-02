import * as path from 'path'
import * as fs from 'fs'
import * as helpers from './helper'
import { Client } from '@red5/server'
import { Red5Template } from '@red5/template'

export interface pug {
  renderFile(path: string, options?: {}, callback?: Function): string
}
export interface mustache {
  render(path: string, options?: {}, callback?: Function): string
}
export interface handlebars {
  compile(path: string, options?: {}, callback?: Function): string
}

export class Template {

  private static _root: string = ''

  public static get root(): string { return this._root }

  public static setTemplatesRoot(path: string) {
    this._root = path
  }

  public static render(client: Client) {
    return new Promise<string>(async resolve => {
      let html = ''
      if (typeof client.response.templatePath == 'string') {
        let filePath = client.response.templatePath
        let options = Object.assign({}, client.response.templateData, helpers)
        let file = path.join(this._root, filePath)
        // Render red5 files
        if (filePath.endsWith('.rtpl')) {
          html = await Red5Template.render(file, options)
        }
        // Render html files
        else if (filePath.endsWith('.html')) {
          html = await new Promise<string>(resolve => fs.readFile(file, (err, result) => resolve((result || '').toString())))
        }
        // Render pug files
        else if (filePath.endsWith('.pug')) {
          const pug: pug = require.main && require.main.require('pug')
          if (pug) {
            html = pug.renderFile(file, options)
          }
        }
        // Render mustache files
        else if (filePath.endsWith('.mustache') || filePath.endsWith('.hbs')) {
          const mustache: mustache = require.main && require.main.require('mustache')
          if (mustache) {
            let data = await new Promise<string>(resolve => fs.readFile(file, (err, data) => resolve(data.toString())))
            html = mustache.render(data, options)
          }
        }
        // Render handlebars files
        else if (filePath.endsWith('.hbs')) {
          const handlebars: handlebars = require.main && require.main.require('handlebars')
          if (handlebars) {
            let data = await new Promise<string>(resolve => fs.readFile(file, (err, data) => resolve(data.toString())))
            html = handlebars.compile(data, options)
          }
        }
      }
      resolve(html)
    })
  }

}