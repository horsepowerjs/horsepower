import { Client, Response, configPath } from '@red5/server'
import { Route } from '@red5/router'
import { Middleware } from '.'

declare type MiddlewareType = 'pre' | 'post' | 'terminate'

declare interface MiddlewareConfig {
  namedMiddleware: { [key: string]: Middleware }
}

export class MiddlewareManager {

  public static async run(theRoute: Route, client: Client, type: MiddlewareType = 'pre') {
    // Execute the middleware that is attached to the route
    if (theRoute) {
      // Test the group middleware
      for (let c of theRoute.groupOptions) {
        if (!c.middleware) continue
        let result
        switch (type) {
          case 'pre': result = await this._runPreMiddleware(c.middleware, client); break;
          case 'post': result = await this._runPostMiddleware(c.middleware, client); break;
          case 'terminate': result = await this._runTerminateMiddleware(c.middleware, client); break;
        }
        if (result instanceof Response) return result
        if (result === false) return result
      }
      // Test the route specific middleware
      if (theRoute.routeOptions.middleware) {
        let middleware = theRoute.routeOptions.middleware
        let result
        switch (type) {
          case 'pre': result = await this._runPreMiddleware(middleware, client); break;
          case 'post': result = await this._runPostMiddleware(middleware, client); break;
          case 'terminate': result = await this._runTerminateMiddleware(middleware, client); break;
        }
        return result
      }
      return true
    }
  }

  private static async _runPreMiddleware(middleware: ({ new(): Middleware } | Middleware | string)[], client: Client): Promise<boolean | Response> {
    for (let callback of middleware) {
      let result
      if (typeof callback == 'string') {
        let cb = this.parseStringMiddleware(callback)
        if (cb && cb.callback && cb.callback.handle) result = await cb.callback.handle(client, ...cb.params)
      } else {
        if (!callback['handle']) continue
        result = await callback['handle'](client)
      }
      if (result instanceof Response) return result
      if (!result) return false
    }
    return true
  }

  private static async _runPostMiddleware(middleware: ({ new(): Middleware } | Middleware | string)[], client: Client): Promise<boolean | Response> {
    for (let callback of middleware) {
      let result
      if (typeof callback == 'string') {
        let cb = this.parseStringMiddleware(callback)
        if (cb && cb.callback && cb.callback.postHandle) result = await cb.callback.postHandle(client, ...cb.params)
      } else {
        if (!callback['postHandle']) continue
        result = await callback['postHandle'](client)
      }
      if (result instanceof Response) return result
      if (!result) return false
    }
    return true
  }

  private static async _runTerminateMiddleware(middleware: ({ new(): Middleware } | Middleware | string)[], client: Client): Promise<boolean> {
    for (let callback of middleware) {
      if (typeof callback == 'string') {
        let cb = this.parseStringMiddleware(callback)
        if (cb && cb.callback && cb.callback.terminate) await cb.callback.terminate(client, ...cb.params)
      } else {
        if (!callback['terminate']) continue
        await callback['terminate'](client)
      }
    }
    return true
  }

  private static parseStringMiddleware(string: string) {
    try {
      const refs: MiddlewareConfig = require.main && require.main.require(configPath('middleware'))
      if (refs.namedMiddleware) {
        const [, middleware, parameters] = Array.from(string.match(/(.+):(.+)/) || [])
        if (!refs.namedMiddleware[middleware]) return
        return {
          callback: new (<any>refs.namedMiddleware[middleware]),
          params: parameters.split(',')// /,(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/)
        }
      }
    } catch (e) {
      throw new Error('You are calling middleware using a string, however, "/config/middleware.js" was not found with "namedMiddleware"')
    }
  }
}