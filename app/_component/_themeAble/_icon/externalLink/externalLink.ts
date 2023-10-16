import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default declareComponent("external-link-icon", class ExternalLinkIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./externalLink.pug").default
  }
})
