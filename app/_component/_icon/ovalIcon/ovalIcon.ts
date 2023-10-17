import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class OvalIcon extends Icon {
  pug() {
    return require("./ovalIcon.pug").default
  }
  stl() {
    return super.stl() + require("./ovalIcon.css").toString()
  }
}

declareComponent("c-oval-icon", OvalIcon)
