import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class SendCubeIcon extends Icon {
  pug() {
    return require("./sendCubeIcon.pug").default
  }
  stl() {
    return super.stl() + require("./sendCubeIcon.css").toString()
  }
}

declareComponent("c-send-cube-icon", SendCubeIcon)
