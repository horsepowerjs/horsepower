import { replaceHolders } from '.';
import { TemplateData } from '..';

export function debugBlock(element: Element, data: TemplateData) {
  // get the data to write to the console
  let log = element.getAttribute('log')
  let error = element.getAttribute('error')
  let warn = element.getAttribute('warn')
  let info = element.getAttribute('info')
  // Remove the element so it doesn't display in the output
  element.remove()
  // If this is production do not debug
  if ((process.env.APP_ENV || 'production').toLowerCase() == 'production') return
  // log everything
  if (log) console.log(replaceHolders(log, data))
  if (error) console.error(replaceHolders(error, data))
  if (warn) console.warn(replaceHolders(warn, data))
  if (info) console.info(replaceHolders(info, data))
}