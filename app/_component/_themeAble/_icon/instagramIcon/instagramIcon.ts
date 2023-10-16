import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class InstagramIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./instagramIcon.pug").default
  }
}

declareComponent("instagram-icon", InstagramIcon)