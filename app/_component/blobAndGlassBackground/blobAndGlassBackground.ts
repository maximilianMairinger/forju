import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class BlobAndGlassBackground extends Component {
  protected body: BodyTypes

  constructor() {
    super()



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
