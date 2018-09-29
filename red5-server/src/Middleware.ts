import { Client } from './Client';
import { Route } from 'red5';

export class Middleware {

  public static async run(theRoute: Route, client: Client) {
    // Execute the middleware that is attached to the route
    if (theRoute) {
      // Test the group middleware
      for (let c of theRoute.groupOptions) {
        if (!c.middleware) continue
        let result = await this._runMiddleware(c.middleware, client)
        if (result instanceof Response) return result
      }
      // Test the route specific middleware
      if (theRoute.routeOptions.middleware) {
        let result = await this._runMiddleware(theRoute.routeOptions.middleware, client)
        if (result instanceof Response) return result
      }
    }
  }

  private static async _runMiddleware(middleware: Function[], client: Client) {
    for (let callback of middleware) {
      let result = await callback(client)
      if (result instanceof Response) return result
      // if (!result) return client.response.sendErrorPage(500)
    }
    return true
  }
}