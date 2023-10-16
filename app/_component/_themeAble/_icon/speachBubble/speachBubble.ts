import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SpeachBubble extends Icon {
  constructor() {
    super()

  }

  stl() {
    return super.stl() + require("./speachBubble.css").toString()
  }

  pug() {
    return require("./speachBubble.pug").default
  }
}

declareComponent("speach-bubble", SpeachBubble)