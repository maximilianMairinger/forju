import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import { dirString, domainIndex } from "../../../../../lib/domain";




export default abstract class BlogPage extends Page {

  constructor() {
    super()
  }

  protected async navigationCallback() {
    // todo: multiple blogs appended
    this.scrollTop = 0
  }


  stl() {
    return super.stl() + require("./blogPage.less").toString()
  }
  pug() {
    return require("./blogPage.pug").default
  }

}