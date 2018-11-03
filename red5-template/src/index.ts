import { JSDOM, DOMWindow } from 'jsdom'
import * as path from 'path'
import { readFile } from 'fs';

interface Template {
  dom: JSDOM
  document: Document
  body: HTMLBodyElement
  file: string
  child?: Template
}

interface ENV extends Object {
  APP_ENV: string
}

interface Mixin {
  name: string
  element: Element
}

export class Red5Template {

  private options: object
  private env: ENV
  private rootTpl!: Template

  private mixins: Mixin[] = []

  private get window(): DOMWindow {
    return this.rootTpl.dom.window
  }

  public constructor(options: object = {}, env: object = {}) {
    this.options = options
    this.env = Object.assign<ENV, object>({
      APP_ENV: 'production'
    }, env)
  }

  public static async render(file: string, options: object = {}, env: object = {}) {
    let r5tpl = new Red5Template(options, env)
    let tpl = await r5tpl.parseFile(file)
    await r5tpl.build(tpl)
    return r5tpl.rootTpl.dom.serialize()
  }

  public async build(tpl: Template) {
    await this.extends(tpl)
    await this.step(this.rootTpl.document, this.options)
  }

  private async step(node: Document | Element | DocumentFragment, data: object): Promise<any> {
    for (let child of node.children) {
      let name = child.nodeName.toLowerCase()
      // Elements based on tag name
      switch (name) {
        case 'import':
          await this.importBlock(child, data)
          return this.step(node, data)
        case 'block':
          await this.block(child, data)
          return this.step(node, data)
        case 'mixin':
          await this.mixin(child, data)
          return this.step(node, data)
        // TODO: Get includes working to include mixins
        case 'include':
          await this.includeMixin(child, data)
          return this.step(node, data)
        // TODO: Add elif/else statements
        case 'if':
          await this.ifBlock(child, data)
          return this.step(node, data)
        case 'debug':
          await this.debugBlock(child, data)
          return this.step(node, data)
      }
      // Elements based on attribute
      for (let attr of child.attributes) {
        let attrName = attr.name
        switch (attrName) {
          case 'each':
            await this.eachBlock(child, data)
            return this.step(node, data)
          case 'for':
            await this.forBlock(child, data)
            return this.step(node, data)
        }
      }
      if (child.children.length > 0) {
        await this.step(child, data)
      }
    }
  }

  private async extends(tpl: Template) {
    let document = tpl.document
    let item = document.querySelector(':scope > extends')
    if (!item) return tpl
    let inclFileName = item.getAttribute('file')
    if (inclFileName && item.parentElement) {
      let dir = path.dirname(tpl.file)
      let file = path.resolve(dir, inclFileName + (!inclFileName.endsWith('.rtpl') ? '.rtpl' : ''))
      let parent = await this.parseFile(file)
      if (parent) {
        parent.child = tpl
        this.rootTpl = parent
        let ext = parent.document.querySelector('extends')
        if (ext && ext.parentElement) {
          ext.replaceWith(tpl.document)
          this.extends(parent)
        }
        return parent
      }
    }
    this.rootTpl = tpl
    return tpl
  }

  private async importBlock(element: Element, data: object) {
    let inclFileName = element.getAttribute('file')
    if (inclFileName && element.ownerDocument && inclFileName.length > 0) {
      let dir = path.dirname(this.rootTpl.file)
      let file = path.resolve(dir, inclFileName + (!inclFileName.endsWith('.red5') ? '.red5' : ''))
      let frag = await this.fragmentFromFile(file)
      this.step(frag, data)
      frag && element.replaceWith(frag)
    }
  }

  private ifBlock(element: Element, data: object) {
    if (!element.ownerDocument) return element.remove()
    let frag = element.ownerDocument.createDocumentFragment()
    let condition = element.getAttribute('condition') || 'false'
    let result = !!eval(this.replaceHolders(condition, data))
    if (result == true) {
      for (let child of element.childNodes) {
        frag.appendChild(child.cloneNode(true))
      }
    }
    this.step(frag, data)
    element.replaceWith(frag)
  }

  private debugBlock(element: Element, data: object) {
    // get the data to write to the console
    let log = element.getAttribute('log')
    let error = element.getAttribute('error')
    let warn = element.getAttribute('warn')
    let info = element.getAttribute('info')
    // Remove the element so it doesn't display in the output
    element.remove()
    // If this is production do not debug
    if (this.env.APP_ENV.toLowerCase() == 'production') return
    // log everything
    if (log) console.log(this.replaceHolders(log, data))
    if (error) console.error(this.replaceHolders(error, data))
    if (warn) console.warn(this.replaceHolders(warn, data))
    if (info) console.info(this.replaceHolders(info, data))
  }

  private block(element: Element, data: object) {
    let name = element.getAttribute('name')
    if (!element.ownerDocument) return
    let frag = element.ownerDocument.createDocumentFragment()
    if (this.rootTpl.child && element.parentElement && name) {
      let childBlock = this.rootTpl.child.document.querySelector(`block[name=${name}]`)
      if (childBlock && element) {
        for (let child of childBlock.children) {
          frag.appendChild(child.cloneNode(true))
        }
      }
    }
    this.step(frag, data)
    element.replaceWith(frag)
  }

  private mixin(element: Element, data: object) {
    let name = element.getAttribute('name')
    if (name && !this.getMixin(name)) {
      this.mixins.push({ name, element: element.cloneNode(true) as Element })
    }
    element.remove()
  }

  private includeMixin(element: Element, data: object) {
    element.remove()
    return
    // let name = element.getAttribute('mixin') || ''
    // element.removeAttribute('mixin')
    // let mixin = this.getMixin(name)
    // if (mixin && element.ownerDocument) {
    //   let frag = element.ownerDocument.createDocumentFragment()
    //   let dta: { [key: string]: any } = {}
    //   let each = element.attributes.getNamedItem('each')
    //   if (each) {
    //     // this.eachBlock(element, data)
    //     // return
    //     //   return this.step(element.parentElement, data)
    //   }
    //   for (let attr of element.attributes) {
    //     dta[attr.name] = this.getData(attr.value, data)
    //   }
    //   console.log(dta)
    //   for (let child of mixin.children) {
    //     frag.appendChild(child)
    //     //   for (let attr of mixin.attributes) {
    //     //     if (attr.name == 'name') continue
    //     //     console.log(attr.name, attr.value)
    //     //     child.innerHTML = child.innerHTML.replace(new RegExp(`\{\{${attr.name}\}\}`, 'g'), attr.value)
    //     //   }
    //   }
    //   // console.log(mixin.outerHTML)
    //   element.replaceWith(frag)
    // }
  }

  private async eachBlock(element: Element, data: object) {
    let query = element.getAttribute('each')
    element.removeAttribute('each')
    if (query && element.ownerDocument) {
      let key = '', value = ''
      let [placeholderKeys, placeholderData] = query.split(' in ')
      if (!placeholderKeys || !placeholderData) {
        return
      }
      placeholderKeys = placeholderKeys.trim()
      if (placeholderKeys.startsWith('[') && placeholderKeys.endsWith(']')) {
        [key, value] = placeholderKeys.replace(/^\[|\]$/g, '').split(',').map(i => i.trim())
      } else {
        value = placeholderKeys
      }

      let dataObject = this.getData(placeholderData, data)
      if (dataObject && typeof dataObject[Symbol.iterator] == 'function') {
        let frag = element.ownerDocument.createDocumentFragment()
        if (dataObject.length == 0) {
          for (let child of element.children) {
            if (child.nodeName.toLowerCase() == 'empty') {
              for (let c of child.children) {
                let clone = c.cloneNode(true) as HTMLElement
                frag.appendChild(clone)
              }
            }
          }
        } else {
          for (let k in dataObject) {
            let clone = element.cloneNode(true) as HTMLElement
            for (let child of clone.children) {
              if (child.nodeName.toLowerCase() == 'empty') {
                child.remove()
              }
            }
            frag.appendChild(clone)
            // console.log('here')
            let v = dataObject[k]
            clone.innerHTML = clone.innerHTML
              .replace(new RegExp(`\{\{${value}\}\}`, 'g'), v)
              .replace(new RegExp(`\{\{${key}\}\}`, 'g'), k)
            // for (let attr of clone.attributes) {
            //   attr.value = attr.value
            //     .replace(new RegExp(`\{\{${value}\}\}`, 'g'), v)
            //     .replace(new RegExp(`\{\{${key}\}\}`, 'g'), k)
            // }
            this.step(clone, dataObject)
          }
        }
        element.replaceWith(frag)
      } else {
      }
    }
  }

  private async forBlock(element: Element, data: object) {
    let query = element.getAttribute('for')
    if (query && element.ownerDocument) {
      let matches = query.replace(/\s\s+/g, ' ').split(/(\w+) from (-?\d+) (through|thru|to) (-?\d+)/i).filter(String)
      if (matches.length != 4) {
        element.removeAttribute('for')
        return
      }
      let key = matches[0].trim()
      let start = parseInt(matches[1])
      let type = matches[2].trim().toLowerCase()
      let end = parseInt(matches[3])
      element.removeAttribute('for')
      let frag = element.ownerDocument.createDocumentFragment()
      function makeNode($this: Red5Template, element: Element, frag: DocumentFragment, key: string, i: number, data: object) {
        let clone = element.cloneNode(true) as HTMLElement
        clone.innerHTML = clone.innerHTML.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i.toString())
        $this.step(clone, data)
        frag.appendChild(clone)
      }
      switch (type) {
        case 'through':
        case 'thru':
          if (start < end) {
            for (let i = start; i <= end; i++) { makeNode(this, element, frag, key, i, data) }
          } else {
            for (let i = start; i >= end; i--) { makeNode(this, element, frag, key, i, data) }
          }
          break;
        case 'to':
          if (start < end) {
            for (let i = start; i < end; i++) { makeNode(this, element, frag, key, i, data) }
          } else {
            for (let i = start; i > end; i--) { makeNode(this, element, frag, key, i, data) }
          }
          break;
      }
      element.replaceWith(frag)
    }
  }

  private makeFragment(element: string | Buffer | HTMLElement) {
    let fragment: DocumentFragment | null = null
    if (element instanceof this.rootTpl.dom.window.HTMLElement) {
      fragment = JSDOM.fragment(element.outerHTML)
    } else {
      fragment = JSDOM.fragment(element.toString())
    }
    return fragment
  }

  private fragmentFromFile(file: string) {
    return new Promise<DocumentFragment>(resolve => {
      readFile(file, (err, data) => {
        resolve(this.makeFragment(data))
      })
    })
  }

  private parseFile(file: string) {
    return new Promise<Template>(resolve => {
      readFile(file, (err, data) => {
        let tpl = new JSDOM(data)
        resolve({
          file, dom: tpl,
          document: tpl.window.document,
          body: tpl.window.document.body as HTMLBodyElement
        })
      })
    })
  }

  private replaceHolders(text: string, data: object) {
    return text.replace(/\{\{.+\}\}/g, (i) => {
      return JSON.stringify(this.find(i.replace(/^\{\{|\}\}$/g, ''), data))
    })
  }

  private getData(text: string, data: object) {
    return this.find(text.replace(/^\{\{|\}\}$/g, ''), data)
  }

  private find(query: string, data: object) {
    return query.split('.').reduce<any>((obj, val) => {
      return obj[val]
    }, data)
  }

  private getMixin(name: string) {
    let mixin = this.mixins.find(m => m.name == name)
    if (mixin) {
      return mixin.element
    }
  }

}