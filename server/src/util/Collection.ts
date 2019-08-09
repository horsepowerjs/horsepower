export function collect<T extends object>(data?: T[]): Collection<T> {
  return new Collection<T>(data)
}

export class Collection<T extends object> {

  protected _items: T[] = []

  public get length() { return this._items.length }

  public constructor(data?: T[]) {
    data && data.length > 0 && this._items.push(...data)
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