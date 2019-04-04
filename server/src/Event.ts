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
  public static async trigger<T extends object>(name: string, data?: T) {
    this._events.forEach(async i => i.name == name && i.action(new EventAction(data)))
  }

  public static on(name: string, action: (event: EventAction) => void) {
    this._events.push({ name, action })
    return this
  }

  public static off(name: string, action: (event: EventAction) => void) {
    this._events = this._events.filter(i => i.name != name && i.action != action)
    return this
  }

  public static clear() {
    this._events = []
    return this
  }
  //////////////////////////////////////////////////////////////////////////////
  // Local Events
  //////////////////////////////////////////////////////////////////////////////
  public async trigger<T extends object>(name: string, data?: T) {
    this._localEvents.forEach(async i => i.name == name && i.action(new EventAction(data)))
  }

  public on(name: string, action: (event: EventAction) => void) {
    this._localEvents.push({ name, action })
    return this
  }

  public off(name: string, action: (event: EventAction) => void) {
    this._localEvents = this._localEvents.filter(i => i.name != name && i.action != action)
    return this
  }

  public clear() {
    this._localEvents = []
    return this
  }
}