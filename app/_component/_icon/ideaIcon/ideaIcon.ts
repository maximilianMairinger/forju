import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class IdeaIcon extends Icon {
  pug() {
    return require("./ideaIcon.pug").default
  }
  stl() {
    return super.stl() + require("./ideaIcon.css").toString()
  }
}

declareComponent("c-idea-icon", IdeaIcon)
