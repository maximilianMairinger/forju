import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class QuotationMark extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./quotationMark.pug").default
  }
}

declareComponent("quotation-mark", QuotationMark)