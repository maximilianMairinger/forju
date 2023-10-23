import LinkedList from "fast-linked-list";
import declareComponent from "../../../lib/declareComponent"
import ThemeAble from "../themeAble"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import keyIndex from "key-index"
import { latestLatent } from "more-proms"
import { EventListener } from "extended-dom";



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

function oneOfTheseOnce(...eventListener: EventListener[]) {
  const rmListener = () => {
    for (const ev of eventListener) ev.deactivate()
  }
  return (func: (e: Event) => boolean | void, nCount = 1) => {
    let i = 0
    for (const ev of eventListener) {
      const prevListener = ev.listener()
      ev.listener((...a) => {
        i++
        if (i < nCount) return

        for (const list of prevListener) (list as any)(...a)
        let res = func(...a)
        res = res === undefined ? true : res
        if (res) rmListener()
      })
      ev.activate()
    }

  }
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

function blurEverythingInBackground(except?: Element, zIndex?: number, zIndexExcept?: number) {
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





function getScrollParent(node: Node, dirs: ("x" | "y")[] = ["y"]) {
  if (node == null) return document.body
  if (node instanceof ShadowRoot) return getScrollParent(node.host, dirs)
  if (!(node instanceof Element)) return getScrollParent(node.parentNode, dirs)
  

  for (const dir of dirs) {
    let overflowY = node.css(`overflow${dir.toUpperCase()}` as `overflow${"X" | "Y"}`)
    let isScrollable = overflowY !== 'visible' && overflowY !== 'hidden'
    if (isScrollable && node.scrollHeight > node.clientHeight) {
      return node
    }
  }

  return getScrollParent(node.parentNode, dirs)
}





export default class ContactCard extends ThemeAble {
  protected body: BodyTypes

  constructor() {
    super(false)

    this.body.btn.userFeedbackMode({
      hover: false,
      ripple: false
    })

    this.body.btn.click(() => {
      const { done, canOpen } = blurEverythingInBackground(this)
      if (!canOpen) return
      
      console.log(this.body.btn.offsetLeft)

      const width = 500
      const height = 500

      this.css({
        height: this.css("height"),
        width: this.css("width"),
      })

      this.body.btn.anim({
        width,
        height,
        marginLeft: document.body.clientWidth/2 - width/2 - this.body.btn.getBoundingClientRect().left,
        marginTop: document.body.clientHeight/2 - height/2 - this.body.btn.getBoundingClientRect().top,
      })

      done.then(() => {
        this.body.btn.anim({
          width: "100%",
          height: "auto",
          marginLeft: 0,
          marginTop: 0,
        })
      })
    })

    this.body.subSubTxt.addActivationListener((e) => {
      e.preventDefault()
      e.stopPropagation()
    })



    

  }

  personName(to: string) {
    this.body.heading.text(to)
  }

  position(to: string) {
    this.body.subTxt.text(to)
  }

  pic(src: string) {
    this.body.pic.src(src)
  }

  email(to: string) {
    this.body.subSubTxt.content(to)
  }

  stl() {
    return super.stl() + require("./contactCard.css").toString()
  }
  pug() {
    return require("./contactCard.pug").default
  }
}

declareComponent("c-contact-card", ContactCard)
