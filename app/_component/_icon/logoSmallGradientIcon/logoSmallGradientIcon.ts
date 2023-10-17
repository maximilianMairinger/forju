import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class LogoSmallGradientIcon extends Icon {
  pug() {
    return require("./logoSmallGradientIcon.pug").default
  }
  stl() {
    return super.stl() + require("./logoSmallGradientIcon.css").toString()
  }
}

declareComponent("c-logo-small-gradient-icon", LogoSmallGradientIcon)
