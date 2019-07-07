import { OptionDefinition } from 'command-line-args'
import * as cmdArgs from 'command-line-args'

export abstract class Command {
  public abstract name: string
  public abstract description: string
  public abstract options: OptionDefinition[]

  public abstract fire(): void

  /** @internal */
  public makeArgs(mainDefinitions: any) {
    const mainOptions = cmdArgs(mainDefinitions, { stopAtFirstUnknown: true } as any)
    let argv = mainOptions._unknown || []

    return cmdArgs(this.options, { argv, stopAtFirstUnknown: true } as any)
  }
}