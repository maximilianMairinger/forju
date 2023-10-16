import { Data } from "josm";
import declareComponent from "../../../../../../lib/declareComponent";
import EditAble from "../editAble";

export default class TextArea extends EditAble {
  constructor(placeholder?: string) {
    super(ce("textarea"), placeholder)

    this.placeholderContainer.prepend(ce("placeholder-bg"), ce("placeholder-gradient"), ce("bottom-gradient"))


    const scrollStart = this.inputElem.scrollData().tunnel((p) => p === 0) as Data<boolean>
    scrollStart.get((is) => {
      this.componentBody[is ? "addClass" : "removeClass"]("scrollStart")
    })

    const scrollEnd = this.inputElem.scrollData(true).tunnel((p) => p >= this.inputElem.scrollHeight -1) as Data<boolean>
    scrollEnd.get((is) => {
      this.componentBody[is ? "addClass" : "removeClass"]("scrollEnd")
    })

    this.placeholderUp.get((up) => {
      this.componentBody[up ? "addClass" : "removeClass"]("up")
    })

  }
  public pug(): string {
    return super.pug() + require("./textArea.pug").default
  }
  stl() {
    return super.stl() + require("./textArea.css").toString()
  }
  
}

declareComponent("textarea", TextArea)
