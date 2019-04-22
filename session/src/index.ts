import { CookieSerializeOptions } from 'cookie';

export * from './Session'

export interface SessionSettings {
  store: 'file' | string
  cookie: CookieSerializeOptions
}