import { Template } from './extend';
import { step, replaceHolders, getVariables } from '.';
import { Mixin } from './mixin';
import { TemplateData, getScopeData } from '..';

// <if :="i == 0">...</if>
// <elif :="i == 1">...</elif>
// <else>...</else>

export function ifBlock(root: Template, element: Element, data: TemplateData, mixins: Mixin[]) {
  if (!element.ownerDocument) return
  let nodes: Element[] = [element]

  // Get all the nodes in the current if block
  function getNext(element: Element) {
    if (!element.nextElementSibling) return
    let ref = element.nextElementSibling
    if (ref.nodeName.toLowerCase() == 'elif') {
      nodes.push(ref)
      getNext(ref)
    } else if (ref.nodeName.toLowerCase() == 'else') {
      nodes.push(ref)
    }
  }

  // Find all nodes within the if/elif/else block
  getNext(element)

  let frag = element.ownerDocument.createDocumentFragment()
  // Loop over all the if/elif/else nodes
  for (let node of nodes) {
    // If the node is an else node append the data to the fragment
    if (node.nodeName.toLowerCase() == 'else') {
      for (let child of node.childNodes) {
        frag.appendChild(child.cloneNode(true))
      }
    }
    // the node is an if/elif node, test its conditions
    else {
      let condition = node.getAttribute(':') || 'false'
      const esc = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      let test = getVariables(condition).join('|')

      let evaluate = condition.replace(new RegExp(esc(test), 'g'), (f) => {
        console.log(f)
        return 'a'
      })
      console.log(evaluate)
      // console.log(condition, getScopeData([0], data))
      // let result = !!eval(replaceHolders(condition, data))
      let result = !!eval(evaluate)
      // The test failed go to the next node
      if (!result) continue
      // The test succeeded add the children to the fragment
      for (let child of node.childNodes) {
        frag.appendChild(child.cloneNode(true))
      }
    }
    step(root, frag, data, mixins)
    element.replaceWith(frag)
    break
  }
  // Remove all the if/elif/else nodes that failed
  for (let node of nodes) {
    node.remove()
  }
}