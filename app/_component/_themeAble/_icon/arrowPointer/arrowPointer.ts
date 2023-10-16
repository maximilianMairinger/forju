import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class ArrowPointer extends Icon {
  constructor() {
    super()

  }


  pug() {
    return require("./arrowPointer.pug").default
  }
}

declareComponent("arrow-pointer", ArrowPointer)