import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class BlogSection extends PageSection {
  protected body: BodyTypes

  public blogContentContainer = this.body.contentContainer

  constructor(...content: (string | Element)[]) {
    super()

    this.setBlog(...content)
  }

  protected setBlog(...content: (string | Element)[]) {
    this.body.contentContainer.innerHTML = ""
    this.body.contentContainer.apd(...content) 
  }

  setBlogFromQuery(loadId: string) {
    // only relevant for ghostBlogSection
    return Promise.resolve();
  }

  stl() {
    return super.stl() + require("./blogSection.css").toString()
  }
  pug() {
    return require("./blogSection.pug").default
  }
}

declareComponent("c-blog-section", BlogSection)
