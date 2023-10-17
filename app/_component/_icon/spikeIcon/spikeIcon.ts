import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class SpikeIcon extends Icon {
  pug() {
    return require("./spikeIcon.pug").default
  }
  stl() {
    return super.stl() + require("./spikeIcon.css").toString()
  }
}

declareComponent("c-spike-icon", SpikeIcon)
