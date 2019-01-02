import { Client } from '@red5/server'

export * from './Middleware'
export * from './Ajax'

export interface Middleware {
  handle?(client: Client): boolean | Response
  postHandle?(client: Client): boolean | Response
}