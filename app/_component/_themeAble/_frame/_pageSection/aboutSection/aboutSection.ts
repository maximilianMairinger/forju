import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class AboutSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./aboutSection.css").toString()
  }
  pug() {
    return require("./aboutSection.pug").default
  }
}

declareComponent("c-about-section", AboutSection)
