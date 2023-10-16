import { Data, DataCollection } from "josm";
import declareComponent from "../../../../../../lib/declareComponent";
import EditAble from "../editAble";

export default class Input extends EditAble {
  constructor(placeholder?: string) {
    super(ce("input"), placeholder)


    this.placeholderContainer.prepend(ce("left-gradient"), ce("right-gradient"))

    
    setTimeout(() => {
      // wait till styles get applied. So that scrollData can access correct overflow direction with getComputedStyle
      const scrollStart = this.inputElem.scrollData().tunnel((p) => p === 0) as Data<boolean>
      scrollStart.get((is) => {
        this.componentBody[is ? "addClass" : "removeClass"]("scrollStart")
      })
  
      const scrollEnd = this.inputElem.scrollData(true).tunnel((p) => p >= this.inputElem.scrollWidth -1) as Data<boolean>
      scrollEnd.get((is) => {
        this.componentBody[is ? "addClass" : "removeClass"]("scrollEnd")
      })
    })
    
  }
  public pug(): string {
    return super.pug() + require("./input.pug").default
  }
  stl() {
    return super.stl() + require("./input.css").toString()
  }
  
}

declareComponent("input", Input)
