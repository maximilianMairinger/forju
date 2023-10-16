import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../textBlob/textBlob"
import Link from "../../../link/link"
import "../../../_icon/landingCircle/landingCircle"
import "../../../_icon/quotationMark/quotationMark"
import "../../../_icon/designerWoman/designerWoman"
import DesignerWomanIcon from "../../../_icon/designerWoman/designerWoman"
import lang from "../../../../../lib/lang"
import { Data, DataCollection } from "josm"
import "extended-dom"
import "../../../../image/image"



export default class TeamSection extends PageSection {
  private quoteHeading = this.q("quote-heading") as HTMLElement
  private quoteHadingSubtext = this.quoteHeading.childs("heading-subtext") as HTMLElement
  private designerWoman = this.q("c-designer-woman") as DesignerWomanIcon
  constructor() {
    super("light");

    (() => {
      const isMobile = this.quoteHeading.resizeData().tunnel(() => this.quoteHadingSubtext.offsetLeft <= 60)

      isMobile.get((is) => {
        if (is) this.quoteHeading.addClass("mobile")
        else this.quoteHeading.removeClass("mobile")
      })
    })();

    (() => {
      const isMobile = document.body.resizeData().tunnel(({width}) => width <= 950)

      isMobile.get((is) => {
        if (is) this.designerWoman.hideTable()
        else this.designerWoman.showTabel()
      })
    })()

    
  }

  stl() {
    return super.stl() + require("./teamSection.css").toString()
  }
  pug() {
    return require("./teamSection.pug").default
  }
}

declareComponent("team-section", TeamSection)
