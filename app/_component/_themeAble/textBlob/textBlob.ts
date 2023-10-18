import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";

export default class TextBlob extends ThemeAble {
  private noteElem = this.q("note-header")
  private headerElem = this.q("h1 span")
  private bodyElem = this.q("p")
  constructor() {
    super(false)
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
    return this.bodyElem.html(to)
  }

  public pug(): string {
    return require("./textBlob.pug").default
  }
  stl() {
    return super.stl() + require("./textBlob.css").toString()
  }
  
}

declareComponent("text-blob", TextBlob)
