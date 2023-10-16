import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class HeartIllustration extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./heartIllustration.pug").default
  }
}

declareComponent("heart-illustration", HeartIllustration)