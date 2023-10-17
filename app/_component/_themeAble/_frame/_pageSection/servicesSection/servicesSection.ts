import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class ServicesSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()

    

  }

  stl() {
    return super.stl() + require("./servicesSection.css").toString()
  }
  pug() {
    return require("./servicesSection.pug").default
  }
}

declareComponent("c-services-section", ServicesSection)
