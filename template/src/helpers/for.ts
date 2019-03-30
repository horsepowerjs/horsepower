import { step } from '.'
import { Template } from './extend'
import { Mixin } from './mixin';
import { TemplateData } from '..';

// <for :="i from 10 through 15">{{$i}}</for> <!-- 10,11,12,13,14,15 -->
// <for :="i from 10 thru 15">{{$i}}</for>    <!-- 10,11,12,13,14,15 -->
// <for :="i from 10 to 15">{{$i}}</for>      <!-- 10,11,12,13,14 -->

export async function forBlock(root: Template, element: Element, data: TemplateData, mixins: Mixin[]) {
  let query = element.getAttribute(':')
  if (query && element.ownerDocument) {
    let matches = query.replace(/\s\s+/g, ' ').split(/(\w+) from (-?\d+) (through|thru|to) (-?\d+)/i).filter(String)
    if (matches.length != 4) {
      element.remove()
      return
    }
    function makeNode(element: Element, frag: DocumentFragment, key: string, i: number, data: TemplateData) {
      for (let child of element.childNodes) {
        let clone = child.cloneNode(true)
        if (clone instanceof root.dom.window.HTMLElement) {
          clone.innerHTML = clone.innerHTML.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i.toString())
        } else if (clone.textContent) {
          clone.textContent = clone.textContent.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i.toString())
        }
        step(root, clone, data, mixins)
        frag.appendChild(clone)
      }
    }
    let key = matches[0].trim()
    let start = parseInt(matches[1])
    let type = matches[2].trim().toLowerCase()
    let end = parseInt(matches[3])
    let frag = element.ownerDocument.createDocumentFragment()
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