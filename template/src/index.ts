import { Template, parseFile, step, extend, getData, find } from './helpers'
import { getMixins } from './helpers/mixin'
import { minify } from 'html-minifier'

export interface TemplateData {
  originalData: { [key: string]: any }
  scopes: {
    reference: string
    data: { [key: string]: any }
  }[]
}

export type Nullable<T> = T | null | undefined

// Find values between "{{" and "}}" and not between html tags "<" and ">"
// Starts with a "$" and not followed by a "\d" or "."
// Valid Examples: {{$cat}}, {{$i.name}}
// Invalid Examples: {{$234}}, {{$.name}}
export function variableMatch(key: string) {
  return new RegExp(`\\{\\{(\\$(?!(\\d|\\.))${key}[.\\w]*)(?![^\\<]*\\>)\\}\\}`, 'g')
}

export function getScopeData(search: string, data: TemplateData, scope?: Nullable<string>, key?: Nullable<string | number>) {
  let dataToSearch = data.originalData
  // console.log('scope', scope)
  if (search.split('.').length == 1 && !scope) {
    return data.originalData[search.replace(/^\$/, '')]
  } if (typeof scope == 'string' && scope.length > 0) {
    dataToSearch = data.scopes && data.scopes.length > 0 ?
      (data.scopes.find(i => i.reference == scope.replace(/^\$/, '')) || { data: {} }).data : {}
  }
  // console.log(scope, search, dataToSearch)
  // console.log('search', search, key, search.replace(new RegExp(`^\\$${scope}`), (key && ['string', 'number'].includes(typeof key) ? key : '').toString()).replace(/^\$/, ''))
  return find(search.replace(new RegExp(`^\\$${scope}`), (key || search.replace(/^\$/, '')).toString()), dataToSearch)
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
    if (rootTpl.document.documentElement) {
      rootTpl.document.documentElement.innerHTML =
        rootTpl.document.documentElement.innerHTML
          .replace(/\{\{(.+?)\}\}/g, (full, val) => getData(val, this.templateData))
    }
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