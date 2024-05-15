import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import { dirString, domainIndex } from "../../../../../lib/domain";
import TextBlob from "../../../textBlob/textBlob";




export default abstract class BlogPage extends Page {

  constructor(...content: (string | Element)[]) {
    super()

    this.setBlog(...content)
  }

  setBlog(...content: (string | Element)[]) {
    this.body.contentContainer.innerHTML = ""
    this.body.contentContainer.apd(...content) 
    this.addHooksToChilds([...this.children])
    this.scrollTop = 0
  }
  protected addHooksToChilds(childs: Element[]) {
    for (const child of childs) {
      if (child instanceof TextBlob) {
        child.resizeDataBase().height.get((height) => {
          const lineHeight = child.headerElem.css("lineHeight")
          if (height > lineHeight * 1.5) child.removeAttribute("popUnderline")
          else child.setAttribute("popUnderline", "true")
        })
      }
        
    }
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