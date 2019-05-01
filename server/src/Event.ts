interface IEvent {
  name: string
  action(data: any): void
}

export class EventAction {
  public readonly data: any = null
  public constructor(data: any) {
    this.data = data
  }
}

export class Events {
  private static _events: IEvent[] = []
  private _localEvents: IEvent[] = []

  //////////////////////////////////////////////////////////////////////////////
  // Global Events
  //////////////////////////////////////////////////////////////////////////////
  /**
   * Triggers a global event on the application
   *
   * @static
   * @template T
   * @param {string} name The name of the event
   * @param {T} [data] The data to send to the event
   * @memberof Events
   */
  public static async trigger<T extends object>(name: string, data?: T) {
    this._events.forEach(async i => i.name == name && i.action(new EventAction(data)))
  }

  /**
   * Adds a global event to the application
   *
   * @static
   * @param {string} name The name of the event
   * @param {(event: EventAction) => void} action The action that should be executed
   * @returns
   * @memberof Events
   */
  public static on(name: string, action: (event: EventAction) => void) {
    this._events.push({ name, action })
    return this
  }

  /**
   * Removes a global event from the application
   *
   * @static
   * @param {string} name The name of the event
   * @param {(event: EventAction) => void} [action] An option action. If no action is passed all events with this name are removed
   * @returns
   * @memberof Events
   */
  public static off(name: string, action?: (event: EventAction) => void) {
    if (action) this._events = this._events.filter(i => i.name != name && i.action != action)
    else this._events = this._events.filter(i => i.name != name)
    return this
  }

  /**
   * Removes all global events from the application
   *
   * @static
   * @returns
   * @memberof Events
   */
  public static clear() {
    this._events = []
    return this
  }

  //////////////////////////////////////////////////////////////////////////////
  // Local Events
  //////////////////////////////////////////////////////////////////////////////
  /**
   * Triggers a local event
   *
   * @template T
   * @param {string} name The name of the local event
   * @param {T} [data] Optional data to send to the local event
   * @memberof Events
   */
  public async trigger<T extends object>(name: string, data?: T) {
    this._localEvents.forEach(async i => i.name == name && i.action(new EventAction(data)))
  }

  /**
   * Adds a local event to the instance
   *
   * @param {string} name The name of the event
   * @param {(event: EventAction) => void} action The action that should be executed
   * @returns
   * @memberof Events
   */
  public on(name: string, action: (event: EventAction) => void) {
    this._localEvents.push({ name, action })
    return this
  }

  /**
   * Removes a local event from the instance
   *
   * @param {string} name The name of the event
   * @param {(event: EventAction) => void} [action] An option action. If no action is passed all events with this name are removed
   * @returns
   * @memberof Events
   */
  public off(name: string, action?: (event: EventAction) => void) {
    if (action) this._localEvents = this._localEvents.filter(i => i.name != name && i.action != action)
    else this._localEvents = this._localEvents.filter(i => i.name != name)
    return this
  }

  /**
   * Removes all local events from the instance
   *
   * @returns
   * @memberof Events
   */
  public clear() {
    this._localEvents = []
    return this
  }
}