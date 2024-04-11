import { Data, DataCollection } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

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
      const translate = `translate${dir.toUpperCase()}`
      
      this.body.img.anim([
        { offset: 0, transform: `${translate}(0)` },
        { offset: 1, transform: `${translate}(${cardWidth - imgWidth}px)` }
      ], {smooth: false}, this.parallaxProgHookDir[dir].tunnel((x) => x * 100))
    })
  }

  heading(txt: string | Data<string>) {
    this.body.heading.txt(txt as Data<string>)
  }
  desc(txt: string | Data<string>) {
    this.body.desc.txt(txt as Data<string>)
  }

  x() {
    this.curDir.set("x")
  }
  y() {
    this.curDir.set("y")
  }

  

  imgSrc(to: string) {
    this.body.img.src(to)
  }

  stl() {
    return super.stl() + require("./parallaxImgCard.css").toString()
  }
  pug() {
    return require("./parallaxImgCard.pug").default
  }
}

declareComponent("c-parallax-img-card", ParallaxImgCard)
