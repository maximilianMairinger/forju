import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class FgcLogoIcon extends Icon {
  pug() {
    return require("./fgcLogoIcon.pug").default
  }
  stl() {
    return super.stl() + require("./fgcLogoIcon.css").toString()
  }
}

declareComponent("c-fgc-logo-icon", FgcLogoIcon)
