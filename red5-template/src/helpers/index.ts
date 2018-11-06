import { readFile } from 'fs'
import { Template } from './extend'
import { block } from './block'
import { ifBlock } from './if'
import { JSDOM } from 'jsdom'
import { importBlock } from './import';
import { debugBlock } from './debug';
import { eachBlock } from './each';
import { forBlock } from './for';
import { includeMixin, Mixin } from './mixin';
import { caseBlock } from './case';

export * from './files'
export * from './extend'

export function getData(text: string, data: object) {
  return find(text.replace(/^\{\{|\}\}$/g, ''), data)
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

export async function step(root: Template, node: Document | Element | Node | DocumentFragment, data: object, mixins: Mixin[]): Promise<any> {
  if (
    node instanceof root.dom.window.Element ||
    node instanceof root.dom.window.Document ||
    node instanceof root.dom.window.DocumentFragment
  ) {
    for (let child of node.childNodes) {
      if (child.nodeType == root.dom.window.Node.TEXT_NODE && child.textContent) {
        // Replace text node placeholders
        child.textContent = child.textContent.replace(/\{\{(.+)\}\}/g, (full, v) => getData(v, data))
      } else if (child instanceof root.dom.window.Element) {
        let name = child.nodeName.toLowerCase()
        // Elements based on tag name
        switch (name) {
          case 'import':
            await importBlock(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'block':
            await block(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'include':
            await includeMixin(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'if':
            await ifBlock(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'case':
            await caseBlock(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'each':
            await eachBlock(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'for':
            await forBlock(root, child, data, mixins)
            return step(root, node, data, mixins)
          case 'debug':
            await debugBlock(child, data)
            return step(root, node, data, mixins)
          // Remove node since it's not part of a valid block group
          // Blocks cannot start with an "elif" or "else"
          case 'elif':
          case 'else':
            await remove(child)
            return step(root, node, data, mixins)
        }
      }
      if (child.childNodes.length > 0) {
        await step(root, child, data, mixins)
      }
    }
  }
}