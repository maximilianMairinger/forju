import keyIndex from "key-index"
import { latestLatent } from "more-proms"
import { oneOfTheseOnce } from "./onOfTheseEvents"
import getScrollParent from "./scrollParent"


const zIndex = 50
const initZIndexStore = keyIndex((el: Element) => el.css("zIndex") as number, WeakMap)
function mkBlurElem() {
  const blurElem = ce("blur-elem")
  blurElem.css({
    position: "absolute",
    display: "block",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex,
    opacity: 0,
    pointerEvents: "all",
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(3px)"
  })
  return blurElem
}




const activeBlurs = new Set()

const _blurEverythingInBackground = latestLatent(function blurEverythingInBackground<T>(except?: Element, end: Promise<T> = new Promise(() => {}), zIndex: number = 50, zIndexExcept: number = zIndex + 1) {
  return new Promise<{doneWithAnim: Promise<void>, except: Element | undefined, blurElem: Element, e: Event | T | void}>((res) => {
    if (except) {
      initZIndexStore(except)
      except.css("zIndex", zIndex + 1)
    }
    
    const parent = except ? getScrollParent(except) : document.body
    const blurElem = mkBlurElem()
    parent.apd(blurElem)
    blurElem.anim({opacity: 1})



    // a 2 here because on popup one resize event is triggered, always
    oneOfTheseOnce([
      end as Promise<unknown>, 
      blurElem.on("mousedown"), 
      parent.on("scroll", undefined, { velocity: true }), // Vel here is needed for popup to determine in which direction to fade on close
      document.body.on("resize"),
      new Promise<void>((res) => {
        const ls = document.body.on("keydown", ({key}) => {
          if (key === "Escape") {
            res()
            ls.deactivate()
          } 
        })
      })
    ], 2).then((e: Event | T | void) => {
      if (e instanceof Event) {
        e.stopPropagation()
        e.preventDefault()
      }
      
      const doneWithAnim = blurElem.anim({opacity: 0})
      res({doneWithAnim, except, blurElem, e})
    }) 
  })
})

_blurEverythingInBackground.then(async ({doneWithAnim, except, blurElem}) => {
  await doneWithAnim
  return {except, blurElem}
}).then(({except, blurElem}) => {
  if (except) except.css("zIndex", initZIndexStore(except))
  blurElem.remove()
})

export function blurEverythingInBackground<T>(except?: Element, end?: Promise<T>, zIndex?: number, zIndexExcept?: number): {canOpen: false} | {canOpen: true, done: Promise<Event | T>} {
  let myActiveBlursKey = except ? except : undefined
  if (activeBlurs.has(myActiveBlursKey)) return {canOpen: false}
  activeBlurs.add(myActiveBlursKey)
  return {canOpen: true, done: (async () => {
    const {doneWithAnim, e} = await _blurEverythingInBackground(except, end, zIndex, zIndexExcept)
    doneWithAnim.then(() => {
      activeBlurs.delete(myActiveBlursKey)
    })
    return e as any
  })()}
  
}

export default blurEverythingInBackground