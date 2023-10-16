import declareComponent from "../../../lib/declareComponent"
import ThemeAble, { Theme } from "../themeAble";
import { Data } from "josm"
import Link from "../link/link"
import Icon from "../_icon/icon";


export default class IconLink extends ThemeAble {

  public linkElem: Link;
  private slotElem = this.q("slot")
  private iconElem = (this.slotElem as HTMLSlotElement).assignedNodes()[0] as Icon


  constructor(content: string | Data<string>, icon: Icon, link?: string, iconSide: "left" | "right" = "right", underline = true, eventTarget?: Element) {
    super(false)
    if (icon !== undefined) this.slotElem.apd(icon)
    
    this.linkElem = new Link(content, link, undefined, undefined, undefined, underline, eventTarget === undefined ? this : eventTarget)
    this.iconside(iconSide)
  }

  link(link: string) {
    this.linkElem.link(link)
  }
  content(to: string) {
    this.linkElem.content(to)
  }

  eventtarget(target: Node | "parent") {
    this.linkElem.eventTarget(typeof target === "string" ? this.parent() : target)
  }

  iconside(iconSide: "left" | "right") {
    if (iconSide === "left") {
      this.componentBody.insertAfter(this.linkElem, this.slotElem)
      this.linkElem.css({marginLeft: "7px", marginRight: "0px"})
      // this.iconElem.css({left: 0, right: "auto"})
    }
    else {
      this.componentBody.insertBefore(this.linkElem, this.slotElem)
      this.linkElem.css({marginLeft: "0px", marginRight: "7px"})
      // this.iconElem.css({left: "auto", right: 0})
    }
  }


  stl() {
    return super.stl() + require("./iconLink.css").toString()
  }
  pug() {
    return require("./iconLink.pug").default
  }
}

declareComponent("icon-link", IconLink)
