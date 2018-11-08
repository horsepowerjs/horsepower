import * as path from 'path'
import { Template } from './extend';
import { fragmentFromFile, step } from '.';
import { Mixin } from './mixin';
import { TemplateData } from '..';

export async function importBlock(root: Template, element: Element, data: TemplateData, mixins: Mixin[]) {
  let inclFileName = element.getAttribute('file')
  if (inclFileName && element.ownerDocument && inclFileName.length > 0) {
    let dir = path.dirname(root.file)
    let file = path.resolve(dir, inclFileName + (!inclFileName.endsWith('.rtpl') ? '.rtpl' : ''))
    let frag = await fragmentFromFile(file)
    step(root, frag, data, mixins)
    frag && element.replaceWith(frag)
  }
}