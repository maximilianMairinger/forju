import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class VersionControl extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./versionControl.pug").default
  }
}

declareComponent("version-control", VersionControl)