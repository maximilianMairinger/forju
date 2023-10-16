import ThemeAble, { Theme } from "../themeAble"
import declareComponent from "../../../lib/declareComponent"
import { ElementList } from "extended-dom"
import LowerNavLink from "./../lowerNavLink/lowerNavLink"
import HighlightAbleIcon from "../_icon/_highlightAbleIcon/highlightAbleIcon"
import { Data } from "josm"


export default declareComponent("lower-nav", class LowerNav extends ThemeAble {
  private currentLinkWrapperElems: ElementList
  private currentLinkElems: ElementList<LowerNavLink>
  private backgroundContainer = this.q("background-container")
  private layers = this.backgroundContainer.childs(1, true).add(this.componentBody as Element) as any
  private slidy: Element
  public accentTheme = new Data("primary") as Data<"primary" | "secondary">

  constructor(public linkPressedCb?: Function) { 
    super()

    this.accentTheme.get((theme) => {
      this.style.setProperty("--theme", `var(--${theme}-theme)`)
    }, false)
  }

  private enableToken: Symbol
  public async enable(init: boolean, func: "css" | "anim" = init ? "css" : "anim") {
    this.enableToken = Symbol();
    (this.componentBody as HTMLElement).css({display: "flex"})
    await this.layers[func]({opacity: 1})
  }
  public async disable(init: boolean, func: "css" | "anim" = init ? "css" : "anim") {
    let token = this.enableToken = Symbol()
    let r = this.layers[func]({opacity: 0})
    if (!init) await r.then(() => {if (token === this.enableToken) this.componentBody.hide()})
  }


  public elems: {[link: string]: HighlightAbleIcon}[]
  public async updatePage(elems: {[link: string]: HighlightAbleIcon}[], domainLevel?: number) {
    if (elems.empty) return this.hide()
    this.show()
    
    this.elems = elems
    this.currentLinkWrapperElems = new ElementList()
    this.currentLinkElems = new ElementList()
    for (const link in elems) {
      let linkElem = new LowerNavLink(link, elems[link] as any as HighlightAbleIcon, domainLevel)
      linkElem.addActivationCallback(() => {
        if (this.linkPressedCb) this.linkPressedCb()
      })
      linkElem.passiveTheme()
      this.currentLinkElems.add(linkElem)
      this.currentLinkWrapperElems.add(ce("link-container").apd(linkElem))
    }


    this.componentBody.html(this.currentLinkWrapperElems)

    if (this.callMeMaybe) {
      this.updateSelectedLink(this.callMeMaybe)
      delete this.callMeMaybe
    }
  }

  private lastHighlightElem: LowerNavLink
  private initialUpdate = true
  private callMeMaybe: string
  public async updateSelectedLink(activeLink: string) {
    if (!this.elems) {
      this.callMeMaybe = activeLink
      return
    }
    const validKeys = Object.keys(this.elems)
    let index = validKeys.indexOf(activeLink)
    while (index === -1) {
      if (activeLink === "") {
        index = 0
        break
      } 
      activeLink = activeLink.substr(0, activeLink.lastIndexOf("/"))
      index = validKeys.indexOf(activeLink)
    }

    if (this.lastHighlightElem) this.lastHighlightElem.downlight()
    this.lastHighlightElem = this.currentLinkElems[index]
    if (this.lastHighlightElem === undefined) return
    this.lastHighlightElem.highlight()


    // if (index === -1) return
    // let x = 100 * index
    

    // if (this.initialUpdate) {
    //   this.slidy.css({translateX: x + "%", display: "block"})
    //   this.slidy.anim({opacity: 1})
    //   this.initialUpdate = false
    // }
    // else this.slidy.anim({translateX: x + "%"}, 600)
    

    
  }


  stl() {
    return super.stl() + require("./lowerNav.css").toString()
  }
  pug() {
    return require("./lowerNav.pug").default
  }
})
