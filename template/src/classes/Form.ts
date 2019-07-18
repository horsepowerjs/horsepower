import { Session } from '@red5/session'

interface FormAttributes {
  [key: string]: string | number | boolean | undefined
}

interface FormOpen extends FormAttributes {
  files: boolean
}

interface Data {
  get: object;
  post: object;
  request: object;
  session: Session;
  params: {
    [key: string]: string;
  };
}

export class Form {

  private readonly data: Data

  public constructor(data: Data) {
    this.data = data
  }

  /**
   * Opens a new form
   *
   * @static
   * @param {FormOpen} [attributes]
   * @returns
   * @memberof Form
   */
  public open(action?: string, isPost?: boolean, attributes?: FormOpen): string
  public open(action?: string, attributes?: FormOpen): string
  public open(...args: any[]) {
    let action = args[0]
    let isPost = args.length == 3 ? args[1] : true
    let attributes = args.length == 3 ? args[2] : args[1]
    let str = Form._openTag('form', Object.assign({}, attributes, {
      action: typeof action == 'string' && action,
      method: isPost && 'post',
      enctype: attributes && attributes.files ? 'multipart/form-data' : false
    }), undefined, ['files'])
    let token = ''
    if (isPost) token = this.token()
    return str + token
  }

  /**
   * Closes the current form
   *
   * @static
   * @returns
   * @memberof Form
   */
  public close() {
    return Form._closeTag('form')
  }

  public token() {
    return this.data.session ? this.hidden('_token', this.data.session.csrf) : ''
  }
  public label(text: string, attributes?: FormAttributes) {
    return Form._openTag('label', Object.assign({}, attributes), text)
  }

  /**
   * Creates a text input field
   *
   * @static
   * @param {string} name The name of the field
   * @param {string} [initial] An initial value of the field
   * @param {FormAttributes} [attributes] Addition form attributes
   * @returns
   * @memberof Form
   */
  public text(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'text'
    }))
  }

  public search(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'search'
    }))
  }

  public email(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'email'
    }))
  }

  public phone(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'tel'
    }))
  }

  public url(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'url'
    }))
  }

  public week(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'week'
    }))
  }

  public password(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'password'
    }))
  }

  public number(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'number'
    }))
  }

  public date(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'date'
    }))
  }

  public time(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'time'
    }))
  }

  public datetime(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'datetime-local'
    }))
  }

  public color(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'color'
    }))
  }

  public hidden(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'hidden'
    }))
  }

  public image(name: string, src: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, src,
      type: 'image'
    }))
  }

  public range(name: string, initial?: number, min?: number, max?: number, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'range',
      min, max
    }))
  }

  public month(name: string, initial?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'month'
    }))
  }

  /**
   * Creates a form textarea
   *
   * @static
   * @param {string} name The name of the textarea
   * @param {string} [initial=''] The initial value of the textarea
   * @param {FormAttributes} [attributes] Additional textarea attributes
   * @returns
   * @memberof Form
   */
  public textarea(name: string, initial: string = '', attributes?: FormAttributes) {
    return Form._openTag('textarea', Object.assign({}, attributes, {
      name, value: initial,
    }), initial)
  }

  /**
   * Creates a form checkbox
   *
   * @static
   * @param {string} name The name of the checkbox
   * @param {boolean} [enabled=false] The initial check state of the checkbox
   * @param {FormAttributes} [attributes] Additional checkbox attributes
   * @returns
   * @memberof Form
   */
  public check(name: string, value: string, text: string, enabled?: boolean, attributes?: FormAttributes): string
  public check(name: string, value: string, enabled?: boolean, attributes?: FormAttributes): string
  public check(...args: any[]) {
    let name = args[0] as string
    let value = args[1] as string
    let text = (typeof args[2] == 'string' ? args[2] : '') as string
    let enabled = (typeof args[2] == 'boolean' ? args[2] : false) as boolean
    let attributes = (args.length == 5 ? args[4] : args[3]) as FormAttributes
    let tag = Form._openTag('input', Object.assign({}, attributes, {
      name, value,
      type: 'checkbox',
      checked: enabled
    }))
    if (text.length > 0) tag = this.label(`${tag} ${text}`)
    return tag
  }

  public radio(name: string, value: string, text: string, enabled?: boolean, attributes?: FormAttributes): string
  public radio(name: string, value: string, enabled?: boolean, attributes?: FormAttributes): string
  public radio(...args: any[]) {
    let name = args[0] as string
    let value = args[1] as string
    let text = (typeof args[2] == 'string' ? args[2] : '') as string
    let enabled = (typeof args[2] == 'boolean' ? args[2] : false) as boolean
    let attributes = (args.length == 5 ? args[4] : args[3]) as FormAttributes
    let tag = Form._openTag('input', Object.assign({}, attributes, {
      name, value,
      type: 'radio',
      checked: enabled
    }))
    if (text.length > 0) tag = this.label(`${tag} ${text}`)
    return tag
  }

  public radios(name: string, items: { value: string, text: string, enabled: boolean, attributes?: FormAttributes }[]) {
    return items.map(itm => this.radio(name || '', itm.value || '', itm.text || '', !!itm.enabled, itm.attributes || {})).join('')
  }

  public select(name: string, value: any[] | object, selected: any, attributes?: FormAttributes) {
    let select = Form._openTag('select', Object.assign({}, attributes, { name }))
    select += Object.entries(value).map(([key, val]) => {
      if (Array.isArray(value)) {
        return Form._openTag('option', Object.assign({}, { value: val, selected: selected == val }), val)
      } else if (typeof value == 'object') {
        return Form._openTag('option', Object.assign({}, { value: key, selected: selected == key }), val)
      }
    }).join('')
    select += Form._closeTag('select')
    return select
  }

  public button(name: string, value: string, attributes?: FormAttributes) {
    return Form._openTag('button', Object.assign({}, attributes, {
      type: 'button', name
    }), value)
  }

  public submit(name: string, value?: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      type: 'submit', name, value
    }))
  }

  public reset(name: string, value: string, attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      type: 'reset', name, value
    }))
  }

  public file(name: string, accept: string = '*', attributes?: FormAttributes) {
    return Form._openTag('input', Object.assign({}, attributes, {
      name, type: 'file', accept
    }))
  }

  private static _openTag(tag: string, options?: object, text?: string, ignored?: string[]) {
    let result = `<${tag}` + (typeof options == 'object' && ' ' + Object.entries(options)
      .filter(([key, value]) => {
        if (ignored && ignored.includes(key)) return false
        if (typeof value == 'boolean' && value === true) return true
        else if (typeof value != 'boolean') return true
        return false
      })
      .map(([key, value]) => {
        if (typeof value == 'boolean' && value === true) return key
        else if (typeof value != 'undefined' && value !== null)
          return `${key}="${value}"`
        return ''
      })
      .join(' ')) + '>'
    // result += typeof text == 'string' && text || ''
    result += typeof text == 'string' && (text + Form._closeTag(tag)) || ''
    return result
  }

  private static _closeTag(tag: string) {
    return `</${tag}>`
  }
}