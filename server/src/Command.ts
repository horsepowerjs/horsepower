export abstract class Command {
  public abstract name: string
  public abstract description: string

  public abstract fire(): void
}