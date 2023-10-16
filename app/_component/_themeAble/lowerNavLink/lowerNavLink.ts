import ThemeAble, { Theme } from "../themeAble"
import declareComponent from "../../../lib/declareComponent"
import "./../../_themeAble/_focusAble/_button/button"
import "./../../_themeAble/_focusAble/_formUi/_rippleButton/rippleButton"
import Button from "./../../_themeAble/_focusAble/_button/button"
import HighlightAbleIcon from "../_icon/_highlightAbleIcon/highlightAbleIcon"
import lang from "./../../../lib/lang"
import { Data } from "josm"


const hightlightClassString = "highlight"


export default class LowerNavLink extends ThemeAble {
  private buttonElem = this.q("c-ripple-button") as Button
  private textElem = this.q("text-container")
  private iconContainer = this.q("icon-container")

  /**
   * @param link href; this will be used to infer the content from the current lang
   * @param icon Set icon explicitly
   * @param domainLevel domainLevel the link referes to
   * @param content override language interpolation from link
   */
  constructor(link: string, icon: HighlightAbleIcon, domainLevel?: number, content?: string | Data<string>) {
    super()

    this.buttonElem.preventOnClickFocus = true

    this.content(content)
    this.icon(icon)
    this.link(link, domainLevel)
  }

  public addActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => void>(cb: CB): CB {
    return this.buttonElem.addActivationCallback(cb)
  }

  public removeActivationCallback<CB extends (e?: MouseEvent | KeyboardEvent) => void>(cb: CB): CB {
    return this.buttonElem.removeActivationCallback(cb)
  }


  public link(link: string, domainLevel?: number): any {
    if (!this.content()) {
      let language = lang.links[link]
      if (language !== undefined) this.content(language)
      else this.content(link)
    }


    this.href(link, domainLevel)
  }

  public href(): string
  public href(href: string, domainLevel?: number): void
  public href(href?: string, domainLevel?: number): any {
    return this.buttonElem.link(href, domainLevel, false, true)
  }

  public content(): string
  public content(content: string | Data<string>): void
  public content(content: string | Data<string>): void
  public content(content?: string | Data<string>): any {
    return this.textElem.text(content as any)
  }


  private activeIconElem: HighlightAbleIcon

  public icon(icon: HighlightAbleIcon): any {
    this.activeIconElem = icon
    this.iconContainer.html(this.activeIconElem)
  }

  public highlight() {
    this.addClass(hightlightClassString)
    if (this.activeIconElem) this.activeIconElem.highlight()
  }

  public downlight() {
    this.removeClass(hightlightClassString)
    if (this.activeIconElem) this.activeIconElem.downlight()
  }


  stl() {
    return super.stl() + require("./lowerNavLink.css").toString()
  }
  pug() {
    return require("./lowerNavLink.pug").default
  }
}


declareComponent("lower-nav-link", LowerNavLink)