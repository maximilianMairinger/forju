import declareComponent from "../../lib/declareComponent"
import BlobAIcon from "../_icon/blobAIcon/blobAIcon";
import BlobBIcon from "../_icon/blobBIcon/blobBIcon";
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class BlobAndGlassBackground extends Component {
  protected body: BodyTypes

  constructor() {
    super()

    const blobA = new BlobAIcon().addClass("blob").addClass("a")
    const blobB = new BlobBIcon().addClass("blob").addClass("b")

    this.append(blobA)
    this.append(blobB)
  }

  async loadAnimations() {
    await import("./blobMove").then(({ default: blobMove }) => {
        blobMove(this)
    })
  }

  stl() {
    return super.stl() + require("./blobAndGlassBackground.css").toString()
  }
  pug() {
    return require("./blobAndGlassBackground.pug").default
  }
}

declareComponent("c-blob-and-glass-background", BlobAndGlassBackground)
