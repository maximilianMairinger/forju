import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class CashIcon extends Icon {
  pug() {
    return require("./cashIcon.pug").default
  }
  stl() {
    return super.stl() + require("./cashIcon.css").toString()
  }
}

declareComponent("c-cash-icon", CashIcon)
