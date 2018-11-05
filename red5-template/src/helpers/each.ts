import { getData, step } from '.'
import { Template } from './extend'
import { Mixin } from './mixin';

export async function eachBlock(root: Template, element: Element, data: object, mixins: Mixin[]) {
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

    let dataObject = getData(placeholderData, data)
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
          step(root, clone, dataObject, mixins)
        }
      }
      element.replaceWith(frag)
    } else {
    }
  }
}