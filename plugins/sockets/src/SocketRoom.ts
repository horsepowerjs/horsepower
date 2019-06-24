import { SocketClient, Message } from './SocketClient'

export class SocketRoom {
  private readonly _id: string
  private readonly _name: string

  private _clients: SocketClient[] = []

  public get id() { return this._id }
  public get name() { return this._name }
  public get clients() { return this._clients }

  public constructor(name: string) {
    this._name = name
    this._id = (Math.random() * 10000).toString(12).replace(/[^\w]/g, '')
  }

  /**
   * Joins the room
   *
   * @param {SocketClient} socket The socket that is joining the room
   * @memberof SocketRoom
   */
  public join(socket: SocketClient) {
    if (this._clients.includes(socket)) return
    this._clients.push(socket)
  }

  /**
   * Leaves the room
   *
   * @param {SocketClient} socket The socket that is leaving the room
   * @memberof SocketRoom
   */
  public leave(socket: SocketClient) {
    let idx = this._clients.findIndex(i => i == socket)
    idx > -1 && this._clients.splice(idx, 1)
  }

  /**
   * Sends a message to everyone in the room
   *
   * @param {Message} message The message to send
   * @memberof SocketRoom
   */
  public message(message: Message) {
    for (let client of this.clients) {
      client.ws.send(message.toString())
    }
  }
}