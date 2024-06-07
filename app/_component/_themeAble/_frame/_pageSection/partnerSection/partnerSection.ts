import { Data } from "josm";
import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { toggleClass } from "../../../../../lib/actions";


export default class PartnerSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


    const childCount = new Data(this.body.partnerBody.children.length)
    const notTooManyChildsForSideLayout = childCount.tunnel(c => c <= 2)
    notTooManyChildsForSideLayout.get(toggleClass(this.componentBody, "sideLayout"))

    const m = new MutationObserver(() => {
      childCount.set(this.body.partnerBody.children.length)
    })

    
    m.observe(this.body.partnerBody, {
      childList: true,
      subtree: false
    })

    const moreThanOneChild = childCount.tunnel((count) => count > 1)
    moreThanOneChild.get((multiple) => {
      this.body.headline.heading(`Unser${multiple ? "e" : ""} Partner`)
    })

    this.body.headline.isMultiline.get(toggleClass(this.componentBody, "headerTooSmall"))
  }

  stl() {
    return super.stl() + require("./partnerSection.less").toString()
  }
  pug() {
    return require("./partnerSection.pug").default
  }
}

declareComponent("c-partner-section", PartnerSection)
