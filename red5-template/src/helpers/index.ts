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

export * from './files'
export * from './extend'

export function getData(text: string, data: object) {
  return find(text.replace(/^\{\{|\}\}$/g, ''), data)
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

export async function step(root: Template, node: Document | Element | DocumentFragment, data: object, mixins: Mixin[]): Promise<any> {
  for (let child of node.children) {
    let name = child.nodeName.toLowerCase()
    // Elements based on tag name
    switch (name) {
      case 'import':
        await importBlock(root, child, data, mixins)
        return step(root, node, data, mixins)
      case 'block':
        await block(root, child, data, mixins)
        return step(root, node, data, mixins)
      // case 'mixin':
      //   await mixin(child, data, mixins)
      //   return step(root, node, data,mixins)
      // // TODO: Get includes working to include mixins
      case 'include':
        await includeMixin(root, child, data, mixins)
        return step(root, node, data, mixins)
      // // TODO: Add elif/else statements
      case 'if':
        await ifBlock(root, child, data, mixins)
        return step(root, node, data, mixins)
      case 'debug':
        await debugBlock(child, data)
        return step(root, node, data, mixins)
    }
    // Elements based on attribute
    for (let attr of child.attributes) {
      let attrName = attr.name
      switch (attrName) {
        case 'each':
          await eachBlock(root, child, data, mixins)
          return step(root, node, data, mixins)
        case 'for':
          await forBlock(root, child, data, mixins)
          return step(root, node, data, mixins)
      }
    }
    if (child.children.length > 0) {
      await step(root, child, data, mixins)
    }
  }
}