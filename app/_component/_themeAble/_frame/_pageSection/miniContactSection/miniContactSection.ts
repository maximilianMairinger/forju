import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class MiniContactSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./miniContactSection.css").toString()
  }
  pug() {
    return require("./miniContactSection.pug").default
  }
}

declareComponent("c-mini-contact-section", MiniContactSection)
