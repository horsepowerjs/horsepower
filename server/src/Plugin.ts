export abstract class Plugin {
  public abstract boot(): void

  public get routes() { return this._routes }
  public get controllers() { return this._controllers }

  private _routes: string = ''
  private _controllers: string = ''

  public loadRoutes(location: string) {
    this._routes = location
  }

  public loadControllers(location: string) {
    this._controllers = location
  }

}