import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class HomeIcon extends Icon {
  constructor() {
    super()

  }


  pug() {
    return require("./homeIcon.pug").default
  }
}

declareComponent("home-icon", HomeIcon)