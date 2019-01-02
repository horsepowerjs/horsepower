import { Client } from '@red5/server'
import { Middleware } from '.'

/**
 * Enforces an ajax request to the server.
 * In order to be an ajax request, the request must be sent with
 * the header "x-requested-with: XMLHttpRequest".
 */
export class EnforceAjax implements Middleware {
  handle(client: Client) {
    return client.ajax === true
  }
}

/**
 * Enforces a non-ajax request to the server.
 * In order be a non-ajax request, the request must be sent without
 * the header "x-requested-with: XMLHttpRequest".
 */
export class EnforceHttp implements Middleware {
  handle(client: Client) {
    return client.ajax === false
  }
}