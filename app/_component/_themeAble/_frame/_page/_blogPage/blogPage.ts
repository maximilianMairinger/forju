import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import { dirString, domainIndex } from "../../../../../lib/domain";
import TextBlob from "../../../textBlob/textBlob";
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"




export default abstract class BlogPage extends Page {
  protected body: BodyTypes

  constructor(...content: (string | Element)[]) {
    super()

    this.setBlog(...content)
  }

  setBlog(...content: (string | Element)[]) {
    this.body.contentContainer.innerHTML = ""
    this.body.contentContainer.apd(...content) 
    this.scrollTop = 0
  }


  protected async navigationCallback(loadId: unknown) {
    this.scrollTop = 0
  }


  stl() {
    return super.stl() + require("./blogPage.css").toString()
  }
  pug() {
    return require("./blogPage.pug").default
  }

}