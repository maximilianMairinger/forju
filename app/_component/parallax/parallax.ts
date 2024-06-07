import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { dirToLenIndex, dirToSideIndex, findFirstParentThatMatches, scaleAroundCenter } from "../../lib/util";
import { relativeViewProgressData } from "../../lib/actions";
import delay from "tiny-delay";
import { ResablePromise, latestLatent } from "more-proms";








export default class Parallax extends Component {
  protected body: BodyTypes
  public parallaxProgHookDir = {
    x: new Data(0),
    y: new Data(0)
  }
  public parallaxProgHook: Data<number>
  public curDir = new Data<"x" | "y">("x")

  public parallaxLengthData = new Data(150)
  private rdy = new ResablePromise<void>()

  constructor(parallaxLength?: number) {
    super()

    if (parallaxLength !== undefined) this.parallaxLength(parallaxLength)


    const _setDirF = (dir: "x" | "y") => {
      // this timeout is here because: Attribute set may get cached by the browser, and then multiple attribute sets are combined into one call under the same call stack. And when this call then triggers a josm subscription, this causes the multiple call avoidance mechanism to step in, which may be unwanted, as it could be a completely separate attr that has called it
      // we have to do latestLatent, because otherwise attr set could cause infinite loop
      if (dir === "x") {
        this.parallaxProgHook = this.parallaxProgHookDir.x
        this.removeAttribute("y")
        this.setAttribute("x", "x")
      }
      else {
        this.parallaxProgHook = this.parallaxProgHookDir.y
        
        this.removeAttribute("x")
        this.setAttribute("y", "y")
      }
    }


    const setDirF = latestLatent(async (dir: "x" | "y") => {
      await delay(0)
      return dir
    }).then(_setDirF)

    this.curDir.get(setDirF, false)
    _setDirF(this.curDir.get())

    const curChild = new Data(undefined)
    
    curChild.set(this.children[0])

    new MutationObserver(() => {
      curChild.set(this.children[0])
    }).observe(this, {
      childList: true,
      subtree: false,
      attributes: false
    })



    

    const widthDir = this.curDir.tunnel((dir) => dirToLenIndex[dir])
    const containerSize = this.resizeDataBase()(widthDir) as Data<number>



    const maxParallaxSize = new Data() as Data<number>
    new DataCollection(containerSize, this.parallaxLengthData.tunnel((a) => Math.abs(a))).get((mySize, parallaxLength) => {
      maxParallaxSize.set(mySize + parallaxLength)
    })





    const picSize = new Data(Infinity)


    let lastSub: DataSubscription<[any]>
    curChild.get((child) => {
      if (lastSub !== undefined) lastSub.deactivate()
      setTimeout(() => {
        lastSub = child.resizeDataBase()(widthDir).get((width: number) => {
          picSize.set(width === 0 ? Infinity : width)
        })
      })
    })



    const scaleFactor = new Data(1) as Data<number>
    new DataCollection(picSize, maxParallaxSize).get((picSize, maxParallaxSize) => {
      scaleFactor.set(picSize < maxParallaxSize ? maxParallaxSize / picSize : 1)
    })

    scaleFactor.get((fac) => {
      this.body.adaptiveBody.css("scale", fac)
    })


    
    
    let lastSub2: any
    let lastAnimSub: Promise<{cancel: () => void}>
    curChild.get(async (child: HTMLElement) => {
      if (child === undefined) return
      if (lastSub2 !== undefined) lastSub2.deactivate() 
      setTimeout(() => {
        lastSub2 = new DataCollection(this.curDir, this.resizeDataBase()(widthDir), child.resizeDataBase()(widthDir), this.parallaxLengthData).get((dir: "x" | "y", parentWidth: number, childWidth: number, parallaxLength) => {
          const hook = this.parallaxProgHookDir[dir]
    
          const translate = `translate${dir.toUpperCase()}`
          const translateStart = -parallaxLength / 2
          const translateEnd = -translateStart
          if (lastAnimSub !== undefined) lastAnimSub.then((x) => x.cancel())
          // todo unsub from anim
          lastAnimSub = child.anim([
            { offset: 0, [translate]: translateStart },
            { offset: 1, [translate]: translateEnd }
          ], {smooth: false, easing: "linear"}, hook.tunnel((x) => x * 100))
        })
      })
      
    })

    this.rdy.res()
  }
  parallaxLength(px: number) {
    this.parallaxLengthData.set(+px)
  }

  relativeScrollProg(prog: number) {
    this.parallaxProgHook.set(prog)
  }

  async autoHook(scrollParent: Element | string, dir: Data<"x" | "y"> | "x" | "y" = this.curDir) {
    let scrollParentElem: Element
    if (typeof scrollParent === "string") {
      await this.rdy
      await delay(0)
      scrollParentElem = findFirstParentThatMatches(this, scrollParent)
      if (!scrollParentElem) {
        throw new Error("Couldnt find scrollParentElem matching query: " + scrollParent)
      }
      // this may be called from attribute set, and then the constructor hasnt even run
    }
    else scrollParentElem = scrollParent

    relativeViewProgressData(dir, scrollParentElem, this).get((prog) => {
      this.parallaxProgHook.set(prog)
    }, false)
  }

  x(x) {
    if (x == null) return this.curDir.get()
    else this.curDir.set("x")
  }
  y(y) {
    if (y == null) return this.curDir.get()
    else this.curDir.set("y")
  }

  stl() {
    return super.stl() + require("./parallax.less").toString()
  }
  pug() {
    return require("./parallax.pug").default
  }
}

declareComponent("c-parallax", Parallax)
