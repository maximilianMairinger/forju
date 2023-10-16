import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class LineAccent extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./lineAccent.pug").default
  }
}

declareComponent("line-accent", LineAccent)