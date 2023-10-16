import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";

export default class SlidyUnderline extends ThemeAble {
  constructor() {
    super()
  }
  public pug(): string {
    return ""
  }
  stl() {
    return super.stl() + require("./slidyUnderline.css").toString()
  }
  
}

declareComponent("slidy-underline", SlidyUnderline)
