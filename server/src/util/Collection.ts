export type KeyValuePair = { key: string, value: any }

export function collect<T extends KeyValuePair>(data: [string, any][]): Collection<KeyValuePair>
export function collect<T extends object>(data: T[]): Collection<T>
export function collect<T extends object>(data: any[] | [string, any][]): Collection<T> {
  if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length == 2) {
    return new Collection<T>(data, true)
  }
  return new Collection<T>(data)
}

export class Collection<T extends object> {

  protected _items: T[] = []

  public get length() { return this._items.length }

  public constructor()
  public constructor(data: T[])
  public constructor(data: [string, any][], keyVal?: boolean)
  public constructor(data?: any, keyVal: boolean = false) {
    // data && data.length > 0 && this._items.push(...data)
    if (data && Array.isArray(data)) {
      if (keyVal) {
        this._items.push(...data.map<KeyValuePair>(i => ({ key: i[0], value: i[1] })) as T[])
      } else if (data.length > 0) {
        this._items.push(...data)
      }
    }
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop == 'string' && prop.match(/^\d+$/)) {
          return target._items[prop]
        }
        return Reflect.get(target, prop, receiver)
      }
    })
  }

  [Symbol.iterator]() {
    let idx = -1
    let data = this._items
    return {
      next: () => ({ value: data[++idx], done: !(idx in data) })
    }
  }

  public get(index: number) {
    return this._items[index]
  }

  public add(item: T | T[]) {
    Array.isArray(item) ?
      this._items.push(...item) :
      this._items.push(item)
  }

  public remove(item: T) {
    let idx = this._items.indexOf(item)
    idx > -1 && this._items.splice(idx, 1)
  }
}