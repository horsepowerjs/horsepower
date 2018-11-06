import { getData, step, dropFirst } from '.'
import { Template } from './extend'
import { Mixin } from './mixin';

export async function eachBlock(root: Template, element: Element, data: object, mixins: Mixin[]) {
  let query = element.getAttribute(':')
  let nodes: Element[] = []

  // Get all the nodes in the current if block
  function getNext(element: Element) {
    if (!element.nextElementSibling) return
    let ref = element.nextElementSibling
    if (ref.nodeName.toLowerCase() == 'else') {
      nodes.push(ref)
    }
  }

  // Find all nodes within the if/elif/else block
  getNext(element)
  if (query && element.ownerDocument) {
    let key = '', value = ''
    let [placeholderKeys, placeholderData] = query.split(' in ')
    if (!placeholderKeys || !placeholderData) {
      element.remove()
      return
    }
    placeholderKeys = placeholderKeys.trim()
    if (placeholderKeys.startsWith('[') && placeholderKeys.endsWith(']')) {
      [key, value] = placeholderKeys.replace(/^\[|\]$/g, '').split(',').map(i => i.trim())
    } else {
      value = placeholderKeys
    }

    let dataObject = getData(placeholderData, data)
    let frag = element.ownerDocument.createDocumentFragment()
    if (dataObject && typeof dataObject[Symbol.iterator] == 'function' && nodes.length > 0 && dataObject.length == 0) {
      for (let node of nodes) {
        if (node.nodeName.toLowerCase() == 'else') {
          for (let child of node.childNodes) {
            frag.appendChild(child.cloneNode(true))
          }
        }
      }
      element.replaceWith(frag)
    } else if (dataObject && typeof dataObject[Symbol.iterator] == 'function') {
      if (dataObject.length == 0) {
        for (let child of element.children) {
          if (child.nodeName.toLowerCase() == 'empty') {
            for (let c of child.childNodes) {
              frag.appendChild(c.cloneNode(true))
            }
          }
        }
      } else {
        for (let k in dataObject) {
          let v = dataObject[k]
          for (let child of element.childNodes) {
            let clone = child.cloneNode(true)
            frag.appendChild(clone)
            if (clone instanceof root.dom.window.HTMLElement) {

              let matches = clone.innerHTML.match(`\{\{.+?\}\}`)
              if (matches) {
                let match = matches[0]
                if (typeof v == 'object') {
                  v = getData(dropFirst(match), v)
                }
                clone.innerHTML = clone.innerHTML
                  .replace(new RegExp(match, 'g'), v)
                  .replace(new RegExp(`\{\{${key}\}\}`, 'g'), k)
                step(root, clone, dataObject, mixins)
              } else if (clone.textContent) {
                clone.textContent = clone.textContent
                  .replace(new RegExp(`\{\{${value}\}\}`, 'g'), v)
                  .replace(new RegExp(`\{\{${key}\}\}`, 'g'), k)
              }
            }
          }
        }
      }
    }
    element.replaceWith(frag)
  }
  for (let node of nodes) {
    node.remove()
  }
}