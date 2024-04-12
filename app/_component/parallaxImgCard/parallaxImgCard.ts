import { Data, DataCollection } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import delay from "tiny-delay";


const maxParallaxSizeFactorRelativeToCardSize = .4


function scaleAroundCenter(by: number) {
  const half = (1 - by) / 2
  return function scale(frac: number) {
    return half + frac * by
  }
}

export default class ParallaxImgCard extends Component {
  protected body: BodyTypes
  public parallaxProgHookDir = {
    x: new Data(0),
    y: new Data(0)
  }
  public parallaxProgHook: Data<number>
  public curDir = new Data<"x" | "y">("x")

  constructor() {
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
    
    new DataCollection(this.curDir, this.resizeDataBase()(widthDir), this.body.img.resizeDataBase()(widthDir)).get((dir: "x" | "y", cardWidth: number, imgWidth: number) => {
      const hook = this.parallaxProgHookDir[dir].tunnel((prog) => {
        return scaleFunc.get()(prog)
      })

      const translate = `translate${dir.toUpperCase()}`
      
      this.body.img.anim([
        { offset: 0, transform: `${translate}(0)` },
        { offset: 1, transform: `${translate}(${cardWidth - imgWidth}px)` }
      ], {smooth: false}, hook.tunnel((x) => x * 100))
    }, false)


    const mySize = this.resizeDataBase()(widthDir) as Data<number>
    const maxParallaxSize = mySize.tunnel(size => size * maxParallaxSizeFactorRelativeToCardSize)

    const picSizeFactor = new Data()
    new DataCollection(this.picSize, maxParallaxSize).get((picSize, maxParallaxSize) => {
      picSizeFactor.set(maxParallaxSize / picSize)
    })


    const scaleFunc = picSizeFactor.tunnel(scaleAroundCenter)



  }

  private picSize = new Data(Infinity)

  relativeScrollProg(prog: number) {
    this.parallaxProgHook.set(prog)
  }

  heading(txt: string | Data<string>) {
    this.body.heading.txt(txt as string)
  }
  desc(txt: string | Data<string>) {
    this.body.desc.txt(txt as string)
  }

  x() {
    this.curDir.set("x")
  }
  y() {
    this.curDir.set("y")
  }

  

  imgSrc(to: string) {
    this.body.img.src(to)
    this.body.img.loaded[""].then(() => {
      this.picSize.set(this.body.img.width())
    })
  }

  stl() {
    return super.stl() + require("./parallaxImgCard.css").toString()
  }
  pug() {
    return require("./parallaxImgCard.pug").default
  }
}

declareComponent("c-parallax-img-card", ParallaxImgCard)
