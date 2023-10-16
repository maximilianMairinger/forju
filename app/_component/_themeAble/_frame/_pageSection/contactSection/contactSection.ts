import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../link/copyLink/copyLink"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "../../../_icon/speachBubble/speachBubble"
import "../../../_icon/instagramIcon/instagramIcon"
import "../../../_icon/linkedInIcon/linkedInIcon"
import "../../../_icon/sendIcon/sendIcon"
import "../../../_icon/homeIcon/homeIcon"
import "../../../_icon/tiktokIcon/tiktokIcon"
import "../../../_icon/phoneIcon/phoneIcon"
import "../../../_icon/arrowPointer/arrowPointer"





export default class ContactSection extends PageSection {
  
  constructor() {
    super("light");

    this.q("#currentYear").text(new Date().getFullYear())

    
  }

  stl() {
    return super.stl() + require("./contactSection.css").toString()
  }
  pug() {
    return require("./contactSection.pug").default
  }
}

declareComponent("contact-section", ContactSection)
