import Component from "../component"
import declareComponent from "../../lib/declareComponent"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class Site extends Component {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./site.css").toString()
  }
  pug() {
    return require("./site.pug").default
  }
}

declareComponent("site", Site)
