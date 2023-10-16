import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class DesignerWoman extends Icon {
  private tableElem = this.q("#table") as Element
  private womanElem = this.q("#woman") as Element
  private footNormalElem = this.q("#footNormal")
  private footCutElem = this.q("#footCut")
  constructor() {
    super()

  }

  hideTable() {
    this.tableElem.css("opacity", 0)
    this.womanElem.css("translateX", -50)
    this.footNormalElem.css("opacity", 0)
    this.footCutElem.css("opacity", 1)
  }
  showTabel() {
    this.tableElem.css("opacity", 1)
    this.womanElem.css("translateX", 0)
    this.footNormalElem.css("opacity", 1)
    this.footCutElem.css("opacity", 0)
  }

  pug() {
    return require("./designerWoman.pug").default
  }
}

declareComponent("designer-woman", DesignerWoman)