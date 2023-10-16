import HighlightAbleIcon from "../highlightAbleIcon";
import declareComponent from "../../../../../lib/declareComponent";

export default class TeamIcon extends HighlightAbleIcon {
  constructor() {
    super()

  }

  pug() {
    return require("./team.pug").default
  }
}

declareComponent("team-icon", TeamIcon)
