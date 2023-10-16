import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SocialMedia extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./socialMedia.pug").default
  }
}

declareComponent("social-media-illustration", SocialMedia)