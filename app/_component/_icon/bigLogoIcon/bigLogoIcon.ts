import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class BigLogoIcon extends Icon {
  pug() {
    return require("./bigLogoIcon.pug").default
  }
  stl() {
    return super.stl() + require("./bigLogoIcon.css").toString()
  }
}

declareComponent("c-big-logo-icon", BigLogoIcon)
