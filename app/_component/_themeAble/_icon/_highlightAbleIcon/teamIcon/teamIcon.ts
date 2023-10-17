import HighlightAbleIcon from "../highlightAbleIcon";
import declareComponent from "../../../../../lib/declareComponent";

export default class TeamIcon extends HighlightAbleIcon {
  constructor() {
    super()

  }

  pug() {
    return require("./teamIcon.pug").default
  }
}

declareComponent("c-team-icon", TeamIcon)

