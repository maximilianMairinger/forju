import { Data } from "josm";
import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

function toggleClass(elem: HTMLElement, className: string) {

  return function (flag: boolean) {
    if (flag) elem.addClass(className)
    else elem.removeClass(className)
  }
}

export default class PartnerSection extends PageSection {
  protected body: BodyTypes

  constructor() {
    super()


    const childCount = new Data(this.body.partnerBody.children.length)
    const tooMuchChildsForSideLayout = childCount.tunnel(c => c <= 2)
    tooMuchChildsForSideLayout.get(toggleClass(this.componentBody, "sideLayout"))

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

    const headerTooSmall = this.body.headerSection.resizeDataBase().width.tunnel((w) => w < 380)
    headerTooSmall.get(toggleClass(this.componentBody, "headerTooSmall"))

  }

  stl() {
    return super.stl() + require("./partnerSection.less").toString()
  }
  pug() {
    return require("./partnerSection.pug").default
  }
}

declareComponent("c-partner-section", PartnerSection)
