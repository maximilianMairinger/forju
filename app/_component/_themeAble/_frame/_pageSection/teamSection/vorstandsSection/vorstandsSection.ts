import declareComponent from "../../../../../../lib/declareComponent"
import TeamSection from "../teamSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class VorstandsSection extends TeamSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./vorstandsSection.css").toString()
  }
  pug() {
    return require("./vorstandsSection.pug").default
  }
}

declareComponent("c-vorstands-section", VorstandsSection)
