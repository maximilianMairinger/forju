import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../textBlob/textBlob"
import "./../../../_icon/line/line"
import "../../../_icon/tagAccent/tagAccent"
import "../../../_icon/dotAccent/dotAccent"
import "../../../../image/image"

export default class PhilosophySection extends PageSection {

  constructor() {
    super("light")


  }

  stl() {
    return super.stl() + require("./philosophySection.css").toString()
  }
  pug() {
    return require("./philosophySection.pug").default
  }
}

declareComponent("philosophy-section", PhilosophySection)
