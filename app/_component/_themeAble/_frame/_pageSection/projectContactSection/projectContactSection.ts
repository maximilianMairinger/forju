import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class ProjectContactSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./projectContactSection.css").toString()
  }
  pug() {
    return require("./projectContactSection.pug").default
  }
}

declareComponent("c-project-contact-section", ProjectContactSection)
