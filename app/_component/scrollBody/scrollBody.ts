import { memoize } from "key-index"
import { Data, DataBase, DataCollection, ReadonlyData } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { ElementList } from "extended-dom";
import RippleButton from "./../_themeAble/_focusAble/_formUi/_rippleButton/rippleButton"
import WAAPIEasing from "waapi-easing"
import delay, { isIdle } from "tiny-delay"
import { nextFrame } from "animation-frame-delta";

const easing = new WAAPIEasing("easeInOut").function
const wrapperElemName = "scroll-body-element-wrapper"

const inAnimMarkerMargin = .8
const minScrollJumpToNext = 200


export default class ScrollBody extends Component<false> {
  protected body: BodyTypes
  
  public scrollEnabled = {
    x: new Data(false),
    y: new Data(false)
  }

  public isScrollAble: {
    x: ReadonlyData<boolean>,
    y: ReadonlyData<boolean>
  }

  public fadeInOnScrollData = new Data(false)


  constructor() {
    super(false)


    this.body.scrollBody.scrollData(false, "x").scrollTrigger(0).on("forward", () => {
      console.log("forwards")
    })
  }

  wrapChilds(...nodes: Element[]) {
    this.mut.disconnect()
    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        const wrapper = ce(wrapperElemName);
        this.insertBefore(wrapper, node);
        wrapper.appendChild(node);
      }
    });
    this.mutObserve()
  }


  private mut: MutationObserver
  private mutObserve() {
    this.mut.observe(this, {
      childList: true, 
      subtree: false,
      attributes: false,
      characterData: false
    })
  }

  private _animationDurationPx = 300
  public animationDurationPx(to: number) {
    this._animationDurationPx = +to
  }

  private _propagateFullViewProgressAttr: string
  propagateFullViewProgressAttr(attr: string) {
    this._propagateFullViewProgressAttr = attr
  }

  async childAddedCallback(child: Element) {

    const probRange = inRange(0, 1)
    
    await nextFrame()
    await delay(0)

    const dirs = [] as ("x" | "y")[]
    if (this.scrollEnabled.x.get()) dirs.push("x")
    if (this.scrollEnabled.y.get()) dirs.push("y")


    const mkPropagateFullViewProgressData = (progFix: string) => {
      const attr = this._propagateFullViewProgressAttr + progFix
      const propagateFullViewProgressData = this._propagateFullViewProgressAttr !== undefined && child[attr] !== undefined ? new Data(0) : undefined
      if (propagateFullViewProgressData !== undefined) {
        propagateFullViewProgressData.get((prog) => {
          child[attr](prog)
        }, false)
      }
      return propagateFullViewProgressData
    }

    const propagateFullViewProgressDatas = {} as {x: Data<number>, y: Data<number>}

    if (dirs.length === 1) {
      propagateFullViewProgressDatas[dirs[0]] = mkPropagateFullViewProgressData("")
    }
    else {
      for (const dir of dirs) {
        propagateFullViewProgressDatas[dir] = mkPropagateFullViewProgressData(dir.toUpperCase())
      }
    }
    

    
    for (const dir of dirs) {
      
      const propagateFullViewProgressData = propagateFullViewProgressDatas[dir]
      if (propagateFullViewProgressData !== undefined) {
        const wid = dir === "x" ? "Width" : "Height"

        this.body.scrollBody.scrollData(false, dir).get((scrollProg) => {

          const leftOfElem = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"]
          const widthOfElem = (child as HTMLElement)[dir === "x" ? "offsetWidth" : "offsetHeight"]
          const rightOfElem = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"] + widthOfElem
          const widthOfContainer = this[`offset${wid}`]

          const widthWhereElemIsVis = widthOfContainer + widthOfElem 
          const scrollProgRight = scrollProg + widthOfContainer
          
          propagateFullViewProgressData.set(probRange((scrollProgRight - leftOfElem) / widthWhereElemIsVis))
        })
      }
    }
    


    // that we use a datacollection here is a dirty fix. If we dont then somehow the this.body.scrollBody.scrollData(false, dir) subscription in anim will not work
    new DataCollection(this.fadeInOnScrollData).get((fadeInOnScroll) => {
      
      if (fadeInOnScroll) {
        const inAnimDatas = dirs.map((dir) => {
          
          
          
  
          
          const animationDurationPx = this._animationDurationPx
          
          
          const wid = dir === "x" ? "Width" : "Height"

          const inAnimData = new Data(false)

          

          const f = (scrollPosLeft: number) => {
            const leftOfElem = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"]
            const rightOfElem = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"] + (child as HTMLElement)[dir === "x" ? "offsetWidth" : "offsetHeight"]


            const width = this[`offset${wid}`]

            const scrollPosRight = scrollPosLeft + width
            const isOnScreen = scrollPosLeft + animationDurationPx <= rightOfElem && scrollPosRight - animationDurationPx >= leftOfElem
            if (isOnScreen) {
              inAnimData.set(false)
              return 1
            }

            const isInBeforeAnim = scrollPosRight > leftOfElem && scrollPosRight < leftOfElem + animationDurationPx
            if (isInBeforeAnim) {
              const r = (scrollPosRight - leftOfElem) / animationDurationPx
              inAnimData.set(r <= inAnimMarkerMargin)
              return r
            }


            
            const isInAfterAnim = scrollPosLeft > rightOfElem - animationDurationPx && scrollPosLeft < rightOfElem
            if (isInAfterAnim) {
              const r = (rightOfElem - scrollPosLeft) / animationDurationPx
              inAnimData.set(r <= inAnimMarkerMargin)
              return r 
            }

            
            
            return 0
          }



          
          const animProg = this.body.scrollBody.scrollData(false, dir).tunnel(f)
          child.anim([
            {offset: 0, opacity: .1, scale: .9}, 
            {offset: 1, opacity: 1, scale: .999}
          ], {start: 0, end: 1, smooth: false}, animProg)

          
          this.updateFadeInOnScrollChildAnimLs.push(() => {
            animProg.set(f(this[`scroll${dir === "x" ? "Left" : "Top"}`]))
          })

          return inAnimData
        })

        const inAnimDataAggregate = new Data() 
        new DataCollection(...inAnimDatas).get((...inAnimDatas) => {
          inAnimDataAggregate.set(inAnimDatas.some((x) => x))
        })

        inAnimDataAggregate.get((inAnim) => {
          child[inAnim ? "addClass" : "removeClass"]("scrollBodyInFadeAnim")
          child.css("pointerEvents", inAnim ? "none" : "")
        })
        
        
      }
    }, true)
  }

  private updateFadeInOnScrollChildAnimLs = [] as Function[]
  async updateFadeInOnScrollChildAnim() {
    await nextFrame()
    await delay(0)
    for (const f of this.updateFadeInOnScrollChildAnimLs) {
      f()
    }
  }

  connectedCallback() {
    this.mut = new MutationObserver((e) => {
      const added = []
      e.forEach((e) => {
        added.push(...e.addedNodes)
      })
      this.wrapChilds(...added)
      added.forEach((child) => {
        this.childAddedCallback(child as Element)
      })
    })

    this.resizeDataBase()(() => {
      this.updateFadeInOnScrollChildAnim()
    })

    const children = [...this.children]
    this.wrapChilds(...children)
    for (const child of children) this.childAddedCallback(child)

    this.mutObserve()




    const scrollAbleLength = this.body.overflow.resizeDataBase()
    const containerLen = this.resizeDataBase()


    


    for (const dir of ["x", "y"] as const) {
      const lenVerb = dirToLenIndex[dir]
      containerLen[lenVerb].get((len) => {
        this.css(`--gen-1-percent-of-${lenVerb}` as any, `${len * .01}px`)
      })
    }

    
    const atEnd = new DataBase({
      top: false,
      bot: false,
      left: false,
      right: false
    })



    
    atEnd((_, diff) => {
      for (const dir in diff) {
        this[diff[dir] ? "addClass" : "removeClass"](`at${capitalize(dir)}End`)
      }
    })


    for (const dir of ["x", "y"] as const) {
      this.scrollEnabled[dir].get((x) => {
        if (x) this.setAttribute(dir, "")
        else this.removeAttribute(dir)
      })
    }



    (async () => {
      // needs to wait until the padding is computed. May take longer than one event loop cycle when it is not the first section to be drawn
      let i = 0
      while(typeof this.css("paddingLeft") === "string" && i < 100) {
        await delay(0)
        i++
      }

      const paddingDB = new DataBase({
        top: 0,
        bot: 0,
        left: 0,
        right: 0
      })
      
      this.resizeDataBase()(() => {
        const e = {}
        for (const iterator of ["top", "bot", "left", "right"] as const) {
          e[iterator] = this.css(`padding${capitalize(iterator)}` as "paddingLeft") as number
        }
        paddingDB(e)
      })
  
  
  
  
  
      for (const { dir, len } of [{dir: "y", len: "height"}, {dir: "x", len: "width"}] as const) {
        for (const { end } of [{end: false}, {end: true}] as const) {
          const side = dir === "y" ? !end ? "top" : "bot" : !end ? "left" : "right" as const
          const otherSide = dir === "y" ? end ? "top" : "bot" : end ? "left" : "right" as const
  
  
          const scrollTrigger = memoize(() => {
            
            const paddingStart = paddingDB[side]
            const paddingEnd = paddingDB[otherSide]
            const marginStart = paddingStart
            const marginEnd = new Data(0)
            new DataCollection(scrollAbleLength[len], paddingEnd).get((scrollAbleLength, paddingEnd) => {
              marginEnd.set(scrollAbleLength + paddingEnd)
            })
            
            return this.body.scrollBody.scrollData(end, dir).scrollTrigger(!end ? marginStart.tunnel((q) => q+1) : marginEnd.tunnel((q) => q-1))
          })
          
           
          
  
          for (let {wards, bool} of [{wards: "forward", bool: false}, {wards: "backward", bool: true}] as const) {
            bool = end ? !bool : bool
            const func = () => {
              atEnd[side].set(bool)
            }
            
            this.scrollEnabled[dir].get(async (enabled) => {
              // This timeout is a quickfix. Currently subscribing to another data inside a data.get callback will cause the callback cause the inner callback to not actually subscribe, but instead only work once. We have such a situation here, as the scrollTrigger memoisation calls the tunnel function which subscribes.
              await delay(0)
              if (enabled) scrollTrigger().on(wards, func)
              else scrollTrigger().off(wards, func)
              
            }, this.scrollEnabled[dir].get())
          }
        }
      }
    })();


    this.isScrollAble = {} as any
    for (const dir of ["x", "y"] as const) {
      const scrollAble = this.isScrollAble[dir] = new Data(false)
      new DataCollection(this.scrollEnabled[dir], scrollAbleLength[dirToLenIndex[dir]], containerLen[dirToLenIndex[dir]]).get((enabled, scrollLength, containerLen) => {
        if (enabled) scrollAble.set(scrollLength > containerLen)
        else scrollAble.set(false)
      })

      scrollAble.get((scrollAble) => {
        this[scrollAble ? "addClass" : "removeClass"](`scrollAble${dir.toUpperCase()}`)
      })
    }


    for (const hint of this.q(".hint", true) as ElementList<RippleButton>) {
      const side = hint.getAttribute("side") as "top" | "bot" | "left" | "right"
      const sign = side === "top" || side === "left" ? -1 : 1
      const dir = hint.getAttribute("dir") as "x" | "y"


      hint.click(() => {
        this.scrollForwards(sign, dir)
      })
    }




  }

  private scrollForwards(directionSign: 1 | -1 = 1, dir?: "x" | "y", diff_toNext?: number | true) {
    const currentScrollPos = this.body.scrollBody.scrollData(false, dir)
    const hasScrollSnap = this.hasAttribute("scrollSnap")
    
    let toNext = diff_toNext === true ? true : hasScrollSnap
    let diff = diff_toNext === true ? 300 * directionSign : diff_toNext
    if (typeof diff_toNext === "number") {
      toNext = false
      diff = diff_toNext
    }
    else {
      toNext = diff_toNext === true ? true : hasScrollSnap
      diff = 300 * directionSign
    }
    
    
    if (toNext) {
      
      const myWidth = this.css("width" as any)
      let scrollSnapPos = this.childs(1, true).map((child) => {
        let v: number
        const align = child.css("scrollSnapAlign" as any)
        if (align === "start") v = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"]
        else if (align === "center") v = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"] + (child as HTMLElement)[dir === "x" ? "offsetWidth" : "offsetHeight"] / 2
        else if (align === "end") v = (child as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"] + (child as HTMLElement)[dir === "x" ? "offsetWidth" : "offsetHeight"]
        else throw new Error("Unknown scrollSnapAlign: " + align)
        return {v, containerWidth: myWidth * (align === "center" ? .5 : align === "end" ? 1 : 0)}
      })


      const currentScrollPosVal = currentScrollPos.get()

      do {
        let ind: number
        const nextSnapPos = directionSign === 1 ? scrollSnapPos.find((({v, containerWidth}, i) => {
          ind = i
          return v > (currentScrollPosVal + containerWidth + 1)
        })) : (() => {
          for (let i = scrollSnapPos.length-1; i >= 0; i--) {
            ind = i
            const {v, containerWidth} = scrollSnapPos[i]
            if (v < (currentScrollPosVal + containerWidth - 1)) return scrollSnapPos[i]
          }
        })()
        if (nextSnapPos !== undefined) diff = nextSnapPos.v - (currentScrollPosVal + nextSnapPos.containerWidth)
        else break

        if (scrollSnapPos.length > ind + 1) {
          console.log("skipping")
          scrollSnapPos = scrollSnapPos.slice(ind+1)
        }
        else break
      } while (Math.abs(diff) < minScrollJumpToNext)
    }

    if (diff === undefined) return


    const scrollProm = this.scrollToCoord(currentScrollPos.get() + diff, dir)



    if (hasScrollSnap && toNext) {
      scrollProm.onCancel.then((reason: any) => {
        if (reason !== undefined && reason.reason === "Edom.cancelOnUserInput") return
        let curDir = 1 as 1 | -1
        const sub = this.on(`scroll`, ({velocity}) => {
          if (velocity[dir] !== 0) curDir = velocity[dir] > 0 ? 1 : -1
        }, {velocity: true, direction: dir})
        nextScrollIdle(this.body.scrollBody, dir, 1000)().then(() => {
          sub.deactivate()
          this.scrollForwards(curDir, dir)
        })
      })
    }
  }

  private scrollToCoord(coord: number, dir?: "x" | "y") {
    dir = this.getScrollDefault(dir)
    const hasScrollSnap = this.hasAttribute("scrollSnap")
    if (hasScrollSnap) {
      this.body.scrollBody.css("scrollSnapType" as any, "none")
    }
    if (coord < 0) coord = 0
    const dirLen = dirToLenIndex[dir]
    const maxScroll = this.body.scrollBody.scrollLengthData()[dirLen].get() - this[`offset${capitalize(dirLen)}`]
    if (coord > maxScroll) coord = maxScroll

    const scrollProm = this.body.scrollBody.scroll(dir !== undefined ? {[dir]: coord} as {x: number} | {y: number} : coord, {speed: 700, easing})
    if (hasScrollSnap) {
      scrollProm.then(async () => {
        await delay(100)
        this.body.scrollBody.css("scrollSnapType" as any, "")
      })
    }
    return scrollProm
  }

  private getScrollDefault(dir?: "x" | "y") {
    if (dir === undefined) {
      if (this.hasAttribute("x")) {
        if (this.hasAttribute("y")) throw new Error("Both x and y specified")
        dir = "x"
      }
      else if (this.hasAttribute("y")) dir = "y"
      else throw new Error("No direction specified")
    }
    return dir
  }

  scrollToElem(elem: Element, dir?: "x" | "y", _margin?: number) {
    dir = this.getScrollDefault(dir)

    let margin: number
    if (typeof _margin === "number") margin = _margin
    else {
      if (this.hasAttribute("scrollSnap")) {
        let containerElem = elem
        while (containerElem.tagName.toLowerCase() !== wrapperElemName) containerElem = containerElem.parent(true)
        const alignmentFactor = (containerElem.css("scrollSnapAlign" as any) === "center" ? .5 : containerElem.css("scrollSnapAlign" as any) === "end" ? 1 : 0)
        margin = (this.width() - containerElem.width()) * alignmentFactor
      }
      else margin = 100
    }
    const elemPos = (elem as HTMLElement)[dir === "x" ? "offsetLeft" : "offsetTop"]
    this.scrollToCoord(elemPos - margin, dir)
  }

  fadeInOnScroll(fadeInOnScroll: boolean) {
    this.fadeInOnScrollData.set(!!fadeInOnScroll)
  }

  x(x: string) {
    this.scrollEnabled.x.set(x !== null)
  }
  y(y: string) {
    this.scrollEnabled.y.set(y !== null)
  }

  stl() {
    return super.stl() + require("./scrollBody.css").toString()
  }
  pug() {
    return require("./scrollBody.pug").default
  }
}

declareComponent("c-scroll-body", ScrollBody)



const dirToLenIndex = {
  x: "width",
  y: "height"
} as const


function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

function isScrollIdle(elem: Element, dir?: "x" | "y" | "one", timeout?: number) {
  const { idle, f } = isIdle(timeout)
  elem.scrollData(false, dir).get(f)
  return idle
}

function dataNextTrue(data: Data<boolean>) {
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

function nextScrollIdle(elem: Element, dir?: "x" | "y" | "one", timeout?: number) {
  return dataNextTrue(isScrollIdle(elem, dir, timeout))
}

function inRange(bot: number, top: number) {
  return function(val: number) {
    if (val < bot) return bot
    else if (val > top) return top
    else return val
  }
}
