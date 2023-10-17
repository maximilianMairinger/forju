import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class TeamSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./teamSection.css").toString()
  }
  pug() {
    return require("./teamSection.pug").default
  }
}

declareComponent("c-team-section", TeamSection)
