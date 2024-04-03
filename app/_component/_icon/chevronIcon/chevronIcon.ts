import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class ChevronIcon extends Icon {
  pug() {
    return require("./chevronIcon.pug").default
  }
  stl() {
    return super.stl() + require("./chevronIcon.css").toString()
  }
}

declareComponent("c-chevron-icon", ChevronIcon)
