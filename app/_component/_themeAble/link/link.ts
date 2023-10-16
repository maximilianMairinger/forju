import declareComponent from "../../../lib/declareComponent"
import ThemeAble, { Theme } from "../themeAble";
import { Data, DataCollection, DataSubscription } from "josm"
import * as domain from "../../../lib/domain"
import delay from "delay"
// import ExternalLinkIcon from "../_icon/externalLink/externalLink"
import { Prim, EventListener } from "extended-dom";

import { PrimitiveRecord } from "../../../lib/record";

export const linkRecord = new PrimitiveRecord<{link: string, level: number}>()


export default class Link extends ThemeAble {
  private linkBodyElem = this.q("link-body")
  private aElem = this.q("a") as unknown as HTMLAnchorElement
  protected slotElem = this.sr.querySelector("slot")
  private slidyWrapper = this.q("slidy-underline-wrapper")
  private slidy = this.slidyWrapper.childs()
  // private externalIcon = new ExternalLinkIcon()

  public mouseOverAnimation?: () => void
  public mouseOutAnimation?: () => void
  public clickAnimation?: () => void

  private eventTargetLs = [] as EventListener[]

  constructor(content: string | Data<string>, link?: string | (() => void), public domainLevel: number = 0, public push: boolean = true, public notify?: boolean, underline: boolean = true, eventTarget?: Element) {
    super(false)

    // this.theme.get((to) => {
    //   this.externalIcon.theme.set(to)
    // })

    
    this.content(content)
    if (link !== null && link !== undefined) {
      if (link instanceof Function) this.addActivationListener(link)
      else this.link(link)
    }


  
    


    const observer = new MutationObserver(this.mutateChildsCb.bind(this))

    
    observer.observe(this, { attributes: false, childList: true, subtree: false });





    let ev = async (e: Event, dontSetLocation = false) => {
      let link = this.link()
      const linkIsDefined = link !== undefined && link !== null
      let meta = linkIsDefined ? domain.linkMeta(link, this.domainLevel) : null
      this.cbs.Call(e)

      if (onClickAnimationInit) {
        onClickAnimationInit()
        if (linkIsDefined) {
          if (meta.isOnOrigin) await delay(300)
          else {
            fetch(meta.href)
            await delay(500)
          }
        }
      }
      
      if (linkIsDefined) {
        if (!dontSetLocation) {
          domain.set(link, this.domainLevel, this.push, this.notify)
        }
      }
    }

    if (eventTarget === undefined) eventTarget = this.aElem as any

    const a = this.eventTargetLs
    a.add(eventTarget.on("mouseup", (e) => {
      if (e.button === 0) ev(e)
      else if (e.button === 1) ev(e, true)
    }))
    this.aElem.on("click", (e) => {
      e.preventDefault()
    })

    a.add(eventTarget.on("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") ev(e)
    }))
    

    a.add(eventTarget.on("mousedown", () => {
      this.addClass("pressed")
    }))
    a.add(eventTarget.on("mouseleave", () => {
      if (click) return
      this.removeClass("pressed")
    }))
    a.add(eventTarget.on("mouseup", () => {
      if (click) return
      this.removeClass("pressed")
    }))


    a.add(eventTarget.on("mouseenter", this.updateHref.bind(this)))
    a.add(eventTarget.on("focus", this.updateHref.bind(this)))

    
    let click: () => void

    let onClickAnimationInit: Function
    
    if (underline) {
      let inAnimation = false
      let wannaCloose = false
      let wantToAnim = false


      let mouseOver = this.mouseOverAnimation = () => {
        if (inAnimation) {
          wantToAnim = true
          wannaCloose = false
          return
        }
        inAnimation = true

        let handled = false
        delay(250).then(() => {
          if (wannaCloose && !click) {
            this.slidyWrapper.anim({width: "0%", left: "100%"}, dur).then(() => {
              this.slidyWrapper.css({left: "0%", width: "100%"})
              this.slidy.css({width: 0})
            }).then(() => {
              inAnimation = false
              if (wantToAnim) {
                wantToAnim = false
                mouseOver()
              }
            })
            wannaCloose = false
            handled = true
          }
          
        })
        delay(300).then(() => {
          if (!click) {
            if (!handled) {
              if (wannaCloose) {
                this.slidy.anim({width: "0%", left: "100%"}, dur).then(() => this.slidy.css({left: "0%"})).then(() => {
                  inAnimation = false
                  if (wantToAnim) {
                    wantToAnim = false
                    mouseOver()
                  }
                })
                wannaCloose = false
              }
              else inAnimation = false
            }
            
          }
          else {
            clickF().then(click)
          }
        })

        const dur = this.slotElem.width() / (this.slotElem.css("fontSize") / 16) * 2.5 + 100
        this.slidy.anim({width: "100%"}, dur)
      }

      let mouseOut = this.mouseOutAnimation = () => {
        const dur = this.slotElem.width() / (this.slotElem.css("fontSize") / 16) * 2.5 + 100
        if (!click) {
          wantToAnim = false
        
          if (!inAnimation) {
            inAnimation = true
            this.slidy.anim({width: "0%", left: "100%"}, dur).then(() => this.slidy.css({left: "0%"})).then(() => {
              inAnimation = false
              if (wantToAnim) {
                wantToAnim = false
                mouseOver()
              }
              if (wannaCloose) {
                wannaCloose = false
                mouseOut()
              }
            })
            wannaCloose = false
          }
          else wannaCloose = true
        }
      }

      a.add(eventTarget.on("mouseover", mouseOver))
      a.add(eventTarget.on("mouseleave", mouseOut))
      

      let clickF = (async () => {
        let oldSlidy = this.slidy
        if (oldSlidy.width() === 0) oldSlidy.css({width: "100%", height: 0})
        //@ts-ignore
        // this.aElem.css({mixBlendMode: "exclusion"})
        this.slidyWrapper.css({height: "calc(100% + .2em)", top: 0, bottom: "unset"})
        await Promise.all([
          oldSlidy.anim({height: "100%"}, 350),
          oldSlidy.anim({borderRadius: 0}, 100),
          this.slidyWrapper.anim({borderRadius: 0}, 100),
          delay(150).then(() => this.slidyWrapper.anim({height: 0}, 450))
        ])

        this.slidyWrapper.css({height: 2, bottom: "-.1em", top: "unset"})
        //@ts-ignore
        // this.aElem.css({mixBlendMode: "normal"})

        this.slidy = ce("slidy-underline")
        this.slidyWrapper.html(this.slidy)
        this.removeClass("pressed")

        inAnimation = false
        wannaCloose = false
        wannaCloose = false
        click = undefined
      })


      this.clickAnimation = onClickAnimationInit = () => {
        
        if (!inAnimation) {
          inAnimation = true
          return clickF()
        }
        else {
          return new Promise((res) => {
            click = res as any
          })
          
        }
      }
    }

  }


  

  private textNodeIndex: number
  private cummulatorListener = new DataCollection<{width: number}[]>().get((...elems) => {
    

    let preTextCummulativeWidth = 7
    for (let i = 0; i < this.textNodeIndex; i++) {
      preTextCummulativeWidth += elems[i].width
      this.curChilds[i].css({marginLeft: -preTextCummulativeWidth, paddingRight: preTextCummulativeWidth})
    }
    if (preTextCummulativeWidth === 7) preTextCummulativeWidth = 0

    let afterTextCummulativeWidth = 7
    for (let i = this.textNodeIndex; i < elems.length; i++) {
      this.curChilds[i].css({paddingLeft: afterTextCummulativeWidth, right: 0, translateX: "100%"})
      afterTextCummulativeWidth += elems[i].width
    }
    if (afterTextCummulativeWidth === 7) afterTextCummulativeWidth = 0
   

    this.linkBodyElem.css({marginLeft: preTextCummulativeWidth, marginRight: afterTextCummulativeWidth})
  }, false)


  private hasIconChilds = false
  private curChilds: HTMLElement[] = []
  private mutateChildsCb() {
    const hasIconChildsNow = this.children.length !== 0
    if (!hasIconChildsNow && !this.hasIconChilds) return
    this.hasIconChilds = hasIconChildsNow

    const childs = this.childNodes as any
    const iconsResizeDatas: Data<any>[] = []
    this.curChilds.clear()
    for (let i = 0; i < childs.length; i++) {
      
      if (childs[i] instanceof Text) {
        this.textNodeIndex = i
      }
      else {
        iconsResizeDatas.push(childs[i].resizeData() as Data<DOMRectReadOnly>)
        this.curChilds.push(childs[i])
      }
    }

    const e = new DataCollection(...iconsResizeDatas)
    // @ts-ignore
    this.cummulatorListener.data(e)

  }


  connectedCallback() {
    this.mutateChildsCb()
  }
  

  eventTarget(target: Node | "parent") {
    const el = typeof target === "string" ? this.parent() : target
    this.eventTargetLs.Inner("target", [el])
  }

  private updateHref() {
    if (!this.link()) return
    let meta = domain.linkMeta(this.link(), this.domainLevel)
    // if (!meta.isOnOrigin) this.aElem.apd(this.externalIcon)
    // else this.externalIcon.remove()
    this.aElem.href = meta.href
  }

  private _link: string = null


  link(): string
  link(to: string | {link: string, domainLevel: number}): this
  link(to: string, domainLevel?: number): this
  link(to?: string | {link: string, domainLevel: number}, domainLevel?: number): any {
    if (to) {
      if (typeof to === "object") {
        this._link = to.link
        this.domainLevel = to.domainLevel
      }
      else {
        this._link = to
        this.domainLevel = domainLevel !== undefined ? domainLevel : this.domainLevel
      }

      linkRecord.add({link: this._link, level: this.domainLevel})
      this.updateHref()
      this.addClass("active")
      return this
    }
    else if (to === null) {
      this._link = null
      if (this.cbs.empty) this.removeClass("active")
    }
    else return this._link
  }

  private cbs: ((e: Event) => void)[] = []

  public addActivationListener(listener: (e: Event) => void) {
    this.cbs.add(listener)
    this.addClass("active")
  }
  public removeActivationListener(listener: (e: Event) => void) {
    this.cbs.rmV(listener)
    if (this.cbs.empty && this._link === null) this.addClass("active")
  }

  content(): string
  content(to?: string | Data<string>): void
  content(to?: string | Data<string>): any {
    if (to !== undefined) return this.text(to as any, true, false)
    return this.text()
  }

  stl() {
    return super.stl() + require("./link.css").toString()
  }
  pug() {
    return require("./link.pug").default
  }
}

declareComponent("link", Link)
