import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";
import { Data, DataSubscription } from "josm";




export default class TagAccent extends Icon {
  private tagElem = this.q("#tag > tspan")
  private tagDescElem = this.q("#tagDesc > tspan")

  private tagSub = new DataSubscription(new Data(""), (s) => {
    this.tagElem.html(s)
  })
  private tagDescSub = new DataSubscription(new Data(""), (s) => {
    this.tagDescElem.html(s)
  })
  constructor() {
    super()

  }

  public tag(to: string | Data<string>) {
    if (to instanceof Data) this.tagSub.data(to)
    else (this.tagSub.data() as Data<string>).set(to)
  }

  public tagDesc(to: string | Data<string>) {
    if (to instanceof Data) this.tagDescSub.data(to)
    else (this.tagDescSub.data() as Data<string>).set(to)
  }


  pug() {
    return require("./tagAccent.pug").default
  }
}

declareComponent("tag-accent", TagAccent)
