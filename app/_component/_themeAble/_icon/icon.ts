import ThemeAble from "../themeAble";


export default abstract class Icon extends ThemeAble {
  constructor() {
    super(false)

  }
  stl() {
    return super.stl() + require("./icon.css").toString()
  }
}

