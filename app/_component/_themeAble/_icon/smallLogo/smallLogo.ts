import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SmallLogo extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./smallLogo.pug").default
  }
}

declareComponent("small-logo", SmallLogo)