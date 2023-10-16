import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import { dirString, domainIndex } from "../../../../../lib/domain";




export default abstract class BlogPage extends Page {

  constructor(content: string | HTMLElement[]) {
    super()
    
    this.body.slotElem.apd(...(content instanceof Array ? content : [content]))
  }


  stl() {
    return super.stl() + require("./blogPage.css").toString()
  }
  pug() {
    return require("./blogPage.pug").default
  }

}