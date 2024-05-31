import { Data, DataCollection, DataSubscription } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { dirToLenIndex, dirToSideIndex, scaleAroundCenter } from "../../lib/util";








export default class Parallax extends Component {
  protected body: BodyTypes
  public parallaxProgHookDir = {
    x: new Data(0),
    y: new Data(0)
  }
  public parallaxProgHook: Data<number>
  public curDir = new Data<"x" | "y">("x")

  public parallaxLengthData = new Data(100)

  constructor(parallaxLength?: number) {
    super()

    if (parallaxLength !== undefined) this.parallaxLength(parallaxLength)

    this.curDir.get((dir) => {
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
    })

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

    containerSize.get((containerSize) => {
      console.log("containerSize", containerSize)
    })



    const maxParallaxSize = new Data() as Data<number>
    new DataCollection(containerSize, this.parallaxLengthData).get((mySize, parallaxLength) => {
      maxParallaxSize.set(mySize + parallaxLength)
    })





    const picSize = new Data(Infinity)

    picSize.get((picSize) => {
      console.log("picSize", picSize)
    })



    let lastSub: DataSubscription<[any]>
    curChild.get((child) => {
      if (lastSub !== undefined) lastSub.deactivate()
      setTimeout(() => {
        lastSub = child.resizeDataBase()(widthDir).get((width: number) => {
          picSize.set(width === 0 ? Infinity : width)
        })
      })
    })



    const scaleFactor = new Data() as Data<number>
    new DataCollection(picSize, maxParallaxSize).get((picSize, maxParallaxSize) => {
      scaleFactor.set(picSize < maxParallaxSize ? maxParallaxSize / picSize : 1)
    })

    scaleFactor.get((fac) => {
      this.body.adaptiveBody.css("scale", fac)
    })




    


    
    
    let lastSub2: any
    curChild.get(async (child) => {
      if (child === undefined) return
      if (lastSub2 !== undefined) lastSub2.deactivate() 
      setTimeout(() => {
        lastSub2 = new DataCollection(this.curDir, this.resizeDataBase()(widthDir), child.resizeDataBase()(widthDir), this.parallaxLengthData).get((dir: "x" | "y", parentWidth: number, childWidth: number, parallaxLength) => {
          const hook = this.parallaxProgHookDir[dir]
    
          const translate = `translate${dir.toUpperCase()}`
          const translateLen = parallaxLength
          const translateStart = -translateLen / 2
          const translateEnd = -translateStart
          child.anim([
            { offset: 0, transform: `${translate}(${translateStart}px)` },
            { offset: 1, transform: `${translate}(${translateEnd}px)` }
          ], {smooth: false}, hook.tunnel((x) => x * 100))
        })
      })
      
    })

  }
  parallaxLength(px: number) {
    this.parallaxLengthData.set(+px)
  }

  relativeScrollProg(prog: number) {
    this.parallaxProgHook.set(prog)
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
