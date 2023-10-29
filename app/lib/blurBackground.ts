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
    background: "rgba(0, 0, 0, 0.5)"
  })
  return blurElem
}




const activeBlurs = new Set()

const _blurEverythingInBackground = latestLatent(function blurEverythingInBackground(except?: Element, zIndex: number = 50, zIndexExcept: number = zIndex + 1) {
  return new Promise<{doneWithAnim: Promise<void>, except: Element | undefined, blurElem: Element}>((res) => {
    if (except) {
      initZIndexStore(except)
      except.css("zIndex", zIndex + 1)
    }
    
    const parent = except ? getScrollParent(except) : document.body
    const blurElem = mkBlurElem()
    parent.apd(blurElem)
    blurElem.anim({opacity: 1})




    oneOfTheseOnce(blurElem.on("mousedown"), parent.on("scroll"), document.body.on("resize"))((e) => {
      console.log(e)
      if (e instanceof Event) {
        e.stopPropagation()
        e.preventDefault()
      }
      
      const doneWithAnim = blurElem.anim({opacity: 0})
      res({doneWithAnim, except, blurElem})
    }, 2)
  })
})

_blurEverythingInBackground.then(async ({doneWithAnim, except, blurElem}) => {
  await doneWithAnim
  return {except, blurElem}
}).then(({except, blurElem}) => {
  if (except) except.css("zIndex", initZIndexStore(except))
  blurElem.remove()
})

export function blurEverythingInBackground(except?: Element, zIndex?: number, zIndexExcept?: number) {
  let myActiveBlursKey = except ? except : undefined
  if (activeBlurs.has(myActiveBlursKey)) return {canOpen: false}
  activeBlurs.add(myActiveBlursKey)
  return {canOpen: true, done: (async () => {
    const {doneWithAnim} = await _blurEverythingInBackground(except, zIndex, zIndexExcept)
    doneWithAnim.then(() => {
      activeBlurs.delete(myActiveBlursKey)
    })
  })()}
  
}

export default blurEverythingInBackground