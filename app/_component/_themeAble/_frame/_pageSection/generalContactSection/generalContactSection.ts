import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class GeneralContactSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./generalContactSection.css").toString()
  }
  pug() {
    return require("./generalContactSection.pug").default
  }
}

declareComponent("c-general-contact-section", GeneralContactSection)
