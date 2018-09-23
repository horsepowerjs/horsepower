import * as path from 'path'

export interface pug {
  renderFile(path: string, options?: {}, callback?: Function): string
}

export class Template {

  private static _root: string = ''

  public static get root(): string { return this._root }

  public static setTemplatesRoot(path: string) {
    this._root = path
  }

  public static render(filePath: string, options?: {}) {
    let html = ''
    if (filePath.endsWith('.pug')) {
      const pug: pug = require.main && require.main.require('pug')
      if (pug) {
        html = pug.renderFile(path.join(this._root, filePath), options)
      }
    }
    return html
  }
}