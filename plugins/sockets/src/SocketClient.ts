import { WebSocket, HttpRequest } from 'uWebSockets.js'
import { SocketApp } from './SocketApp';
import { SocketRoom } from './SocketRoom';

export type Message = string | number | boolean | Buffer

export interface Rooms {
  list: SocketRoom[]
  each(message: Message): void
  all(message: Message): void
}

export class SocketClient {

  private readonly _id: string
  private readonly _ws: WebSocket
  private readonly _req: HttpRequest

  public get id() { return this._id }
  public get ws() { return this._ws }
  public get req() { return this._req }

  public constructor(ws: WebSocket, req: HttpRequest) {
    this._id = (Math.random() * 10000).toString(12).replace(/[^\w]/g, '')
    this._ws = ws
    this._req = req
  }

  /**
   * Messages to a particular room
   *
   * @param {string} roomName The name of the room to send to
   * @returns
   * @memberof SocketClient
   */
  public room(roomName: string) {
    let $this = this
    return {
      /**
       * Sends a message to a room whether or not the client is in that room
       *
       * @param {Message} message The message to send
       * @returns
       * @memberof SocketClient
       */
      to(message: Message) {
        let room = SocketApp.rooms.find(r => r.name == roomName)
        if (!room) return false
        room.message(message)
        return true
      },
      /**
       * Sends a message to a room that the client is in
       *
       * @param {Message} message The message to send
       * @returns
       * @memberof SocketClient
       */
      in(message: Message) {
        let room = $this.rooms.list.find(r => r.name == roomName)
        if (!room) return false
        room.message(message)
        return true
      }
    }
  }

  public get rooms(): Rooms {
    let $this = this
    return {
      /**
       * A list of rooms this client is in
       *
       * @readonly
       */
      get list(): SocketRoom[] { return SocketApp.rooms.filter(r => r.clients.includes($this)) },
      /**
       * Sends a message to each room that the client is in
       *
       * @param {Message} message The message to send
       * @memberof SocketClient
       */
      each(message: Message) {
        for (let room of this.list) {
          room.message(message)
        }
      },
      /**
       * Sends a message to all rooms
       *
       * @param {Message} message The message to send
       * @memberof SocketClient
       */
      all(message: Message) {
        for (let room of SocketApp.rooms) {
          room.message(message)
        }
      }
    }
  }

  /**
   * Sends a message to all clients
   *
   * @param {Message} message The message to send
   * @memberof SocketClient
   */
  public broadcast(message: Message) {
    for (let client of SocketApp.clients) {
      this.message(client, message)
    }
  }

  /**
   * Sends a direct message to another client
   *
   * @param {SocketClient} client The other client to send to
   * @param {Message} message The message to send
   * @memberof SocketClient
   */
  public message(client: SocketClient, message: Message) {
    client.ws.send(message.toString())
  }

}