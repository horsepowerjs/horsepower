import { step } from '.'
import { Template } from './extend'
import { Mixin } from './mixin';

export async function forBlock(root: Template, element: Element, data: object, mixins: Mixin[]) {
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
    function makeNode(element: Element, frag: DocumentFragment, key: string, i: number, data: object) {
      let clone = element.cloneNode(true) as HTMLElement
      clone.innerHTML = clone.innerHTML.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i.toString())
      step(root, clone, data, mixins)
      frag.appendChild(clone)
    }
    switch (type) {
      case 'through':
      case 'thru':
        if (start < end) {
          for (let i = start; i <= end; i++) { makeNode(element, frag, key, i, data) }
        } else {
          for (let i = start; i >= end; i--) { makeNode(element, frag, key, i, data) }
        }
        break;
      case 'to':
        if (start < end) {
          for (let i = start; i < end; i++) { makeNode(element, frag, key, i, data) }
        } else {
          for (let i = start; i > end; i--) { makeNode(element, frag, key, i, data) }
        }
        break;
    }
    element.replaceWith(frag)
  }
}