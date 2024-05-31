import { Data, DataCollection } from "josm"
import { isIdle } from "tiny-delay"
import { capitalize, dirToLenIndex, dirToSideIndex, probRange } from "./util"

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

export function isScrollIdle(elem: Element, dir?: "x" | "y" | "one", timeout?: number) {
  const { idle, f } = isIdle(timeout)
  elem.scrollData(false, dir).get(f)
  return idle
}

export function dataNextTrue(data: Data<boolean>) {
  return () => {
    return new Promise<void>((res) => {
      const s = data.get((d) => {
        if (d) {
          res()
          s.deactivate()
        }
      })
    })
  }
}

export function nextScrollIdle(elem: Element, dir?: "x" | "y" | "one", timeout?: number) {
  return dataNextTrue(isScrollIdle(elem, dir, timeout))
}


export function relativeViewProgressData(dir: "x" | "y", scrollBody: HTMLElement, child: HTMLElement) {
  const wid = dirToLenIndex[dir]
  const side = dirToSideIndex[dir]
  const thisCurHeight = scrollBody.resizeDataBase()[wid] as Data<number>
  const childSize = child.resizeDataBase()

  const prog = new Data(0)
  new DataCollection(scrollBody.scrollData(false, dir), thisCurHeight, childSize[side], childSize[wid]).get((scrollProg, viewPortHeight, childTop, childHeight) => {
    childTop = child[`offset${capitalize(side)}`] // quickfix
    prog.set(percentageInViewPort({ begin: childTop, size: childHeight }, { begin: scrollProg, size: viewPortHeight }))
  })
  return prog
}


// Output: 0 when above view and when the bottom of element hits the top of the view, 1 when the top of the element hits the bottom of the view or when it is below
export function percentageInViewPort(elem: {begin: number, size: number}, viewPort: {begin: number, size: number}) {
  return probRange((viewPort.begin + viewPort.size - elem.begin) / (viewPort.size + elem.size))
}