import declareComponent from "../../../lib/declareComponent"
import ThemeAble from "../themeAble"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { getCurrentLoadRecord } from "../../_themeAble/_frame/frame"




export default class ContactCard extends ThemeAble {
  public body: BodyTypes

  constructor() {
    super(false)

    this.body.btn.userFeedbackMode({
      hover: false,
      ripple: false
    })

    // todo: max size

    
    getCurrentLoadRecord().full.add(() => {
      return import(/* webpackChunkName: "contactCardInteraction" */"./interaction").then((mod) => mod.default.apply(this))
    })
    

    

    this.body.subSubTxt.addActivationListener((e) => {
      e.preventDefault()
      e.stopPropagation()
    })
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
