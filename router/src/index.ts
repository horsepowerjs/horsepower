import { Router } from './Router'

export * from './Route'
export * from './Router'


export function route(name: string, options: {
  params?: { [key: string]: any },
  query?: { [key: string]: any }
  body?: string
} = {}) {
  let route = Router.findByName(name)
  let location = ''
  if (route) {
    location = route &&
      typeof route.pathAlias == 'string' &&
      route.pathAlias
        .split('/')
        // Replace the placeholders with the values from the "params" parameter
        .map(i => i.startsWith(':') && i.replace(i, options.params && options.params[i.replace(/^:/, '')] || '') || i)
        .join('/') || '/'

    // Replace the query data
    if (options.query) {
      let entries = Object.keys(options.query)
      location = entries.length > 0 ?
        `?${entries.map(i => `${encodeURIComponent(i[0])}=${encodeURIComponent(i[1])}`).join('&')}` : ''
    }
  }
  return location
}