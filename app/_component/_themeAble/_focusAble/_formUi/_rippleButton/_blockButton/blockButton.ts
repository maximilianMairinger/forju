import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../../lib/declareComponent";
import { Data } from "josm";
import { memoize } from "key-index";


export default class BlockButton extends RippleButton {
  constructor(content?: string, onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super();

    if (onClick) this.click(onClick)
    if (content !== undefined) this.content(content);
  }


  public contentElement = memoize(() => {
    const content = ce("button-content")
    this.append(content)
    return content
  })
  content(to: string | Data<string>) {
    this.contentElement().txt(to as any)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)