import declareComponent from "../../../../../../lib/declareComponent"
import TeamSection from "../teamSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class FunktionaereSection extends TeamSection {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./funktionaereSection.css").toString()
  }
  pug() {
    return require("./funktionaereSection.pug").default
  }
}

declareComponent("c-funktionaere-section", FunktionaereSection)
