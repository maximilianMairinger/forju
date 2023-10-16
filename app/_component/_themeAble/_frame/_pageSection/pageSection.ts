import Frame from "../frame";
import { ScrollData } from "extended-dom"
import { Theme } from "../../themeAble";

type ResablePromise<T> = Promise<T> & {res(t: T): Promise<T>}

export default abstract class PageSection extends Frame {
  constructor(theme?: Theme) {
    super(theme)
    this._localScrollProgressData = new Map
  }
  public _localScrollProgressData?: Map<"end" | "start" | "center" | number, ResablePromise<ScrollData>>
  public localScrollProgressData(endOfPage: "end" | "start" | "center" | number = "start"): Promise<ScrollData> {
    if (this._localScrollProgressData.has(endOfPage)) return this._localScrollProgressData.get(endOfPage)
    else {
      let r: any
      let p = new Promise((res) => {r = res}) as ResablePromise<ScrollData>
      p.res = r
      this._localScrollProgressData.set(endOfPage, p)
      return p
    }
    
  }

  async minimalContentPaint() {
    await super.minimalContentPaint()
    this.anim({opacity: 1})
  }

  // async fullContentPaint() {
    
  // }

  // async completePaint() {
  //   await
  // }

  

  stl() {
    return super.stl() + require("./pageSection.css").toString()
  }
}