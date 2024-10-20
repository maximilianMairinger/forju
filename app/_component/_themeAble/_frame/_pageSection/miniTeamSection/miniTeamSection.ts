import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class MiniTeamSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()

    this.componentBody.addClass("cardsCount" + this.q("c-contact-card", true).length)
  }

  stl() {
    return super.stl() + require("./miniTeamSection.css").toString()
  }
  pug() {
    return require("./miniTeamSection.pug").default
  }
}

declareComponent("c-mini-team-section", MiniTeamSection)
