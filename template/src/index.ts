import { Template, parseFile, step, extend, getData, find } from './helpers'
import { getMixins } from './helpers/mixin'
import { minify, Options } from 'html-minifier'

export interface TemplateData {
  originalData: { [key: string]: any }
  scopes: {
    reference: string
    data: { [key: string]: any }
  }[]
}

export type Nullable<T> = T | null | undefined

export class Red5Template {

  private templateData: TemplateData

  private constructor(options: TemplateData) {
    this.templateData = options
  }

  /**
   * Builds the Template
   *
   * @param {Template} tpl The template to build
   * @returns {Promise<Template>} The rebuilt template
   * @memberof Red5Template
   */
  public async build(tpl: Template): Promise<Template> {
    let rootTpl = await extend(tpl)
    let mixins = getMixins(rootTpl)
    await step(rootTpl, rootTpl.document, this.templateData, mixins)
    if (rootTpl.document.documentElement) {
      rootTpl.document.documentElement.innerHTML =
        rootTpl.document.documentElement.innerHTML
          .replace(/\{\{(.+?)\}\}/g, (full, val) => getData(val, this.templateData))
    }
    return rootTpl
  }

  /**
   * Renders a template
   *
   * @static
   * @param {string} file The starting file to render
   * @param {object} [data={}] The template data
   * @param {Options} [minifyOptions] Options to minify the output using [html-minifier](https://www.npmjs.com/package/html-minifier#options-quick-reference)
   * @returns {Promise<string>}
   * @memberof Red5Template
   */
  public static async render(file: string, data: object = {}, minifyOptions?: Options): Promise<string> {
    try {
      let templateData: TemplateData = { originalData: {}, scopes: [] }
      templateData.originalData = Object.assign<object, object>(templateData.originalData, data)
      let r5tpl = new Red5Template(templateData)
      let html = ''
      html = (await r5tpl.build(await parseFile(file))).dom.serialize()

      let defaultMinifyOptions = {
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
      }

      return minify(html, minifyOptions ? Object.assign(defaultMinifyOptions, minifyOptions) : defaultMinifyOptions)
    } catch (e) {
      throw e
    }
  }
}