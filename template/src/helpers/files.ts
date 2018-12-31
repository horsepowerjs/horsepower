import { Template } from "./extend";
import { readFile } from 'fs'
import { JSDOM } from 'jsdom'

export function parseFile(file: string) {
  return new Promise<Template>(resolve => {
    readFile(file, (err, data) => {
      let tpl = new JSDOM(data)
      resolve({
        file, dom: tpl,
        document: tpl.window.document,
        body: tpl.window.document.body as HTMLBodyElement
      })
    })
  })
}