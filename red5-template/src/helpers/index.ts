import { readFile } from 'fs'
import { Template } from './extend'
import { block } from './block'
import { ifBlock } from './if'
import { JSDOM } from 'jsdom'
import { importBlock } from './import'
import { debugBlock } from './debug'
import { eachBlock } from './each'
import { forBlock } from './for'
import { includeMixin, Mixin } from './mixin'
import { caseBlock } from './case'
import { TemplateData } from '..'

export * from './files'
export * from './extend'

export function getData(text: string, data: TemplateData, scope?: string) {
  let dataToSearch = data.originalData
  if (typeof scope == 'string') {
    dataToSearch = data.scopes && data.scopes.length > 0 ?
      (data.scopes.find(i => i.reference == scope) || { data: {} }).data : {}
  }
  return find(text.replace(/^\$/, ''), dataToSearch)
  // return find(text.replace(/^\{\{|\}\}$/g, ''), dataToSearch)
}

export function getVariables(string: string) {
  let results: string[] = []
  let match = (string.match(/\{\{.+?\}\}/) || [])[0]
  // for (let i = 0; i < matches.length; i++) {
  return [...new Set(match.match(/\$(?!(\d|\.))[.\w]+/g) || [])]
  // }
  return results
  // return {
  //   first() {
  //     return this.vars[0]
  //   },
  //   find() {
  //     this.vars[0].vars.find(i => i.)
  //   },
  //   vars: results
  // }
  // let variables: string[] = []
  // if (matches && matches[0]) {
  //   variables = Array.from(matches[0].match(/\$(?!(\d|\.))[.\w]+/g) || [])
  // }
}

export function dropFirst(text: string) {
  let r = text.replace(/^\{\{|\}\}$/g, '').split('.')
  r.shift()
  return r.join('.')
}

export function find(query: string, data: object) {
  return query.split('.').reduce<any>((obj, val) => {
    return obj[val]
  }, data)
}

export function replaceHolders(text: string, data: object) {
  return text.replace(/\{\{.+\}\}/g, (i) => {
    return JSON.stringify(find(i.replace(/^\{\{|\}\}$/g, ''), data))
  })
}

export function makeFragment(element: string | Buffer | Element) {
  let fragment: DocumentFragment | null = null
  if (typeof element == 'string' || element instanceof Buffer) {
    fragment = JSDOM.fragment(element.toString())
  } else {
    fragment = JSDOM.fragment((<any>element).outerHTML)
  }
  return fragment
}

export function fragmentFromFile(file: string) {
  return new Promise<DocumentFragment>(resolve => {
    readFile(file, (err, data) => {
      resolve(makeFragment(data))
    })
  })
}

export function remove(element: Element) {
  element.remove()
}

export function isHTMLElement(windowScope: Window | JSDOM, clone: any): clone is HTMLElement {
  if (windowScope instanceof Window && clone instanceof HTMLElement) {
    return true
  } else if (windowScope instanceof JSDOM && clone instanceof windowScope.window.HTMLElement) {
    return true
  }
  return false
}

export async function step(root: Template, node: Document | Element | Node | DocumentFragment, data: TemplateData, mixins: Mixin[]): Promise<any> {
  // if (node.nodeType == root.dom.window.Node.TEXT_NODE && node.textContent) {
  //   node.textContent.match(/\{\{(.+)\}\}/) && console.log('step', JSON.stringify(data.scopes))
  //   // Replace text node placeholders
  //   node.textContent = node.textContent.replace(/\{\{(.+)\}\}/g, (full, v) => {
  //     let vars = getVariables(full)
  //     for (let v2 of vars) {
  //       let search = v2.split(/\./)
  //       if (search.length > 1 && search[0].startsWith('$')) {
  //         return getData(v, data, search[0].replace(/^\$/, ''))
  //       }
  //     }
  //     return getData(v, data)
  //   })
  // } else {
  for (let child of node.childNodes) {
    if (child.nodeType == root.dom.window.Node.TEXT_NODE && child.textContent) {
      // child.textContent.match(/\{\{(.+)\}\}/) && console.log('step', JSON.stringify(data.scopes))
      // Replace text node placeholders
      // child.textContent = child.textContent.replace(/\{\{(.+)\}\}/g, (full, v) => getData(v, data))
    } else if (child instanceof root.dom.window.Element) {
      let name = child.nodeName.toLowerCase()
      // Elements based on tag name
      switch (name) {
        case 'import':
          await importBlock(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'block':
          await block(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'include':
          await includeMixin(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'if':
          await ifBlock(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'case':
          await caseBlock(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'each':
          await eachBlock(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'for':
          await forBlock(root, child, data, mixins)
          return await step(root, node, data, mixins)
        case 'debug':
          await debugBlock(child, data)
          return await step(root, node, data, mixins)
        // Remove node since it's not part of a valid block group
        // Blocks cannot start with an "elif" or "else"
        case 'elif':
        case 'else':
          await remove(child)
          return await step(root, node, data, mixins)
      }
      if (child.childNodes.length > 0) {
        await step(root, child, data, mixins)
      }
    }
  }
  // }
}