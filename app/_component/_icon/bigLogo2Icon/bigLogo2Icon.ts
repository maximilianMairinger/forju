import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class BigLogo2Icon extends Icon {
  pug() {
    return require("./bigLogo2Icon.pug").default
  }
  stl() {
    return super.stl() + require("./bigLogo2Icon.css").toString()
  }
}

declareComponent("c-big-logo2-icon", BigLogo2Icon)
