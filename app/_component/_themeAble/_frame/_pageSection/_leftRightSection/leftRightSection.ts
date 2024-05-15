import { Data } from "josm";
import declareComponent from "../../../../../lib/declareComponent"
import { Theme } from "../../../themeAble";
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class LeftRightSection extends PageSection {
  protected body: BodyTypes
  public isMobile = new Data()

  constructor(mobileSwitchPx: number = 800, theme?: Theme) {
    super(theme)
    
    
    this.resizeDataBase()(({width}) => {
      this.isMobile.set(width < mobileSwitchPx)
    })

    this.isMobile.get((isMobile) => {
      if (isMobile) this.componentBody.addClass("mobile")
      else this.componentBody.removeClass("mobile")
    })

  }

  stl() {
    return super.stl() + require("./leftRightSection.less").toString()
  }
  pug() {
    return require("./leftRightSection.pug").default
  }
}

declareComponent("c-left-right-section", LeftRightSection)
