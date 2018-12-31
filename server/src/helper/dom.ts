export function method(method: string) {
  return `<input type="hidden" name="_method" value="${method.toUpperCase()}">`
}