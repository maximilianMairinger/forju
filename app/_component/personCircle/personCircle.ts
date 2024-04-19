import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class PersonCircle extends Component {
  protected body: BodyTypes

  constructor() {
    super()


  }



  src(src: string) {
    this.body.img.src(src)
  }

  heading(heading: string) {
    this.body.head.txt(heading)
  }

  subText(txt: string) {
    this.body.body.txt(txt)
  }

  stl() {
    return super.stl() + require("./personCircle.css").toString()
  }
  pug() {
    return require("./personCircle.pug").default
  }
}

declareComponent("c-person-circle", PersonCircle)
