import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class LogoSmallIcon extends Icon {
  pug() {
    return require("./logoSmallIcon.pug").default
  }
  stl() {
    return super.stl() + require("./logoSmallIcon.css").toString()
  }
}

declareComponent("c-logo-small-icon", LogoSmallIcon)
