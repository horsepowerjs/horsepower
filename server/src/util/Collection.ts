export function collect<T extends object>(data?: T[]): Collection<T> {
  return new Collection<T>(data)
}

export class Collection<T extends object> {

  protected _items: T[] = []

  public constructor(data?: T[]) {
    data && data.length > 0 && this._items.push(...data)
  }

  [Symbol.iterator]() { return this._items.values() }

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