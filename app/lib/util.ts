import Easing from "waapi-easing"

export function clamp(bot: number, top: number) {
  return function(val: number) {
    if (val < bot) return bot
    else if (val > top) return top
    else return val
  }
}
export const probRange = clamp(0, 1)


export const dirToLenIndex = {
  x: "width",
  y: "height"
} as const

export const dirToSideIndex = {
  x: "left",
  y: "top"
} as const


export function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

export function scaleAroundCenter(by: number) {
  const half = (1 - by) / 2
  return function scale(frac: number) {
    return half + frac * by
  }
}

export function signedEasing(easing: Easing | ((x: number) => number)) {
  const easeF = typeof easing === "function" ? easing : easing.function
  return function(x: number) {
    const sign = Math.sign(x)
    return sign * easeF(Math.abs(x))
  }
}

export function findFirstParentThatMatches(elem: HTMLElement, query: string) {
  for (const elems of parents(elem)) {
    if (elems.matches(query)) return elems
  }
}


// also supports shadow root
export function* parents(elem: Element) {
  while (elem) {
      const parent = elem.parentElement || (elem.getRootNode() as ShadowRoot).host;
      if (parent) {
          yield parent;
          elem = parent;
      } else {
          break;
      }
  }
}


export function range(end: number, start: number = 0, step = 1) {
  const arr = []
  for (let i = start; i < end; i += step) {
    arr.push(i)
  }
  return arr
}

export function isPromiseLike<T = any>(value: any): value is PromiseLike<T> {
  return value != null && typeof value.then === "function"
}