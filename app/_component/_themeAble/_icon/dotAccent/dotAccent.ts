import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class DotAccent extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./dotAccent.pug").default
  }
}

declareComponent("dot-accent", DotAccent)