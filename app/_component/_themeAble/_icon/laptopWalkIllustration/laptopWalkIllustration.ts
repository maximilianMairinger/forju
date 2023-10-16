import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class LaptopWalkIllustration extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./laptopWalkIllustration.pug").default
  }
}

declareComponent("laptop-walk-illustration", LaptopWalkIllustration)