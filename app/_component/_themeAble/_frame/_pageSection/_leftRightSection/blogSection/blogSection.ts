import declareComponent from "../../../../../../lib/declareComponent"
import UiButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton";
import LeftRightSection from "../leftRightSection"
import "./../../../../link/link"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class BlogSection extends LeftRightSection {
  protected body: BodyTypes

  constructor() {
    super(1010)

    for (const btn of this.q("c-scroll-body").childs("c-ripple-button", true)) {
      console.log(btn)
      this.styleRippleButton(btn as UiButton)
    }
  }

  styleRippleButton(btn: UiButton) {
    // debugger
    btn.userFeedbackMode({
      ripple: false,
      hover: false,
      focus: true,
      preHover: false
    })

    btn.button.on("focus", () => {
      this.body.scrollBody.scrollToElem(btn)
    })

    // const bubble = btn.children[0] as NewsBubble

    // bubble.body.link.noTabIndex()
    // bubble.body.link.eventTarget(btn)
  }


  stl() {
    return super.stl() + require("./blogSection.css").toString()
  }
  pug() {
    return require("./blogSection.pug").default
  }
}

declareComponent("c-blog-section", BlogSection)
