import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class TiktokIcon extends Icon {
  constructor() {
    super()

  }


  pug() {
    return require("./tiktokIcon.pug").default
  }
}

declareComponent("tiktok-icon", TiktokIcon)