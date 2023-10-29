import LinkedList from "fast-linked-list";
import declareComponent from "../../../lib/declareComponent"
import ThemeAble from "../themeAble"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import keyIndex, { memoize } from "key-index"
import { latestLatent } from "more-proms"
import { EventListener } from "extended-dom";
import { loadRecord } from "../../_themeAble/_frame/frame"
import confetti from "canvas-confetti"













export default class ContactCard extends ThemeAble {
  public body: BodyTypes

  constructor() {
    super(false)

    this.body.btn.userFeedbackMode({
      hover: false,
      ripple: false
    })

    // todo: max size

    
    loadRecord.full.add(() => {
      import(/* webpackChunkName: "contactCardInteraction" */"./interaction").then((mod) => mod.default.apply(this))
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
