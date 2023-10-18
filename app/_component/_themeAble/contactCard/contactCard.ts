import declareComponent from "../../../lib/declareComponent"
import ThemeAble from "../themeAble"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class ContactCard extends ThemeAble {
  protected body: BodyTypes

  constructor() {
    super(false)
  }

  personName(to: string) {
    this.body.heading.text(to)
  }

  position(to: string) {
    this.body.subTxt.text(to)
  }

  pic(src: string) {
    this.body.pic.src(src)
  }

  email(to: string) {
    this.body.subSubTxt.content(to)
  }

  stl() {
    return super.stl() + require("./contactCard.css").toString()
  }
  pug() {
    return require("./contactCard.pug").default
  }
}

declareComponent("c-contact-card", ContactCard)
