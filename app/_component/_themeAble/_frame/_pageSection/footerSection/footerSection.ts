import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class FooterSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./footerSection.css").toString()
  }
  pug() {
    return require("./footerSection.pug").default
  }
}

declareComponent("c-footer-section", FooterSection)
