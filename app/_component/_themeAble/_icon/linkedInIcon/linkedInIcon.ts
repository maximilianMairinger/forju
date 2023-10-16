import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class LinkedInIcon extends Icon {
  constructor() {
    super()

  }


  pug() {
    return require("./linkedInIcon.pug").default
  }
}

declareComponent("linked-in-icon", LinkedInIcon)