interface FormOpen {
  [key: string]: string | number | undefined
  method?: 'get' | 'post'
  action?: string
}

interface FormText {

}

export class Form {
  public static open(options?: FormOpen) {
    return this._open('form', options)
  }

  public static close() {
    return this._close('form')
  }

  public static text(name: string, initial: string, options?: FormText) {
    return this._open('input', Object.assign({}, {
      name, value: initial,
      type: 'text'
    }, options))
  }

  public static checkbox(name: string, enabled: boolean = false, options?: FormText) {
    return this._open('input', Object.assign({
      name,
      checked: enabled
    }, options))
  }

  private static _open(tag: string, options?: object, text?: string) {
    let result = `<${tag}` + (typeof options == 'object' && ' ' + Object.entries(options).map(([key, value]) => `${key}="${value}"`).join(' ')) + '>'
    // result += typeof text == 'string' && text || ''
    result += typeof text == 'string' && text + this._close(tag) || ''
    return result
  }

  private static _close(tag: string) {
    return `</${tag}>`
  }
}