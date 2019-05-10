import { Client, getConfig } from '@red5/server'
import { Middleware } from '.'
import { SessionSettings } from '@red5/session';

export class StartSession implements Middleware {
  public async handle(client: Client) {
    let cfg = getConfig('session') as SessionSettings
    client && client.session && await client.session.start(cfg.cookie)
    return true
  }
}

export class Auth implements Middleware {
  public async handle(client: Client) {
    // TODO: Implement auth verification
    return true
  }
}