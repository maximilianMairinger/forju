export function toggleClass(elem: Element, className: string) {
  return function (flag: boolean) {
    if (flag) elem.addClass(className)
    else elem.removeClass(className)
  }
}

export function toggleAttrb(elem: Element, attrb: string) {
  return function (flag: boolean) {
    if (flag) elem.setAttribute(attrb, attrb)
    else elem.removeAttribute(attrb)
  }
}