import declareComponent from "../../../../../../lib/declareComponent"
import MiniContactSection from "../miniContactSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class PraesidiumContactSection extends MiniContactSection {
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
