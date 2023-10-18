import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class ViennaIcon extends Icon {
  pug() {
    return require("./viennaIcon.pug").default
  }
  stl() {
    return super.stl() + require("./viennaIcon.css").toString()
  }
}

declareComponent("c-vienna-icon", ViennaIcon)
