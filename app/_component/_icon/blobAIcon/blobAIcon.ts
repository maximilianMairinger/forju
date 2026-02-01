import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class BlobAIcon extends Icon {
  public draggingSpeedFactor = 1
  public totalMovementFactor = 1
  pug() {
    return require("./blobAIcon.pug").default
  }
  stl() {
    return super.stl() + require("./blobAIcon.css").toString()
  }
}

declareComponent("c-blob-a-icon", BlobAIcon)
