import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class LogoSmallIGradientIcon extends Icon {
  pug() {
    return require("./logoSmallIGradientIcon.pug").default
  }
  stl() {
    return super.stl() + require("./logoSmallIGradientIcon.css").toString()
  }
}

declareComponent("c-logo-small-gradient-icon", LogoSmallIGradientIcon)
