import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import * as isSafari from "is-safari"

export default class ServicesSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()
    if (isSafari) this.addClass("safari")
    

  }

  stl() {
    return super.stl() + require("./servicesSection.css").toString()
  }
  pug() {
    return require("./servicesSection.pug").default
  }
}

declareComponent("c-services-section", ServicesSection)
