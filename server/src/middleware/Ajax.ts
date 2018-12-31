import { Client } from 'red5'

export class EnforceAjax {
  handle(client: Client) {
    return client.ajax === true
  }
}