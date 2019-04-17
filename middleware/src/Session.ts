import { Client } from '@red5/server'
import { Middleware } from '.'

export class StartSession implements Middleware {
  public async handle(client: Client) {
    client && client.session && await client.session.start()
    return true
  }
}