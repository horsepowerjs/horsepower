export type KeyValuePair = { key: string, value: any }

export function collect<T extends KeyValuePair>(data: [string, any][]): Collection<KeyValuePair>
export function collect<T extends object>(data: T[]): Collection<T>
export function collect<T>(data: any[]): Collection<any>
export function collect<T extends object>(data: any[] | [string, any][]): Collection<T> {
  if (Array.isArray(data) && data.every(i => Array.isArray(i) && i.length == 2)) {
    return new Collection<T>(data, true)
  }
  return new Collection<T>(data)
}

export class Collection<T> {

  protected _items: T[] = []

  public get length() { return this._items.length }

  public constructor()
  public constructor(data: T[])
  public constructor(data: [string, any][], keyVal?: boolean)
  public constructor(data?: any, keyVal: boolean = false) {
    // data && data.length > 0 && this._items.push(...data)
    if (data && Array.isArray(data)) {
      if (data.every(i => Array.isArray(i) && i.length == 2)) {
        this._items.push(...data.map<any>(i => ({ key: i[0], value: i[1] })) as T[])
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

  /**
   * Gets all of the items in the collection.
   *
   * @returns
   * @memberof Collection
   */
  public all() {
    return this._items
  }

  /**
   * Gets a random item in the collection.
   *
   * @returns
   * @memberof Collection
   */
  public random() {
    let idx = Math.floor(Math.random() * this._items.length)
    return this._items[idx]
  }

  /**
   * Gets a random item in the collection based on the indexes.
   *
   * @param {...number[]} indexes Indexes to select from.
   * @returns
   * @memberof Collection
   */
  public choose(...indexes: number[]) {
    let index = indexes[Math.floor(Math.random() * indexes.length)]
    return this._items[index] || null
  }

  /**
   * Combines two collections using the original collection for the keys
   * and the other collection as the values.
   *
   * @param {Collection<any>} values The values for the new collection.
   * @returns {object}
   * @memberof Collection
   */
  public combine(values: Collection<any>): object {
    if (
      this._items.every(i => typeof i == 'string' && i.length > 0)
    ) {
      let result = {}
      let items = <string[]><unknown>this._items
      for (let i in items) {
        result[items[i]] = values.get(i)
      }
      return result
    }
    throw new Error('Cannot combine, source collection must be all strings of one or more characters')
  }

  /**
   * Sorts a collection using a callback
   *
   * @param {(a: T, b: T) => number} callback The callback for the sort operation
   * @returns
   * @memberof Collection
   */
  public sort(callback: (a: T, b: T) => number) {
    this._items = this._items.sort(callback)
    return this
  }

  /**
   * Shuffles items within the collection
   *
   * @returns
   * @memberof Collection
   */
  public shuffle() {
    let a = this._items
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    this._items = a
    return this
  }

  /**
   * Filters the items within the collection if they pass the callback test
   *
   * **Note:** This is the opposite of reject
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public filter(callback: (value: T, index: number, array: T[]) => boolean) {
    this._items = this._items.filter(callback)
    return this
  }

  /**
   * Filters the items within the collection if they don't pass the callback test
   *
   * **Note:** This is the opposite of filter
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public reject(callback: (value: T, index: number, array: T[]) => boolean) {
    let newArray: T[] = []
    for (let idx in this._items) {
      if (!callback(this._items[idx], parseInt(idx), this._items)) {
        newArray.push(this._items[idx])
      }
    }
    this._items = newArray
    return this
  }

  /**
   * Separates items into truthy and falsy collections
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public separate(callback: (value: T, index: number, array: T[]) => boolean) {
    let truthy: T[] = []
    let falsy: T[] = []
    for (let idx in this._items) {
      callback(this._items[idx], parseInt(idx), this._items) ?
        truthy.push(this._items[idx]) :
        falsy.push(this._items[idx])
    }
    return { truthy: collect(truthy), falsy: collect(falsy) }
  }

  /**
   * Gets the first item that returns true within the callback
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public first(callback: (value: T, index: number, array: T[]) => boolean) {
    return this._items.find(callback)
  }

  /**
   * Gets the last item that returned true within the callback
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public last(callback: (value: T, index?: number, array?: T[]) => boolean) {
    return this._items.filter(callback).pop()
  }

  /**
   * Runs a callback on each item of the collection. This does not modify the collection.
   *
   * @param {(value: any, index: string, array: T[]) => void} callback The callback to execute.
   * @memberof Collection
   */
  public each(callback: (value: any, index: string, array: T[]) => void) {
    for (let i in this._items) {
      callback(this._items[i], i, this._items)
    }
  }

  /**
   * Runs a callback on each item of the collection. This modifies the existing collection.
   *
   * @param {(value: T, index: number, array: T[]) => any} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public walk(callback: (value: T, index: number, array: T[]) => any) {
    this._items = this._items.map(callback)
    return this
  }

  /**
   * Runs a callback on each item of the collection. This does not modify the existing collection.
   * A new collection is returned with the resulting data.
   *
   * @param {(value: T, index: number, array: T[]) => any} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public map(callback: (value: T, index: number, array: T[]) => any) {
    return collect(this._items.map(callback))
  }

  /**
   * Reverses the order of the items in the collection.
   *
   * @returns
   * @memberof Collection
   */
  public reverse() {
    this._items = this._items.reverse()
    return this
  }

  /**
   * Runs a callback on the collection where each item must return true to succeed.
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public every(callback: (value: T, index: number, array: T[]) => boolean) {
    return this._items.every(callback)
  }

  /**
   * Runs a callback on the collection where only some of the items musth return true to succeed.
   *
   * @param {(value: T, index: number, array: T[]) => boolean} callback The callback to execute.
   * @returns
   * @memberof Collection
   */
  public some(callback: (value: T, index: number, array: T[]) => boolean) {
    return this._items.some(callback)
  }

  /**
   * Gets a collection where the requested keys are not present on an item.
   *
   * @param {(...(string | number)[])} keys The keys that shouldn't exist.
   * @returns
   * @memberof Collection
   */
  public except(...keys: (string | number)[]) {
    let result: T[] = []
    for (let i of this._items) {
      if (!Object.keys(i).some(key => keys.includes(key))) {
        result.push(i)
      }
    }
    return collect(result)
  }

  /**
   * Gets a collection of the even or odd items based on index.
   *
   * @param {('even' | 'odd')} value
   * @param {number} [offset]
   * @memberof Collection
   */
  public nth(value: 'even' | 'odd', offset?: number)
  /**
   * Gets a collection of the nth item based on index.
   *
   * @param {number} value A number to get all nth items.
   * @param {number} [offset] An offset in which to start.
   * @returns
   * @memberof Collection
   */
  public nth(value: number, offset?: number)
  public nth(value: number | 'even' | 'odd', offset?: number) {
    let items: T[] = []
    let currItems = offset && offset > 0 ? this._items.slice(offset) : this._items
    for (let i in currItems) {
      let key = parseInt(i)
      if (value == 'even') {
        if (key % 2 == 0) items.push(currItems[key])
      } else if (value == 'odd') {
        if (key % 2 != 0) items.push(currItems[key])
      } else {
        if (key % value == 0) items.push(currItems[key])
      }
    }
    return collect(items)
  }

  /**
   * Creates a clone of the current collection.
   *
   * @returns
   * @memberof Collection
   */
  public clone() {
    return collect<T>([...this._items]) as Collection<T>
  }

  /**
   * Tests if the collection is empty.
   *
   * @returns
   * @memberof Collection
   */
  public isEmpty() {
    return this._items.length == 0
  }

  /**
   * Tests if the collection is not empty.
   *
   * @returns
   * @memberof Collection
   */
  public isNotEmpty() {
    return this._items.length > 0
  }

  /**
   * Converts the collection to json.
   *
   * @returns
   * @memberof Collection
   */
  public toJson() {
    return JSON.stringify(this._items)
  }

  public pluck(value: string, key: string): object
  public pluck(value: string): Collection<any>
  public pluck(value: string, key?: string) {
    if (key) {
      return this._items.reduce<object>((obj, itm) => {
        if (typeof itm == 'object' && itm[value]) obj[itm[key]] = itm[value]
        return obj
      }, {})
    } else {
      return collect(this._items.reduce<any[]>((obj, itm) => {
        if (typeof itm == 'object' && itm[value]) return obj.concat(itm[value])
        return obj
      }, []))
    }
  }

  /**
   * Gets an item from the collection based on index
   *
   * @param {(number | string)} index The index the item is located at.
   * @returns
   * @memberof Collection
   */
  public get(index: number | string) {
    return this._items[index]
  }

  /**
   * Adds an item to the collection
   *
   * @param {(T | T[])} item The item to add.
   * @memberof Collection
   */
  public add(item: T | T[]) {
    Array.isArray(item) ?
      this._items.push(...item) :
      this._items.push(item)
  }

  /**
   * Removes an item from the collection
   *
   * @param {T} item The item to remove.
   * @memberof Collection
   */
  public remove(item: T) {
    let idx = this._items.indexOf(item)
    idx > -1 && this._items.splice(idx, 1)
  }

  /**
   * Removes an item from the collection at a given index.
   *
   * @param {number} index The index the item is located at.
   * @memberof Collection
   */
  public removeAt(index: number) {
    index > -1 && index < this._items.length && this._items.splice(index, 1)
  }
}