import { Client } from '@red5/server';
import { Middleware } from '.';

export class RequireHeader implements Middleware {
  handle(client: Client, header: string) {
    return client.headers.has(header)
  }
}

export class RequireHeaderValue implements Middleware {
  handle(client: Client, header: string, value: string) {
    return client.headers.has(header) && client.headers.get(header) === value
  }
}