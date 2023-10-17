import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class LandingCircle extends Icon {
  constructor() {
    super()

  }

  stl() {
    return super.stl() + require("./landingCircle.css").toString()
  }

  pug() {
    return require("./landingCircle.pug").default
  }
}

declareComponent("landing-circle", LandingCircle)