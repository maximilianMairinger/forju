import { Data, DataCollection } from "josm";
import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import delay from "tiny-delay";



export default class ParallaxImgCard extends Component {
  protected body: BodyTypes
  public parallaxProgHookDir = this.body.parallax.parallaxProgHookDir
  public parallaxProgHook = this.body.parallax.parallaxProgHook
  public curDir = this.body.parallax.curDir

  constructor() {
    super()
  }

  

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

  

  imgSrc(to: string, forceLoad?: boolean) {
    this.body.img.src(to, forceLoad)
  }

  stl() {
    return super.stl() + require("./parallaxImgCard.css").toString()
  }
  pug() {
    return require("./parallaxImgCard.pug").default
  }
}

declareComponent("c-parallax-img-card", ParallaxImgCard)
