import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import delay from "tiny-delay"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class Fidget extends Component {
  protected body: BodyTypes

  constructor() {
    super()
    delay(0, () => {
      this.body.cross.anim([
        {offset: 0, rotateZ: "0deg", scale: 1},
        {offset: .25, rotateZ: "180deg", scale: 1.3},
        {offset: .5, rotateZ: "360deg", scale: 1},
        {offset: .75, rotateZ: "540deg", scale: 1.3},
        {offset: 1, rotateZ: "720deg", scale: 1}
      ], {
        duration: 5000,
        iterations: Infinity
      })
    })

  }

  stl() {
    return super.stl() + require("./fidget.css").toString()
  }
  pug() {
    return require("./fidget.pug").default
  }
}

declareComponent("c-fidget", Fidget)
