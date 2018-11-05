import { Template } from './extend';
import { step } from '.';
import { Mixin } from './mixin';

export function block(root: Template, element: Element, data: object, mixins: Mixin[]) {
  let name = element.getAttribute('name')
  if (!element.ownerDocument) return
  let frag = element.ownerDocument.createDocumentFragment()
  if (root.child && element.parentElement && name) {
    let childBlock = root.child.document.querySelector(`block[name=${name}]`)
    if (childBlock && element) {
      for (let child of childBlock.children) {
        frag.appendChild(child.cloneNode(true))
      }
    }
  }
  step(root, frag, data, mixins)
  element.replaceWith(frag)
}