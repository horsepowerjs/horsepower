import { Template, parseFile, step, extend } from './helpers'
import { getMixins, Mixin } from './helpers/mixin';

export class Red5Template {

  private options: object

  public constructor(options: object = {}, env: object = {}) {
    this.options = options
  }

  public static async render(file: string, options: object = {}, env: object = {}) {
    let r5tpl = new Red5Template(options, env)
    let tpl = await parseFile(file)
    let dom = await r5tpl.build(tpl)
    return dom.dom.serialize()
  }

  public async build(tpl: Template) {
    let rootTpl = await extend(tpl)
    let mixins = getMixins(rootTpl)
    await step(rootTpl, rootTpl.document, this.options, mixins)
    return rootTpl
  }

}