export abstract class Plugin {
  public abstract boot(): void

  public get routes() { return this._routes }
  public get controllers() { return this._controllers }
  public get middleware() { return this._middleware }

  public readonly name: string

  private _routes: string = ''
  private _controllers: string = ''
  private _middleware: string = ''

  public constructor(name: string) {
    this.name = name
  }

  public loadRoutes(location: string) {
    this._routes = location
  }

  public loadControllers(location: string) {
    this._controllers = location
  }

  public loadMiddleware(location: string) {
    this._middleware = location
  }

}