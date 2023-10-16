import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class ArrowIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./arrow.pug").default
  }
}

declareComponent("arrow-icon", ArrowIcon)