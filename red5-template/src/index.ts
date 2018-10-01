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

export class Red5Template {

  private options: object
  private rootTpl!: Template

  private get window(): DOMWindow {
    return this.rootTpl.dom.window
  }

  public constructor(options: object = {}) {
    this.options = options
  }

  public static async render(file: string, options: object = {}) {
    let r5tpl = new Red5Template(options)
    let tpl = await r5tpl.parseFile(file)
    await r5tpl.build(tpl)
    return r5tpl.rootTpl.dom.serialize()
  }

  public async build(tpl: Template) {
    await this.extends(tpl)
    // await this.block()
    // await this.include()
    // await this.each(tpl.dom.window.document.documentElement)
    // return tpl
    await this.step(this.rootTpl.document)
  }

  private async step(node: Document | Element | DocumentFragment) {
    for (let child of node.children) {
      let name = child.nodeName.toLowerCase()
      // Elements based on tag name
      switch (name) {
        case 'include':
          await this.include(child)
          this.step(this.rootTpl.document)
          return
        case 'block':
          await this.block(child)
          this.step(this.rootTpl.document)
          return
      }
      // Elements based on attribute
      for (let attr of child.attributes) {
        let attrName = attr.name
        let attrValue = attr.value
        switch (attrName) {
          case 'each':
            this.each(child)
            break
        }
      }
      if (child.children.length > 0) {
        await this.step(child)
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
      let file = path.resolve(dir, inclFileName + (!inclFileName.endsWith('.red5') ? '.red5' : ''))
      let parent = await this.parseFile(file)
      if (parent) {
        parent.child = tpl
        this.rootTpl = parent
        let ext = parent.document.querySelector('extends')
        if (ext && ext.parentElement) {
          ext.parentElement.replaceChild(tpl.document, ext)
          this.extends(parent)
        }
        return parent
      }
    }
    this.rootTpl = tpl
    return tpl
  }

  private async include(incl: Element) {
    let inclFileName = incl.getAttribute('file')
    if (inclFileName && incl.parentElement) {
      let dir = path.dirname(this.rootTpl.file)
      let file = path.resolve(dir, inclFileName + (!inclFileName.endsWith('.red5') ? '.red5' : ''))
      let inclTpl = await this.fragmentFromFile(file)
      if (inclTpl) {
        incl.parentElement.replaceChild(inclTpl, incl)
      }
    }
  }

  private block(block: Element) {
    let name = block.getAttribute('name')
    if (this.rootTpl.child && block.parentElement && name) {
      let childBlock = this.rootTpl.child.document.querySelector(`block[name=${name}]`)
      if (childBlock) {
        let frag = block.ownerDocument.createDocumentFragment()
        for (let child of childBlock.children) {
          frag.appendChild(child)
        }
        block.parentElement.replaceChild(frag, block)
      }
    }
  }

  private async each(element: Element, preData: any[] = []) {
    // for (let child of element.children) {
    let query = element.getAttribute('each')
    console.log(query)
    if (query) {
      let key = '', value = ''
      let [placeholderKeys, placeholderData] = query.split(' of ')
      placeholderKeys = placeholderKeys.trim()
      if (placeholderKeys.startsWith('[') && placeholderKeys.endsWith(']')) {
        [key, value] = placeholderKeys.replace(/^\[|\]$/g, '').split(',')
      } else {
        value = placeholderKeys
      }
      key = key.trim()
      value = value.trim()

      let data = placeholderData.split('.').reduce((itm, val) => itm ? itm[val] : null, this.options)
      console.log(element.textContent)
      if (data) {
        // console.log('l', element.textContent)
        for (let k in data) {
          if (element.textContent) {
            let v = data[k]
            // let  element.textContent.replace(/\{\{.+\}\}/g, v)
          }
        }
      }
    }
    // if (child.children.length > 0) {
    //   await this.each(child)
    // }
    // }
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
}