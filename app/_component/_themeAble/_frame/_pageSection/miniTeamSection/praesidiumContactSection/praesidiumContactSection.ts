import declareComponent from "../../../../../../lib/declareComponent"
import MiniTeamSection from "../miniTeamSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class PraesidiumContactSection extends MiniTeamSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./praesidiumContactSection.css").toString()
  }
  pug() {
    return require("./praesidiumContactSection.pug").default
  }
}

declareComponent("c-praesidium-contact-section", PraesidiumContactSection)
