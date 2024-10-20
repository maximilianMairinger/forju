import declareComponent from "../../../../../../lib/declareComponent"
import MiniTeamSection from "../miniTeamSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class KinderschutzTeamSection extends MiniTeamSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./kinderschutzTeamSection.css").toString()
  }
  pug() {
    return require("./kinderschutzTeamSection.pug").default
  }
}

declareComponent("c-kinderschutz-team-section", KinderschutzTeamSection)
