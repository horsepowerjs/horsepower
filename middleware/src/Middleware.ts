import { Client } from '@red5/server'
import { Route } from '@red5/router'
import { Response } from '@red5/server'
import { Middleware } from '.'

export class MiddlewareManager {

  public static async run(theRoute: Route, client: Client, type: 'pre' | 'post' = 'pre') {
    // Execute the middleware that is attached to the route
    if (theRoute) {
      // Test the group middleware
      for (let c of theRoute.groupOptions) {
        if (!c.middleware) continue
        let result = type == 'pre' ?
          await this._runPreMiddleware(c.middleware, client) :
          await this._runPostMiddleware(c.middleware, client)
        if (result instanceof Response) return result
        if (result === false) return result
      }
      // Test the route specific middleware
      if (theRoute.routeOptions.middleware) {
        let middleware = theRoute.routeOptions.middleware
        let result = type == 'pre' ?
          await this._runPreMiddleware(middleware, client) :
          await this._runPostMiddleware(middleware, client)
        return result
        // if (result instanceof Response) return result
      }
      return true
    }
  }

  private static async _runPreMiddleware(middleware: Middleware[], client: Client): Promise<boolean | Response> {
    for (let callback of middleware) {
      if (!callback.handle) continue
      let result = await callback.handle(client)
      if (result instanceof Response) return result
      if (!result) return false
      // if (!result) return client.response.sendErrorPage(500)
    }
    return true
  }

  private static async _runPostMiddleware(middleware: Middleware[], client: Client): Promise<boolean | Response> {
    for (let callback of middleware) {
      if (!callback.postHandle) continue
      let result = await callback.postHandle(client)
      if (result instanceof Response) return result
      if (!result) return false
      // if (!result) return client.response.sendErrorPage(500)
    }
    return true
  }
}