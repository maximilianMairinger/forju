import ThemeAble, { Theme } from "../themeAble"
import declareComponent from "../../../lib/declareComponent"
import "../../_themeAble/_focusAble/_button/button"
import Link from "../link/link"
import { ElementList } from "extended-dom"
import { lang } from "../../../lib/lang"
import delay from "delay"
import { dirString, domainIndex } from "./../../../lib/domain"
import "./../_icon/arrow/arrow"
import ArrowIcon from "./../_icon/arrow/arrow"
import Icon from "../_icon/icon"
import SlidyUnderline from "./../slidyUnderline/slidyUnderline"
import keyIndex from "key-index"
import "xtring"
import { Data } from "josm"
import Button from "../../_themeAble/_focusAble/_button/button"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"




const linkAnimationOffset = 170
const linkFadeInDuration = 800

const notTopClassName = "blurry"

const slidyLineStretchFactor = .7
const slidyLineStretchOffset = slidyLineStretchFactor / 2
const slidyLineStretchDuration = slidyLineStretchFactor * 1000



const pathDisplayHeaderMinMargin = 70




export default class Header extends ThemeAble {
  protected body: BodyTypes
  private pathDisplayElem = this.q("path-display")
  private linkContainerElem = this.q("right-content")
  private leftContent = this.q("left-content")
  private underlineElem = new SlidyUnderline
  private background = this.q("blurry-background")
  private logoIcon = this.q(".logo") as Icon

  private pathDisplayLinkIndex = keyIndex((i: number) => {
    const ls = new ElementList<ArrowIcon | Link>(new ArrowIcon, new Link("", "", undefined, true, true, false))
    this.pathDisplayElem.apd(...ls)
    return ls
  })


  private linksIndex = keyIndex((toggle: boolean) => keyIndex((i: number) => 
    new Link("", "", undefined, false, true, false)
  ))
  // private backLinkComponents: ElementList<ThemAble> = new ElementList()

  private additionalPathDisplay = this.q("additional-path-display")

  private atTheTop = new Data(true)

  private pathDisplayElementsCount = new Data(0)
  private pathDisplayEmpty = this.pathDisplayElementsCount.tunnel((c) => c === 0)
  
  private pathDisplayHeaderMargin: Data<number>
  

  
  constructor(public linksShownChangeCallback?: (linksShown: boolean, init: boolean, func: any) => void) { 
    super()
    this.linkContainerElem.apd(this.underlineElem)

    this.atTheTop.get((top) => {
      if (top) {
        this.css("pointerEvents", "none")
        this.background.removeClass(notTopClassName)
      }
      else {
        this.css("pointerEvents", "all")
        this.background.addClass(notTopClassName)
      }
    }, false)
    
    

    this.theme.get((to) => {
      // this.logoIcon.theme.set(to)

      if (!this.dontChangeDisplayTheme) this.updateThemeOfPathDisplay(to)
      if (!this.dontChangeLinksTheme) {
        this.updateThemeOfLinks(to)
        this.updateUnderlineTheme(to)
    }
    })


    
    setTimeout(() => {
      this.pathDisplayHeaderMargin = this.atTheTop.tunnel((e) => pathDisplayHeaderMinMargin + (e ? this.additionalPathDisplay.width() : 0))
      window.on("resize", this.resizeHandler.bind(this))
    });
    

    delay(0).then(() => {
      this.logoIcon.anim({opacity: 1}, 400);
    });
    



    


    (() => {
      let globalSym: Symbol
      this.atTheTop.get((show) => {
        let localSym = globalSym = Symbol()
        if (show) {
          this.additionalPathDisplay.anim({translateY: .1, scale: 1, opacity: 1}, 200)
        }
        else {
          this.additionalPathDisplay.anim({translateY: 5, scale: .95, opacity: 0}, 200).then(() => {
            if (globalSym !== localSym) return
            this.additionalPathDisplay.css({translateY: -5})
          })
        }
      })
    })()
    
  }



  private updateThemeOfPathDisplay(to: Theme) {
    this.pathDisplayLinkIndex.forEach((v) => {
      v.Inner("theme").inner("set", [to])
    })
  }

  private updateUnderlineTheme(to: Theme) {
    this.underlineElem.theme.set(to)
  }

  private updateThemeOfLinks(to: Theme) {
    if (this.currentLinkElems) this.currentLinkElems.Inner("theme").Inner("set", [to])
  }


  private isLinkContainerCurrentlyHidden: boolean
  private initialResize = true
  private resizeHandler(q: {width: number}) {
    if (this.currentLinkElems) {
      let linksLeft: number = !this.currentLinkElems.empty ? this.currentLinkElems.first.getBoundingClientRect().left : q.width - 200
      let logo = this.pathDisplayElem.getBoundingClientRect()

      
      let margin = this.pathDisplayHeaderMargin.get() + (this.isLinkContainerCurrentlyHidden ? 25 : 0)
      if (linksLeft < logo.right + margin) {
        if (!this.isLinkContainerCurrentlyHidden) {
          this.isLinkContainerCurrentlyHidden = true
          let func: "css" | "anim" = this.initialResize ? "css" : "anim"
          this.linkContainerElem[func as any]({opacity: 0})
          this.leftContent[func as any]({marginLeft: "calc(10% + -12px)"})
          if (this.linksShownChangeCallback) this.linksShownChangeCallback(false, this.initialResize, func)
          this.initialResize = false
          this.componentBody.addClass("mobile")
        }
      }
      else {
        if (this.isLinkContainerCurrentlyHidden || this.isLinkContainerCurrentlyHidden === undefined) {
          this.isLinkContainerCurrentlyHidden = false
          let func: "css" | "anim" = this.initialResize ? "css" : "anim"
          this.linkContainerElem[func as any]({opacity: 1})
          this.leftContent[func as any]({marginLeft: "6%"})
          if (this.linksShownChangeCallback) this.linksShownChangeCallback(true, this.initialResize, func)
          this.initialResize = false
          this.componentBody.removeClass("mobile")
        }
      }
    }
  }


  public onTop() {
    this.atTheTop.set(true)
  }

  public notTop() {
    this.atTheTop.set(false)
  }



  public updatePage(linkContents: string[], domainLevel: number) {
    return Promise.all([
      this.updateLinks(linkContents, domainLevel),
      this.updatePathDisplay(domainLevel)
    ])
  }

  private dontChangeDisplayTheme = false
  private lastDomainIndex: string[] = []
  private lastDomainLevel = 0
  public async updatePathDisplay (domainLevel: number) {
    this.dontChangeDisplayTheme = true

    let max: number
    let toBeChanged = []
    let lvl = Math.max(domainLevel, this.lastDomainLevel)
    let curDomainIndex = [...domainIndex]
    curDomainIndex.splice(domainLevel)

    for (max = 0; max < lvl; max++) {
      if (this.lastDomainIndex[max] !== curDomainIndex[max]) {
        toBeChanged.add(max)
      }
    }

    let beChangedIndex = 0
    let fadeOutElems = new ElementList
    let fadeInElems = new ElementList

    //@ts-ignore
    this.pathDisplayLinkIndex(this.lastDomainLevel).last.push = true
    this.lastDomainLevel = domainLevel

    let elems: ElementList
    for (let i = toBeChanged.first; i < lvl; i++) {
      elems = this.pathDisplayLinkIndex(i)
      if (this.lastDomainIndex[i] !== undefined) fadeOutElems.add(...elems)
      if (i === toBeChanged[beChangedIndex] && curDomainIndex[i] !== undefined) {
        
        const linkElem = elems[1] as Link
        linkElem.domainLevel = i
        linkElem.content(lang.links[curDomainIndex[i]] !== undefined ? lang.links[curDomainIndex[i]] : curDomainIndex[i].capitalize())
        linkElem.link(curDomainIndex[i])
      }
      if (curDomainIndex[i] !== undefined) fadeInElems.add(...elems)
      beChangedIndex++
    }
    //@ts-ignore
    if (elems) elems.last.push = false

    let fadeoutProms = []
    if (!fadeOutElems.empty) {
      const elems = new ElementList(...fadeOutElems.reverse())
      fadeoutProms.add(elems.anim({translateX: 5, opacity: 0}, 250, 100).then(() => {
        elems.hide()
      }))
      await delay(250)
    }
    let fadeoutProm = Promise.all(fadeoutProms)
    fadeoutProm.then(() => {
      this.resizeHandler({width: this.clientWidth})
    })

    if (!fadeInElems.empty) fadeInElems.css({display: "block", translateX: -5}).anim({translateX: .1, opacity: 1}, 250, 100)

    this.pathDisplayElementsCount.set(this.pathDisplayElementsCount.get() + fadeInElems.length - fadeOutElems.length)

    this.lastDomainIndex = [...curDomainIndex]

    this.updateThemeOfPathDisplay(this.theme.get())
    this.dontChangeDisplayTheme = false

  }



  private linksUpdated = false
  private currentLinkContents: string[]
  private currentLinkElems: ElementList<Link>
  private lastAnimationWrapper: HTMLElement
  private lastSelectedElem: Link
  private fadeInAnim: Promise<void>
  private inFadeInAnim: boolean = false
  private dontChangeLinksTheme = false

  private linkNamespaceToggleBool = false

  private latestFadeRequest: Symbol
  public async updateLinks(linkContents: string[], domainLevel: number) {
    let lastLinkElems = this.currentLinkElems
    
    this.currentLinkElems = new ElementList()
    this.dontChangeLinksTheme = true

    const elementIndex = this.linksIndex(this.linkNamespaceToggleBool)

    linkContents.ea((s, i) => {
      const elem = elementIndex(i)
      elem.content(lang.links[s])
      elem.domainLevel = domainLevel
      elem.link(s)
      this.currentLinkElems.add(elem)
    })

    this.currentLinkContents = linkContents.clone()


    this.linkNamespaceToggleBool = !this.linkNamespaceToggleBool

    let fadeReq = this.latestFadeRequest = Symbol()
    if (this.inFadeInAnim) {
      await this.fadeInAnim
      if (fadeReq !== this.latestFadeRequest) {
        return
      }
    }

    this.linksUpdated = true
    this.inFadeInAnim = true
    let res: Function
    this.fadeInAnim = new Promise((r) => {
      res = r
    })
    
    let underlineFadeAnim: any

    let fadoutProm: Promise<any>
    let animationWrapper = ce("link-animation-wrapper")
    let lastAnimationWrapper = this.lastAnimationWrapper
    this.linkContainerElem.apd(animationWrapper)
    let lastLength: number

    if (lastLinkElems) {
      window.off("resize", this.resizeFn)
      let currentX = this.underlineElem.css("translateX")
      const baseDuration = 500
      let del = lastLinkElems.indexOf(this.lastSelectedElem) * (linkAnimationOffset / 2)
      let duration = del + baseDuration
      underlineFadeAnim = Promise.all([
        this.underlineElem.anim({opacity: 0}, duration),
        this.underlineElem.anim({marginLeft: 17}, duration).then(() => this.underlineElem.css({marginLeft: 0})),
        delay(del).then(() => this.underlineElem.anim({translateX: currentX + 3}, baseDuration))
      ])



      lastLength = lastLinkElems.length
      fadoutProm =  Promise.all([
        lastAnimationWrapper.anim({translateX: 17}, (linkFadeInDuration + (lastLength-1) * linkAnimationOffset) / 2),
        lastLinkElems.anim({opacity: 0, translateX: 3}, (linkFadeInDuration) / 2, linkAnimationOffset / 2)
      ]).then(() => {
        lastAnimationWrapper.remove()
      })
      
    }
    else lastLength = 0

    

    this.lastAnimationWrapper = animationWrapper


    let currentLength = this.currentLinkElems.length
    
    
    animationWrapper.apd(...this.currentLinkElems)
    
    if (this.currentLinkElems.empty) {
      this.inFadeInAnim = false
      res()
      return
    }
    
    
    await Promise.all([
      underlineFadeAnim,
      fadoutProm,
      delay(fadoutProm ? (400 + (((lastLength * linkAnimationOffset) / 2) - currentLength * linkAnimationOffset)) : 0).then(async () => {
        this.updateThemeOfLinks(this.theme.get())
        this.dontChangeLinksTheme = false

        if (fadeReq !== this.latestFadeRequest) {
          animationWrapper.remove()
          return
        }

        return Promise.all([
          animationWrapper.anim({translateX: .1}, linkFadeInDuration + (currentLength-1) * linkAnimationOffset),
          this.currentLinkElems.anim({opacity: 1, translateX: .1}, linkFadeInDuration, linkAnimationOffset)
        ])
      })
    ])

    this.inFadeInAnim = false
    res()

    if (this.callMeMaybe !== undefined) {
      this.updateSelectedLink(this.callMeMaybe)
      delete this.callMeMaybe
    }
    
  }

  private resizeFn = () => {
    let bounds = this.lastSelectedElem.getBoundingClientRect()
    this.underlineElem.css({translateX: bounds.left, width: bounds.width})
  }

  private updateLinkAnimationToken: Symbol
  private callMeMaybe: string
  
  public async updateSelectedLink(newSelected: string) {


    

    if (!this.currentLinkContents) {
      this.callMeMaybe = newSelected
      return
    }
    let index = this.currentLinkContents.indexOf(newSelected)
    while (index === -1) {
      if (newSelected === "") {
        index = 0
        break
      }
      newSelected = newSelected.substr(0, newSelected.lastIndexOf("/"))
      index = this.currentLinkContents.indexOf(newSelected)
    }

    let elem = this.currentLinkElems[index]
    if (this.lastSelectedElem === elem) return
    
    if (this.inFadeInAnim || this.linksUpdated) {
      let updateLinkToken = this.updateLinkAnimationToken = Symbol()  
      this.linksUpdated = false

      if (this.lastSelectedElem) this.lastSelectedElem.css({fontWeight: "normal"})

      this.lastSelectedElem = elem
      elem.css({fontWeight: "bold"})

      while (this.inFadeInAnim) {
        await this.fadeInAnim
      }

      if (updateLinkToken !== this.updateLinkAnimationToken) return

      let bounds = elem.getBoundingClientRect()
      this.underlineElem.css({translateX: bounds.left, width: bounds.width})
      window.on("resize", this.resizeFn)

      this.updateUnderlineTheme(this.theme.get())
      await this.underlineElem.anim({opacity: 1}, 700)

    }
    else {
      let thisBounds = elem.getBoundingClientRect()
      let lastBounds = this.lastSelectedElem.getBoundingClientRect()
      
      if (this.lastSelectedElem) this.lastSelectedElem.css({fontWeight: "normal"})

      this.lastSelectedElem = elem
      elem.css({fontWeight: "bold"})

      if (thisBounds.left < lastBounds.left) {
        let width = (lastBounds.right - thisBounds.left) * slidyLineStretchFactor
        await this.underlineElem.anim([
          {translateX: thisBounds.left, width, offset: 1 - slidyLineStretchOffset}, 
          {translateX: thisBounds.left, width: thisBounds.width}
        ], slidyLineStretchDuration)  
      }
      else {
        let width = (thisBounds.right - lastBounds.left) * slidyLineStretchFactor
        await this.underlineElem.anim([
          {translateX: lastBounds.left, width, offset: slidyLineStretchOffset}, 
          {translateX: thisBounds.left, width: thisBounds.width}
        ], slidyLineStretchDuration)
      }
    }
  
  }

  

  stl() {
    return super.stl() + require("./header.css").toString()
  }
  pug() {
    return require("./header.pug").default
  }
}
declareComponent("header", Header)
