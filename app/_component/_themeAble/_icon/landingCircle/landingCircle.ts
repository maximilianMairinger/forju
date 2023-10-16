import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class LandingCircle extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./landingCircle.pug").default
  }
}

declareComponent("landing-circle", LandingCircle)