import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import RippleButton from "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import "./../../../_focusAble/_button/button"
import Button from "./../../../_focusAble/_button/button"
import "./../../../link/link"
import Link from "./../../../link/link"
import "./../../../_icon/bigVideo/bigVideo"
import "./../../../_icon/landingCircle/landingCircle"
import "./../../../textBlob/textBlob"
import { EventListener } from "extended-dom"

export default class LandingSection extends PageSection {

  private coverButton = this.q("view-work .coverButton") as Button
  private rippleButton = this.q("view-work .rippleButton") as RippleButton
  private link = this.q("view-work c-link") as Link
  constructor() {
    super("light")

    new EventListener(this.coverButton, ["mouseover", "focusin"], this.link.mouseOverAnimation)
    new EventListener(this.coverButton, ["mouseleave", "focusout"], this.link.mouseOutAnimation)
    this.coverButton.addActivationCallback(this.link.mouseOutAnimation)
    // this.coverButton.addActivationCallback(this.link.clickAnimation)

    this.coverButton.on("mousedown", () => {
      let release = this.rippleButton.initRipple();
      new EventListener(this.coverButton, ["mouseup", "mouseout"], release, undefined, {once: true})
    })
  }

  stl() {
    return super.stl() + require("./landingSection.css").toString()
  }
  pug() {
    return require("./landingSection.pug").default
  }
}

declareComponent("landing-section", LandingSection)
