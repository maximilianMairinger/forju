import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class BlobBIcon extends Icon {
  pug() {
    return require("./blobBIcon.pug").default
  }
  stl() {
    return super.stl() + require("./blobBIcon.css").toString()
  }
}

declareComponent("c-blob-b-icon", BlobBIcon)
