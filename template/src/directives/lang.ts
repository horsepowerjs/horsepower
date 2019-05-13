import { Template } from '../helpers/extend'
import { Client } from '@red5/server'
import { Storage } from '@red5/storage';

export type Lang = { [key: string]: string }

export default async function (client: Client, root: Template, element: Element) {
  if (element.ownerDocument && client.session) {
    let store = Storage.mount('resources')
    if (await store.exists(`lang/${client.session.lang}.json`)) {
      let data = JSON.parse((await store.load(`lang/${client.session.lang}.json`) || '{}').toString()) as Lang
      return element.replaceWith(createElement(element, data) as Element)
    }
  }
  element.replaceWith(createElement(element) as Element)
}

function createElement(element: Element, data?: Lang) {
  if (!element.ownerDocument) return
  let key = element.getAttribute('key')
  let tag = element.getAttribute('tag') || 'span'
  element.removeAttribute('tag')
  element.removeAttribute('key')
  let el = element.ownerDocument.createElement(tag)
  for (let i of element.attributes) {
    el.setAttribute(i.name, i.value)
  }
  let val = key && data && data[key] ? data[key] : element.innerHTML
  el.innerHTML = val
  return el
}