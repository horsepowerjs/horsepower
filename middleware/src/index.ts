import { Client, Response } from '@red5/server'

export * from './Middleware'
export * from './Ajax'
export * from './Headers'

export interface Middleware {
  /**
   * Handles the request before the controller
   *
   * @param {client} client The client
   * @param {any[]} args Additional arguments
   * @returns {boolean | Response}
   */
  handle?(client: Client, ...args: any[]): boolean | Response

  /**
   * Handles the request after the controller
   *
   * @param {client} client The client
   * @param {any[]} args Additional arguments
   * @returns {boolean | Response}
   */
  postHandle?(client: Client, ...args: any[]): boolean | Response

  /**
   * Runs once the response is ready to be sent to the client
   */
  terminate?(client: Client, ...args: any[]): void
}