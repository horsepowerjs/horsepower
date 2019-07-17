interface FormOpen {
  [key: string]: string | number | undefined
  method?: 'get' | 'post'
  action?: string
}

interface FormAttributes {

}

export class Form {

  /**
   * Opens a new form
   *
   * @static
   * @param {FormOpen} [options]
   * @returns
   * @memberof Form
   */
  public static open(options?: FormOpen) {
    return this._openTag('form', options)
  }

  /**
   * Closes the current form
   *
   * @static
   * @returns
   * @memberof Form
   */
  public static close() {
    return this._closeTag('form')
  }

  public static label(text: string, attributes?: FormAttributes) {
    return this._openTag('label', Object.assign({}, attributes), text)
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
  public static text(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'text'
    }))
  }

  public static search(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'search'
    }))
  }

  public static email(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'email'
    }))
  }

  public static phone(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'tel'
    }))
  }

  public static url(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'url'
    }))
  }

  public static week(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'week'
    }))
  }

  public static password(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'password'
    }))
  }

  public static number(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'number'
    }))
  }

  public static date(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'date'
    }))
  }

  public static time(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'time'
    }))
  }

  public static datetime(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'datetime-local'
    }))
  }

  public static color(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'color'
    }))
  }

  public static hidden(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'hidden'
    }))
  }

  public static image(name: string, src: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, src,
      type: 'image'
    }))
  }

  public static range(name: string, initial?: number, min?: number, max?: number, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, value: initial,
      type: 'range',
      min, max
    }))
  }

  public static month(name: string, initial?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
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
  public static textarea(name: string, initial: string = '', attributes?: FormAttributes) {
    return this._openTag('textarea', Object.assign({}, attributes, {
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
  public static check(name: string, value: string, text: string, enabled?: boolean, attributes?: FormAttributes): string
  public static check(name: string, value: string, enabled?: boolean, attributes?: FormAttributes): string
  public static check(...args: any[]) {
    let name = args[0] as string
    let value = args[1] as string
    let text = (typeof args[2] == 'string' ? args[2] : '') as string
    let enabled = (typeof args[2] == 'boolean' ? args[2] : false) as boolean
    let attributes = (args.length == 5 ? args[4] : args[3]) as FormAttributes
    let tag = this._openTag('input', Object.assign({}, attributes, {
      name, value,
      type: 'checkbox',
      checked: enabled
    }))
    if (text.length > 0) tag = this.label(`${tag} ${text}`)
    return tag
  }

  public static radio(name: string, value: string, text: string, enabled?: boolean, attributes?: FormAttributes): string
  public static radio(name: string, value: string, enabled?: boolean, attributes?: FormAttributes): string
  public static radio(...args: any[]) {
    let name = args[0] as string
    let value = args[1] as string
    let text = (typeof args[2] == 'string' ? args[2] : '') as string
    let enabled = (typeof args[2] == 'boolean' ? args[2] : false) as boolean
    let attributes = (args.length == 5 ? args[4] : args[3]) as FormAttributes
    let tag = this._openTag('input', Object.assign({}, attributes, {
      name, value,
      type: 'radio',
      checked: enabled
    }))
    if (text.length > 0) tag = this.label(`${tag} ${text}`)
    return tag
  }

  public static radios(name: string, items: { value: string, text: string, enabled: boolean, attributes?: FormAttributes }[]) {
    return items.map(itm => this.radio(name || '', itm.value || '', itm.text || '', !!itm.enabled, itm.attributes || {})).join('')
  }

  public static select(name: string, value: any[] | object, selected: any, attributes?: FormAttributes) {
    let select = this._openTag('select', Object.assign({}, attributes, { name }))
    select += Object.entries(value).map(([key, val]) => {
      if (Array.isArray(value)) {
        return this._openTag('option', Object.assign({}, { value: val, selected: selected == val }), val)
      } else if (typeof value == 'object') {
        return this._openTag('option', Object.assign({}, { value: key, selected: selected == key }), val)
      }
    }).join('')
    select += this._closeTag('select')
    return select
  }

  public static button(name: string, value: string, attributes?: FormAttributes) {
    return this._openTag('button', Object.assign({}, attributes, {
      type: 'button', name
    }), value)
  }

  public static submit(name: string, value?: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      type: 'submit', name, value
    }))
  }

  public static reset(name: string, value: string, attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      type: 'reset', name, value
    }))
  }

  public static file(name: string, accept: string = '*', attributes?: FormAttributes) {
    return this._openTag('input', Object.assign({}, attributes, {
      name, type: 'file', accept
    }))
  }

  private static _openTag(tag: string, options?: object, text?: string) {
    let result = `<${tag}` + (typeof options == 'object' && ' ' + Object.entries(options)
      .filter(([key, value]) => {
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
    result += typeof text == 'string' && (text + this._closeTag(tag)) || ''
    return result
  }

  private static _closeTag(tag: string) {
    return `</${tag}>`
  }
}