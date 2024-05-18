import declareComponent from "../../../../../../../lib/declareComponent"
import GhostBlogPage from "../ghostBlogPage"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class FixedGhostPage extends GhostBlogPage {
  protected body: BodyTypes

  constructor(private slug: string) {
    super()


  }

  tryNavigationCallback() {
    return super.tryNavigationCallback(this.slug)
  }


  public navigationCallback() {
    return super.navigationCallback(this.slug)
  }

}

declareComponent("c-fixed-ghost-page", FixedGhostPage)
