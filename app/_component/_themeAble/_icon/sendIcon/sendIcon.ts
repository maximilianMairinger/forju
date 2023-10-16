import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SendIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./sendIcon.pug").default
  }
}

declareComponent("send-icon", SendIcon)