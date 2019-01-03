import { Server } from './Server'

export { AppSettings, RouterSettings, ViewSettings } from './Server'
export * from './helper'
export * from './Client'
export * from './Response'

export function start() {
  Server.start()
}

export function stop() {
  Server.stop()
}