import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class SpikeShadowIcon extends Icon {
  pug() {
    return require("./spikeShadowIcon.pug").default
  }
  stl() {
    return super.stl() + require("./spikeShadowIcon.css").toString()
  }
}

declareComponent("c-spike-shadow-icon", SpikeShadowIcon)
