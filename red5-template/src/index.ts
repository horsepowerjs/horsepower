import { Template, parseFile, step, extend } from './helpers'
import { getMixins } from './helpers/mixin'
import { minify } from 'html-minifier'

export interface TemplateData {
  originalData: { [key: string]: any }
  scopes: {
    reference: string
    data: { [key: string]: any }
  }[]
}

export class Red5Template {

  private templateData: TemplateData

  private constructor(options: TemplateData) {
    this.templateData = options
  }

  public async build(tpl: Template) {
    let rootTpl = await extend(tpl)
    let mixins = getMixins(rootTpl)
    await step(rootTpl, rootTpl.document, this.templateData, mixins)
    return rootTpl
  }

  public static async render(file: string, data: object = {}) {
    let templateData: TemplateData = { originalData: {}, scopes: [] }
    templateData.originalData = Object.assign<object, object>(templateData.originalData, data)
    let r5tpl = new Red5Template(templateData)
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
}