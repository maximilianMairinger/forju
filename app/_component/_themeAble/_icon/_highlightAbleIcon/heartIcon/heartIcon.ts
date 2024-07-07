import Icon from "../highlightAbleIcon";
import declareComponent from "../../../../../lib/declareComponent";

export default class HeartIcon extends Icon {
  pug() {
    return require("./heartIcon.pug").default
  }
  stl() {
    return super.stl() + require("./heartIcon.css").toString()
  }
}

declareComponent("c-heart-icon", HeartIcon)
