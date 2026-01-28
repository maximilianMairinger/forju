import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class BlobBIcon extends Icon {
  public draggingSpeedFactor = .4
  public totalMovementFactor = .6
  pug() {
    return require("./blobBIcon.pug").default
  }
  stl() {
    return super.stl() + require("./blobBIcon.css").toString()
  }
}

declareComponent("c-blob-b-icon", BlobBIcon)
