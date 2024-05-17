import { Data, DataCollection } from "josm";
import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";
import { toggleClass } from "../../../lib/actions";

export default class TextBlob extends ThemeAble {
  private noteElem = this.q("note-header")
  private h1Elem = this.q("h1")
  public readonly headerElem = this.h1Elem.childs("span")
  private bodyElem = this.q("p")
  constructor() {
    super(false)

    const multiline = new Data(false)
    this.h1Elem.resizeDataBase().height.get((height) => {
      const lineHeight = this.headerElem.css("lineHeight")
      multiline.set(height > lineHeight * 1.5)
    })

    const toggleClassMultiLine = toggleClass(this as any, "multiline")
    multiline.get(toggleClassMultiLine)
  }


  heading(to: string) {
    this.headerElem.text(to)
  }
  note(to: string) {
    this.noteElem.text(to)
  }
  //@ts-ignore
  text(): string
  //@ts-ignore
  text(to: string): void
  //@ts-ignore
  text(to?: string) {
    return this.bodyElem.html(to as any)
  }

  public pug(): string {
    return require("./textBlob.pug").default
  }
  stl() {
    return super.stl() + require("./textBlob.css").toString()
  }
  
}

declareComponent("text-blob", TextBlob)
