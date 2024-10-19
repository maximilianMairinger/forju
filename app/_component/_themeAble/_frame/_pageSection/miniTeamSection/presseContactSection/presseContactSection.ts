import declareComponent from "../../../../../../lib/declareComponent"
import MiniTeamSection from "../miniTeamSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class PresseContactSection extends MiniTeamSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./presseContactSection.css").toString()
  }
  pug() {
    return require("./presseContactSection.pug").default
  }
}

declareComponent("c-presse-contact-section", PresseContactSection)
