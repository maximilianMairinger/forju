import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class Line extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./line.pug").default
  }
}

declareComponent("line", Line)