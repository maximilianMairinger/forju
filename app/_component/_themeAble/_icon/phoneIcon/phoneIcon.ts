import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class PhoneIcon extends Icon {
  constructor() {
    super()

  }


  pug() {
    return require("./phoneIcon.pug").default
  }
}

declareComponent("phone-icon", PhoneIcon)