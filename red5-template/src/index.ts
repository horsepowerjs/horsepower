import { Template, parseFile, step, extend } from './helpers'
import { getMixins } from './helpers/mixin'
import { minify } from 'html-minifier'

export class Red5Template {

  private data: object

  public constructor(options: object = {}) {
    this.data = options
  }

  public static async render(file: string, data: { [key: string]: any } = {}) {
    let r5tpl = new Red5Template(data)
    let tpl = await parseFile(file)
    let dom = await r5tpl.build(tpl)
    let html = dom.dom.serialize()
    return minify(html, {
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    })
  }

  public async build(tpl: Template) {
    let rootTpl = await extend(tpl)
    let mixins = getMixins(rootTpl)
    await step(rootTpl, rootTpl.document, this.data, mixins)
    return rootTpl
  }

}