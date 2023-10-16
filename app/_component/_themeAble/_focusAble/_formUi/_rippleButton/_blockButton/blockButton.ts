import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../../lib/declareComponent";
import { Data } from "josm";


export default class BlockButton extends RippleButton {
  protected textElem = ce("button-text")
  constructor(content: string = "", onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super();

    if (onClick) this.click(onClick)
    this.content(content);
    this.moveBody.apd(this.textElem)
  }


  content(to: string | Data<string>) {
    this.textElem.text(to as any)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)