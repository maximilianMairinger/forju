import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"



function scaleAroundCenter(by: number) {
  const half = (1 - by) / 2
  return function scale(frac: number) {
    return half + frac * by
  }
}




export default class Parallax extends Component {
  protected body: BodyTypes
  public parallaxProgHookDir = {
    x: new Data(0),
    y: new Data(0)
  }
  public parallaxProgHook: Data<number>
  public curDir = new Data<"x" | "y">("x")

  constructor(private _parallaxFactor = .4) {
    super()

    this.curDir.get((dir) => {
      if (dir === "x") {
        this.parallaxProgHook = this.parallaxProgHookDir.x
        this.setAttribute("x", "")
        this.removeAttribute("y")
      }
      else {
        this.parallaxProgHook = this.parallaxProgHookDir.y
        this.setAttribute("y", "")
        this.removeAttribute("x")
      }
    })


    const widthDir = this.curDir.tunnel((dir) => dir === "x" ? "width" : "height")
    
    new DataCollection(this.curDir, this.resizeDataBase()(widthDir), this.children[0].resizeDataBase()(widthDir)).get((dir: "x" | "y", cardWidth: number, imgWidth: number) => {
      const hook = this.parallaxProgHookDir[dir].tunnel((prog) => {
        return scaleFunc.get()(prog)
      })

      const translate = `translate${dir.toUpperCase()}`
      
      this.children[0].anim([
        { offset: 0, transform: `${translate}(0)` },
        { offset: 1, transform: `${translate}(${cardWidth - imgWidth}px)` }
      ], {smooth: false}, hook.tunnel((x) => x * 100))
    }, false)


    const mySize = this.resizeDataBase()(widthDir) as Data<number>
    const maxParallaxSize = mySize.tunnel(size => size * this._parallaxFactor)


    const curChild = new Data(undefined)
    


    const picSize = new Data(Infinity)


    let lastSub: DataSubscription<[any]>
    curChild.get((child) => {
      console.log("child", child)
      if (lastSub !== undefined) lastSub.deactivate()
      lastSub = child.resizeDataBase()(widthDir).get((width: number) => {
        picSize.set(width === 0 ? Infinity : width)
      })
    }, false)

    curChild.set(this.children[0])

    new MutationObserver(() => {
      curChild.set(this.children[0])
    }).observe(this, {
      childList: true,
      subtree: false,
      attributes: false
    })

    

    

    const picSizeFactor = new Data()
    new DataCollection(picSize, maxParallaxSize).get((picSize, maxParallaxSize) => {
      picSizeFactor.set(maxParallaxSize / picSize)
    })

    picSizeFactor.get((q) => {
      console.log("picSizeFactor", q)
    })


    const scaleFunc = picSizeFactor.tunnel(scaleAroundCenter)


  }

  parallaxFactor(factor: number | string) {
    this._parallaxFactor = +factor
  }

  relativeScrollProg(prog: number) {
    this.parallaxProgHook.set(prog)
  }

  x() {
    this.curDir.set("x")
  }
  y() {
    this.curDir.set("y")
  }

  stl() {
    return super.stl() + require("./parallax.less").toString()
  }
  pug() {
    return require("./parallax.pug").default
  }
}

declareComponent("c-parallax", Parallax)
