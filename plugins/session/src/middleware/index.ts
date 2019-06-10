import { Middleware } from '@red5/middleware'
import { Client, getConfig } from '@red5/server'
import { SessionSettings } from '..'

export class StartSession implements Middleware {
  public async handle(client: Client) {
    let cfg = getConfig('session') as SessionSettings
    client && client.session && await client.session.start(cfg.cookie)
    return true
  }

  public async terminate(client: Client) {
    client && client.session && client.session.close()
    return true
  }
}

export class Auth implements Middleware {
  public async handle(client: Client) {
    // TODO: Implement auth verification
    return true
  }
}