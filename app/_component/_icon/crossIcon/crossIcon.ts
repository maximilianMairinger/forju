import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class CrossIcon extends Icon {
  pug() {
    return require("./crossIcon.pug").default
  }
  stl() {
    return super.stl() + require("./crossIcon.css").toString()
  }
}

declareComponent("c-cross-icon", CrossIcon)
