import { Plugin } from '@red5/server'

import * as path from 'path'

export default class extends Plugin {
  public boot() {
    this.loadRoutes(path.join(__dirname, './routes'))
    this.loadControllers(path.join(__dirname, './controllers'))
  }
}
