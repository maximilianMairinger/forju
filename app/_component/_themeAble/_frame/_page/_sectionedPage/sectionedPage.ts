import Page from "../page";
import * as domain from "./../../../../../lib/domain"
import WaapiEasing from "waapi-easing";
import { PriorityPromise, ResourcesMap } from "../../../../../lib/lazyLoad";
import PageSection from "../../_pageSection/pageSection";
import { ElementList, EventListener, ScrollData } from "extended-dom";
import { Data, DataCollection, DataSubscription } from "josm";
import { constructIndex } from "key-index"
import HightlightAbleIcon from "../../../_icon/_highlightAbleIcon/highlightAbleIcon"
import localSettings from "./../../../../../lib/localSettings"
const SyncProm = require("sync-p")








export const scrollToPadding = -120


const scrollAnimationSpeed = 1150


export type SingleAlias = AliasData | string | string[]

const easing = new WaapiEasing("ease").function


export class AliasData extends Data<string[]> {
  constructor(alias: string | string[]) {
    super(alias instanceof Array ? alias : [alias])
  }

  public set(alias: string | string[]) {
    return super.set(alias instanceof Array ? alias : [alias])
  }
}


export class ScrollProgressAlias {
  public readonly progress: Data<number>
  public readonly aliases: AliasData
  constructor(progress: number | Data<number>, alias: SingleAlias) {
    this.progress = progress instanceof Data ? progress : new Data(progress)
    this.aliases = alias instanceof AliasData ? alias : new AliasData(alias)
  }
}




export class ScrollProgressAliasIndex<Root extends string = string> {
  public readonly root: Data<Root>
  public readonly scrollProgressAliases: Readonly<ScrollProgressAlias[]>
  public readonly aliases: DataCollection<string[][]>

  constructor(root: Root | Data<Root>, scrollProgressAlias: ScrollProgressAlias | Readonly<ScrollProgressAlias[]>) {
    this.root = root instanceof Data ? root : new Data(root)
    this.scrollProgressAliases = scrollProgressAlias instanceof Array ? scrollProgressAlias : [scrollProgressAlias]
    //@ts-ignore
    this.aliases = new DataCollection(...(this.scrollProgressAliases as ScrollProgressAlias[]).Inner("aliases")) as DataCollection<string[][]>
  }

  protected buildReverseAlias(aliasReverses: ReverseAliasIndex) {
    for (let alias of this.scrollProgressAliases) {
      
      let aliasesLength = 0
      //@ts-ignore
      new DataCollection(alias.progress, alias.aliases, this.root).get((progress, aliases: string[], root) => {
        if (aliasesLength !== aliases.length)  {
          aliases.ea((alias) => {
            if (aliasReverses[alias] !== undefined) {
              (aliasReverses[alias] as any).progress.set(progress);
              (aliasReverses[alias] as any).root.set(root);
            }
            else aliasReverses[alias] = new ScrollProgressAliasIndex.Reverse(new Data(progress), new Data(root as string))
          })
        }
        else {
          aliases.ea((alias) => {
            (aliasReverses[alias] as any).progress.set(progress);
            (aliasReverses[alias] as any).root.set(root);
          })
        }
      })
      
    }
  }

  public static Reverse = class {
    constructor(public readonly progress: Data<number>, public readonly root: Data<string>) {}
  }
}

export class SimpleAlias<Root extends string = string> {
  public readonly root: Data<Root>
  public readonly aliases: AliasData

  constructor(root: Root | Data<Root>, aliases: AliasData | string | string[]) {
    this.root = root instanceof Data ? root : new Data(root)
    this.aliases = aliases instanceof AliasData ? aliases : new AliasData(aliases)
  }


  protected buildReverseAlias(aliasReverses: ReverseAliasIndex) {

    let aliasesLength = 0
    //@ts-ignore
    new DataCollection(this.aliases, this.root).get((aliases: string[], root) => {
      if (aliasesLength !== aliases.length) {
        aliases.ea((alias) => {
          aliasReverses[alias] = new SimpleAlias.Reverse(root)
        })
      }
      else {
        aliases.ea((alias) => {
          (aliasReverses[alias] as any).root = root
        })
      }
    })
  }

  
  public static Reverse = class {
    constructor(public readonly root: string) {}
  }
}

export class AliasList {
  public readonly reverseIndex: ReverseAliasIndex = {}
  public aliases: Readonly<Alias[]>
  constructor(...aliases: Readonly<Alias[]>) {
    this.aliases = aliases;

    (aliases as Alias[]).ea((alias) => {
      (alias as Alias & {buildReverseAlias(aliasReverses: ReverseAliasIndex): void}).buildReverseAlias(this.reverseIndex)
    })
  }
  public getAllAliasesByRoot(root: string) {
    return (this.aliases as Alias[]).ea((alias) => {
      if (alias.root.get() === root) return alias
    })
  }
  public aliasify(root: string) {
    let data: Data<string[]> = new Data([root])
    let al = this.getAllAliasesByRoot(root)
    if (al !== undefined) al.aliases.get((...a) => {
      let q: string[] = []
      a.ea((e) => {
        q.add(e.first)
      })
      data.set(q)
    })
    return data
  }

  public getRootOfAlias(alias: string) {
    return this.reverseIndex[alias] ? this.reverseIndex[alias].root : alias
  }
}

type ReverseAliasUnion = (InstanceType<(typeof ScrollProgressAliasIndex)["Reverse"]> | InstanceType<(typeof SimpleAlias)["Reverse"]>)
type ReverseAliasIndex = {[root: string]: ReverseAliasUnion}

export type Alias = ScrollProgressAliasIndex | SimpleAlias


type SectionIndex = {[name in Name]: HTMLElement | QuerySelector}
type Name = string
type FullSectionIndex = ResourcesMap | SectionIndex
export type QuerySelector = string





type RenderSections = {initElemIndex?: number} & {isInPos: Data<number>, wantedPos: number, dimensions: {top: number, bot: number}, rendered: Data<boolean>, section: HTMLElement, isInWantedPos: Promise<void>}[]
export default abstract class SectionedPage extends Page {
  protected readonly sectionIndex: ResourcesMap
  public readonly sectionList: Data<string[]>
  private inScrollAnimation: Data<Symbol> = new Data()

  protected scrollToSection: (to?: number, speed?: number, force?: boolean) => Promise<void>
  private scrollToSectionFunctionIndex = constructIndex((section: PageSection) => this.constructScrollTo(section))

  public abstract iconIndex: {[key: string]: HightlightAbleIcon}

  private currentSectionIdIndexStore = localSettings<number>("currentSectionIdIndex@" + this.baselink, 0)
  private localScrollPosStore = localSettings<number>("localScrollPos@" + this.baselink, 0)
  private currentSectionIdStore = localSettings<string>("currentSectionId@" + this.baselink, "") // TODO: use first section id as default?

  constructor(sectionIndex: FullSectionIndex, private baselink: string, protected sectionChangeCallback?: (section: string) => void, protected readonly sectionAliasList: AliasList = new AliasList(), protected readonly mergeIndex: {[part in string]: string} = {}) {
    super()
    
    let that = this
    this.scrollToSection = function(to?: number, speed?: number, force?: boolean) {
      if (!(this instanceof PageSection)) console.warn("Unable to scrollTo this. This is not instanceof PageSection.")
      return that.scrollToSectionFunctionIndex(this)(to, speed)
    }


    
    


    let r = this.prepSectionIndex(sectionIndex)
    this.sectionIndex = r.sectionIndex as any
    this.sectionList = r.sectionList as any
    (this.sectionList as Data<string[]>).get((e) => {
      //@ts-ignore
      this.defaultDomain = e.first
    })
  }

  private prepSectionIndex(sectionIndex: any) {
    let map: ResourcesMap

    if (sectionIndex instanceof ResourcesMap) map = sectionIndex
    else {
      map = new ResourcesMap()
      for (let name in sectionIndex) {
        let elem: any
        if (!(sectionIndex[name] instanceof HTMLElement)) elem = this.q(sectionIndex[name] as any)
        else elem = sectionIndex[name]
  
        let prom = Promise.resolve(elem)
        //@ts-ignore
        prom.priorityThen = prom.then
        //@ts-ignore
        map.set(name, prom)
      }
    }

    let dataList: Data<string[]>[] = []
    map.forEach((key, vals) => {
      let mer = this.merge(key)
      dataList.add(this.sectionAliasList.aliasify(mer))
    })

    let sectionList: Data<string[]> = new Data()
    new DataCollection(...dataList).get((...dataList) => {
      sectionList.set((dataList as any).flat().distinct())
    })

    return {sectionList, sectionIndex}
  }

  private merge(name: string) {
    return this.mergeIndex[name] ? this.mergeIndex[name] : name
  }

  private lastSectionName: string
  private activateSectionName(name: string) {
    if (this.active) {
      if (this.lastSectionName !== name) {
        if (this.sectionChangeCallback) this.sectionChangeCallback(name)
      }
      this.lastSectionName = name as string
    }
  }
  
  private activateSectionNameWithDomain(name: string) {
    this.activateSectionName(name)
    domain.set(name, this.domainLevel, false)
  }

  private curSectionProm: Promise<{ pageSection: PageSection, fragments: { rootElem: string, closeUp: string } }>
  protected currentDomainFragment: string
  private verticalOffset: number
  tryNavigationCallback(domainFragment: string) {

    domainFragment = this.merge(domainFragment)
    
    //@ts-ignore
    let fragments: {
      rootElem: string, 
      closeUp: string
    } = {}



    this.verticalOffset = scrollToPadding
    if (this.sectionAliasList.reverseIndex[domainFragment] !== undefined) {
      let reverseAlias = this.sectionAliasList.reverseIndex[domainFragment]
      let originalDomain = domainFragment
      if (reverseAlias instanceof SimpleAlias.Reverse) {
        domainFragment = reverseAlias.root
      }
      else if (reverseAlias instanceof ScrollProgressAliasIndex.Reverse) {
        domainFragment = reverseAlias.root.get()
        // this.verticalOffset += reverseAlias.progress - scrollToPadding + .5
        reverseAlias.progress.get((p) => {
          this.verticalOffset = p
        })
      }
      fragments.closeUp = originalDomain
      fragments.rootElem = domainFragment
    }
    else {
      let rootElem = this.sectionAliasList.getRootOfAlias(domainFragment)
      if (rootElem instanceof Data) rootElem = rootElem.get()
      fragments.rootElem = rootElem
      fragments.closeUp = this.sectionAliasList.aliasify(domainFragment).get().first
    }


    const m = this.sectionIndex.get(this.currentDomainFragment = domainFragment, this.currentlyActiveSectionIdIndex = this.currentSectionIdStore.get() === fragments.rootElem ? this.currentSectionIdIndexStore.get() : 0)
    this.curSectionProm = new Promise((res) => {
      if (m) m.then((pageSection) => {
        res({pageSection, fragments})
      })
      
    })


    return !!m
  }

  

  private lastLocalScrollProgressStoreSubstription: DataSubscription<[number]>
  private confirmedLastScrollProgress = 0

  async navigationCallback() {
    let resFunc: Function
    const funcProm = new Promise<void>((r) => {resFunc = r})
    let active = this.active
    let scrollAnimation: any

    this.inScrollAnimation.set(scrollAnimation = Symbol())



    let { pageSection: section, fragments } = await this.curSectionProm

    this.activateSectionName(fragments.closeUp)
    this.currentlyActiveSectionRootName = fragments.rootElem
    
    this.switchSectionElem(section)

    this.userInitedScrollEvent = false

    
    if ((section as any).showSection !== undefined) {
      const sideEffect = (section as any).showSection()
      // if (sideEffect) this.scrollDiffCompensator.diff(sideEffect)
    } 
    else section.show()
    
    let scrollToPos = section.offsetTop;




    (async () => {
      if (this.currentSectionIdStore.get() === fragments.rootElem) {
        scrollToPos += this.localScrollPosStore.get() - this.verticalOffset
        this.confirmedLastScrollProgress += this.localScrollPosStore.get()
      }

      

      if (active) {

        let ls = this.on("keydown", (e) => {
          e.stopImmediatePropagation()
        })

        await this.scroll({y: scrollToPos + this.verticalOffset}, {
          speed: scrollAnimationSpeed,
          easing
        }, false)

        ls.deactivate()
      }
      else {
        this.scrollTop = this.verticalOffset + scrollToPos
      }

  
      
      
      
      if (scrollAnimation === this.inScrollAnimation.get()) {
        this.inScrollAnimation.set(undefined)
        this.userInitedScrollEvent = true
      }

      resFunc()
    })()
    return funcProm
  }

  private unreadySectionCount = new Data(0)
  private allSectionsReady = this.unreadySectionCount.tunnel((count) => count === 0)
  private renderingSections = [] as RenderSections
  protected newSectionArrived(section: PageSection & {showSection?: () => (void | number)}, wantedPos: number) {
    const rendered = new Data(false) as Data<boolean>
    const top = section.offsetTop

    this.unreadySectionCount.set(this.unreadySectionCount.get() + 1)


    const isInPos = new Data() as Data<number>
    const isInWantedPos = new SyncProm((res) => {
      
      const s = isInPos.get((i) => {
        
        if (i === wantedPos) {
          setTimeout(() => {
            this.unreadySectionCount.set(this.unreadySectionCount.get() - 1)
            // console.log("isConfirmed", section);
            res(); 
          })
          
          s.deactivate()
        }
      }, false)
    })


    let justBeforeInWantedPosScrollPos: number
    let justBeforeInWantedPosScrollHeight: number

    isInWantedPos.then(() => {
      const scrollTop = this.scrollTop - this.componentBody.css("marginTop")
      const nextSib = section.nextSibling as HTMLElement
      let isAboveCurrent = wantedPos < this.renderingSections.initElemIndex
      
      const sectionWillTemper = isAboveCurrent && this.confirmedLastScrollProgress < 0 && nextSib && nextSib.offsetTop && nextSib.offsetTop > scrollTop && nextSib.offsetTop < scrollTop + window.innerHeight
      let sideEffect: number
      if ((section as any).showSection !== undefined) {
        const _sideEffect = section.showSection()
         
        if (_sideEffect !== undefined) {
          sideEffect = _sideEffect as any
        }
      }
      else section.show()
      
      // console.log(section.offsetTop) // This is important. It forces the section to be rendered.
      if (sideEffect) {
        lastHeight = sideEffect
      }
      else {
        lastHeight = section.offsetHeight + section.css("marginTop") + section.css("marginBottom") - lastHeight 
        if (sectionWillTemper) this.scrollTop += lastHeight
      }


      justBeforeInWantedPosScrollPos = this.scrollTop
      justBeforeInWantedPosScrollHeight = this.scrollHeight
      
      calculateDimensionsAndRender()
      compensateResizeScrollDiffFromInit(section.offsetHeight)


      let first = true
      section.on("resize", ({height}) => {
        if (first) {
          first = false
          return 
        }
        if (!this.active) return
      

        // console.log("resize", section)
        
        
        let localToken = globalToken = Symbol();
        compensateResizeScrollDiffFromRuntime(height).then(() => {
          if (localToken !== globalToken) return
          calculateDimensionsAndRender()
        })
  
  
        
      })
    })
    
    const sec = {rendered, dimensions: {top, bot: top + section.offsetHeight}, section, isInWantedPos, isInPos, wantedPos}

    if (this.renderingSections.empty) {
      this.renderingSections[wantedPos] = sec
      this.renderingSections.initElemIndex = wantedPos
      isInPos.set(wantedPos)
    }
    else {
      let last = {
        index: this.renderingSections.initElemIndex,
        el: this.renderingSections[this.renderingSections.initElemIndex]
      }
      if (wantedPos < last.index) {
        while (true) {
          last.index--
          const el = last.el = this.renderingSections[last.index]

          if (!el) {
            isInPos.set(last.index)
            this.renderingSections[last.index] = sec
            break
          }
          else {
            if (wantedPos < el.wantedPos) continue
            else {
              const reverseUpdateQueue = []
              for (let i = 1; i <= last.index; i++) {
                const prevI = i - 1
                if (!this.renderingSections[i]) continue
                const e = this.renderingSections[prevI] = this.renderingSections[i]
                reverseUpdateQueue.add(() => {e.isInPos.set(prevI)})
              }
              isInPos.set(last.index)
              this.renderingSections[last.index] = sec
              reverseUpdateQueue.reverse().Call()
              break
            }
          }
        }
      }
      else {
        while (true) {
          last.index++
          const el = last.el = this.renderingSections[last.index]

          if (!el) {
            isInPos.set(last.index)
            this.renderingSections[last.index] = sec
            break
          }
          else {
            if (wantedPos > el.wantedPos) continue
            else {
              const reverseUpdateQueue = []
              for (let i = this.renderingSections.length-2; i >= last.index; i--) {
                const nextI = i + 1
                if (!this.renderingSections[i]) continue
                const e = this.renderingSections[nextI] = this.renderingSections[i]
                reverseUpdateQueue.add(() => {e.isInPos.set(nextI)})
              }
              isInPos.set(last.index)
              this.renderingSections[last.index] = sec
              reverseUpdateQueue.reverse().Call()
              break
            }
          }
        }
      }
    }





    
    // rendered.get((rendered) => {
    //   // console.log("rendered", rendered, section)
    //   if (!rendered) section.css("containIntrinsicSize" as any, section.height() + "px")
    //   // console.log(rendered ? "visible" : "hidden", section)
    //   section.css("contentVisibility" as any, rendered ? "visible" : "hidden")
    // }, false)

    // this.calculateSectionRenderingStatus()

    let lastHeight = 0

    const constructResizeScrollCompensationFunction = (validator: (scrollTop: number) => boolean, calculateDiff: (height: number) => number) => {
      return (height: number): Promise<void> => {
        height = height + section.css("marginTop") + section.css("marginBottom")
        let diff = calculateDiff(height) 
        lastHeight = height
        const scrollTop = this.scrollTop - this.componentBody.css("marginTop")
        // only compensate diff when scrolling up and the scroll event was at least once fired by the user before
        if (validator(scrollTop)) {
          return this.scrollDiffCompensator.diff(diff)
        }
        else return new SyncProm((r) => r())
      }
    }
    const compensateResizeScrollDiffFromRuntime = constructResizeScrollCompensationFunction((scrollTop) => section.offsetTop < scrollTop, (height: number) => Math.round(height - lastHeight))
    const compensateResizeScrollDiffFromInit = constructResizeScrollCompensationFunction((scrollTop) => section.offsetTop + section.offsetHeight + section.css("marginTop") + section.css("marginBottom") <= scrollTop, (height) => {
      const max = this.scrollHeight - justBeforeInWantedPosScrollHeight
      
      if (max < 0) {
        const c = this.scrollHeight - (justBeforeInWantedPosScrollPos + this.offsetHeight)  
        return max - c
      }
      
      return Math.round(height - lastHeight)
      // return this.scrollTop - justBeforeInWantedPosScrollPos
    })





    

    const calculateDimensionsAndRender = () => {
      const releventRenderingSection = this.renderingSections.slice(this.renderingSections.indexOf(sec))
      for (const sec of releventRenderingSection) {
        if (sec === undefined) return
        const { section } = sec
        const top = section.offsetTop
        sec.dimensions.top = top
        sec.dimensions.bot = top + section.offsetHeight + section.css("marginTop") + section.css("marginBottom")
      }

      this.calculateSectionRenderingStatus(this.scrollTop, releventRenderingSection)
    }

    let globalToken: Symbol

    
    

  }

  private scrollDiffCompensator = new ScrollDiffCompensator(this)

  private sectionRenderingMargin = 0
  private calculateSectionRenderingStatus(scrollPos: number, renderingSections: RenderSections = this.renderingSections) {
    scrollPos = scrollPos + this.componentBody.css("marginTop")
    const posTop = scrollPos - this.sectionRenderingMargin
    const posBot = scrollPos + this.sectionRenderingMargin + window.innerHeight
    
    for (const s of renderingSections) {
      if (s === undefined) continue
      const { rendered, dimensions } = s
      rendered.set(dimensions.top <= posBot && dimensions.bot >= posTop)
    }
  }

  private mainIntersectionObserver: IntersectionObserver
  private currentlyActiveSectionRootName: string
  private intersectingIndex: Element[] = []
  private currentlyActiveSectionElem: PageSection
  protected currentlyActiveSectionIdIndex: number
  // private neverScrolled = true
  private initialChilds = (this.componentBody.childs(1, true) as ElementList<PageSection>)
  initialActivationCallback() {



    (() => {  
      // this.neverScrolled = false
      // const sub = this.scrollData().get(() => {
      //   if (!this.ignoreIncScrollEventForInitialScrollDetection) {
      //     this.neverScrolled = false
      //     sub.deactivate()
      //   }
      //   else this.ignoreIncScrollEventForInitialScrollDetection = false
      // }, false)


      
      for (let i = 0; i < this.initialChilds.length; i++) {
        this.newSectionArrived(this.initialChilds[i], i)
      }






      const subScrollUpdate = this.scrollData().get((p) => {
        // this.
        this.calculateSectionRenderingStatus(p)
      }, false)
      subScrollUpdate.deactivate()
      setTimeout(() => {
        this.allSectionsReady.get((rdy) => {
          if (rdy) {
            subScrollUpdate.activate(false)
          }
          else subScrollUpdate.deactivate()
        })
      })
      
    })();


    


    let globalToken: Symbol
    let aliasSubscriptions: DataSubscription<unknown[]>[] = []
    let localSegmentScrollDataIndex = constructIndex((pageSectionElement: PageSection) => constructIndex((endOfPage: "start" | "end" | "center" | number) => {
      if (endOfPage === "start") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop) as ScrollData 
      if (endOfPage === "end") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop + this.innerHeight()) as ScrollData
      if (endOfPage === "center") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop + this.innerHeight() / 2) as ScrollData
      if (typeof endOfPage === "number") return this.scrollData().tunnel(prog => prog - pageSectionElement.offsetTop + this.innerHeight() * endOfPage) as ScrollData
    }))

    // ----------->

    this.mainIntersectionObserver = new IntersectionObserver(async (c) => {
      c.ea((q) => {
        if (q.isIntersecting) { 
          if (Math.abs(0 - q.boundingClientRect.y) > Math.abs(q.rootBounds.y - q.boundingClientRect.bottom)) {
            this.intersectingIndex.inject(q.target, 0)
          }
          else {
            this.intersectingIndex.add(q.target)
          }
        }
        else {
          
          try {
            this.intersectingIndex.rmV(q.target)
          }
          catch(e) {

          }
        }
      })

      let elem = this.intersectingIndex.first as PageSection


      if (!this.inScrollAnimation.get()) {
        let myToken = globalToken = Symbol("Token")

        // TODO: Optimize look into new methods of sectionIndex; 
        this.sectionIndex.forEach(async (root, vals) => {
          for (const val of vals) {
            if ((await val) === elem) {
              if (myToken !== globalToken) return
              this.currentlyActiveSectionRootName = root
  
  
              this.switchSectionElem(elem)
  
              aliasSubscriptions.Inner("deactivate", [])
              aliasSubscriptions.clear()
  
  
              root = this.merge(root)
              let alias = this.sectionAliasList.getAllAliasesByRoot(root)
              if (alias) {
  
                if (alias instanceof SimpleAlias) {
                  let sub = new DataSubscription(alias.aliases.tunnel(aliases => aliases.first), this.activateSectionNameWithDomain.bind(this), false)
                  //@ts-ignore
                  aliasSubscriptions.add(this.inScrollAnimation.get((is) => {
                    if (is) sub.activate()
                    else sub.deactivate()
                  }))
                  aliasSubscriptions.add(sub)
                }
                else if (alias instanceof ScrollProgressAliasIndex) {
                  let currentlyTheSmallestWantedProgressTemp = Infinity
                  let currentlyTheSmallestWantedProgress = new Data(currentlyTheSmallestWantedProgressTemp)
                  //@ts-ignore
                  aliasSubscriptions.add(new DataCollection(...(alias.scrollProgressAliases as ScrollProgressAlias[]).Inner("progress")).get((...wantedProgresses) => {
                    currentlyTheSmallestWantedProgressTemp = Infinity
                    
                    wantedProgresses.ea((wantedProgress) => {
                      if (wantedProgress < currentlyTheSmallestWantedProgressTemp) currentlyTheSmallestWantedProgressTemp = wantedProgress
                    })
  
                    currentlyTheSmallestWantedProgress.set(currentlyTheSmallestWantedProgressTemp)
                  }))
  
                  let lastActiveName: Data<string> = new Data()
  
                  for (let i = 0; i < alias.scrollProgressAliases.length; i++) {
                    const q = alias.scrollProgressAliases[i] as ScrollProgressAlias
                    let nextProg: Data<number> = alias.scrollProgressAliases[i + 1] as any
                    if (nextProg === undefined) nextProg = new Data(Infinity)
                    else nextProg = (nextProg as any).progress
  
                    let isSmallest = false
                    //@ts-ignore
                    aliasSubscriptions.add(new DataCollection(currentlyTheSmallestWantedProgress, q.progress).get((smallestProg, thisProg) => {
                      isSmallest = smallestProg === thisProg
                    }))
  
                    
                    let nameData = q.aliases.tunnel(aliases => aliases.first)
  
                    let sub = new DataSubscription(new DataCollection(nameData, q.progress, nextProg, localSegmentScrollDataIndex(elem)(.4) as any as Data<number>) as any, (name: string, wantedProgress, nextProg, currentProgress) => {
                      if (isSmallest) {
                        wantedProgress = 0
                      }
                      
                      if (wantedProgress <= currentProgress && nextProg > currentProgress) {
                        lastActiveName.set(name)
                        this.activateSectionNameWithDomain(name)
                      }
                    })
                    
                    //@ts-ignore
                    aliasSubscriptions.add(sub)
                    //@ts-ignore
                    aliasSubscriptions.add(new DataCollection(lastActiveName, nameData, this.inScrollAnimation).get((currentName, name, inScrollAnimation) => {
                      let deactivate = currentName === name || inScrollAnimation
                      if (deactivate) sub.deactivate()
                      else sub.activate()
                    }))
                  }
  
                }
  
              }
              else this.activateSectionNameWithDomain(root)
  

              const notInit = !!this.lastLocalScrollProgressStoreSubstription
              if (notInit) {
                this.lastLocalScrollProgressStoreSubstription.deactivate()
                this.lastLocalScrollProgressStoreSubstription = undefined
              }
  
              // this.sectionIndex.get(root).then((elem) => {
                elem.localScrollProgressData("start").then((e) => {
                  this.lastLocalScrollProgressStoreSubstription = e.get((e) => {
                    this.localScrollPosStore.set(e)
                    // this.localScrollPosStore.set.bind(this.localScrollPosStore)
                  }, notInit)
                })
              // })
  
              
  
              
  
              this.currentSectionIdStore.set(this.currentlyActiveSectionRootName)
              this.currentSectionIdIndexStore.set(this.currentlyActiveSectionIdIndex = this.sectionIndex.getAll(root).indexOf(val))
              
              
            }
          }
        })
      }
    }, {
      threshold: 0,
      rootMargin: "-50%"
    })

    this.sectionIndex.forEach(async (key, sections: Promise<PageSection>[]) => {
      for (const section of sections) {
        let sec = await section
        sec._localScrollProgressData.forEach((prom, key) => {
          prom.res(localSegmentScrollDataIndex(sec)(key))
        })
        

        sec.localScrollProgressData = (endOfPage: "start" | "end" | "center" | number) => {
          return Promise.resolve(localSegmentScrollDataIndex(sec)(endOfPage))
        }
      }
      
    })
  }

  private customIntersectionObserver: Map<HTMLElement, EventListener> = new Map

  public async addIntersectionListener(obsElem: HTMLElement, cb: (section: PageSection) => void, threshold: number = .5) {

    let lastHit: PageSection
    let sectionIndex = await this.sectionIndex as any

    let f = async () => {
      let obs = obsElem.getBoundingClientRect();
      let ajustedHeight = obs.height * threshold
      let upperHit = obs.top + ajustedHeight
      let lowerHit = obs.bottom - ajustedHeight
      sectionIndex.forEach(async (key, elems: any) => {
        for (let elem of elems) {
          elem = await elem as PageSection
          let el = elem.getBoundingClientRect()

          
          if (el.top <= upperHit && el.bottom >= lowerHit) {
            if (lastHit !== elem) {
              cb(elem)
              lastHit = elem
            }
          }
        }
      })
    }
    this.customIntersectionObserver.set(obsElem, new EventListener(this, ["scroll", "resize"], f, this.active))
    f()
  }

  private switchSectionElem(elem: PageSection) {
    if (this.currentlyActiveSectionElem !== elem) {
      if (this.currentlyActiveSectionElem !== undefined) this.currentlyActiveSectionElem.deactivate()
      elem.activate()
      this.currentlyActiveSectionElem = elem
    }
  }

  public removeIntersectionListener(obsElem: HTMLElement) {
    this.customIntersectionObserver.get(obsElem).deactivate()
    this.customIntersectionObserver.delete(obsElem)
  }

  private constructScrollTo(section: PageSection) {
    let sectionRootName: string
    sectionRootName = this.sectionIndex.getLoadedKeyOfResource(section)
    let whileWaitingQueue = []
    

    const go = async (verticalOffset: number, speed: number, force: boolean) => {
      if (this.inScrollAnimation.get() && !force) return

      let scrollAnimation: Symbol
      this.inScrollAnimation.set(scrollAnimation = Symbol())
      this.userInitedScrollEvent = false

      let al = this.sectionAliasList.getAllAliasesByRoot(sectionRootName)
      let sectionName = sectionRootName
      if (al instanceof ScrollProgressAliasIndex) {
        let toBeScrolledPosition = section.scrollTop + verticalOffset
        for (let e of al.scrollProgressAliases) {
          if (e.progress.get() <= toBeScrolledPosition) sectionName = e.aliases.get().first
          else break
        }
      }
      else sectionName = al.aliases.get().first

      this.activateSectionName(sectionName)


      this.switchSectionElem(section)



      await this.scroll({y: section.offsetTop + verticalOffset}, {
        speed,
        easing
      }, false)

      
      

      if (scrollAnimation === this.inScrollAnimation.get()) {
        this.inScrollAnimation.set(undefined)
        this.userInitedScrollEvent = true
      }
    }

    


    return (to?: number, speed: number = scrollAnimationSpeed, force: boolean = false) => {
      return new Promise((res) => {
        let off = to !== undefined ? to : scrollToPadding
        let gogo = () => go(off, speed, force).then(res)
        if (sectionRootName === undefined) whileWaitingQueue.add(gogo)
        else gogo()
      }) as Promise<void>
    }
  }

  


  protected async activationCallback(active: boolean) {
    //@ts-ignore
    let sectionIndex: ResourcesMap = await this.sectionIndex


    if (active) {
      // let init = this.sectionAliasList.getRootOfAlias(this.domainSubscription.domain)
      // let sec = sectionIndex.get(init)
      // if (sec === undefined) return false
    
      // sec.priorityThen()
      // sec.then((e: PageSection) => {
      //   let verticalOffset = padding + e.offsetTop
      //   let ali = this.sectionAliasList.reverseIndex[this.domainSubscription.domain]
      //   if (ali) if (ali instanceof ScrollProgressAliasIndex.Reverse) verticalOffset += ali.progress - padding + .5
      //   this.componentBody.scrollBy(0, verticalOffset)
      // })
      if (this.currentlyActiveSectionElem) this.currentlyActiveSectionElem.activate()

      sectionIndex.forEach(async (key, elems: any) => {
        for (let elem of elems) {
          elem = await elem
          this.mainIntersectionObserver.observe(elem)
        }
      })
    }
    else {
      this.intersectingIndex.clear()
      this.currentlyActiveSectionElem.deactivate()
      sectionIndex.forEach(async (key, elems: any) => {
        for (let elem of elems) {
          elem = await elem
          this.mainIntersectionObserver.unobserve(elem)
        }
      })
    }
  }


  stl() {
    return super.stl() + require("./sectionedPage.css").toString()
  }
}

class ScrollDiffCompensator {
  private compensationCurrentDiff = 0
  private timoutId: any
  private scrollIdle = new Data(false)
  private pressingScrollbar = new Data(false)
  private currentDiffProm: Promise<void> & {resolve: () => void}
  private working: boolean = false

  constructor(private page: SectionedPage) {
    this.timoutId = setTimeout(() => {
      this.scrollIdle.set(true)
    }, 50)
    this.page.scrollData().get(() => {
      if (this.working) return
      this.scrollIdle.set(false)
      clearTimeout(this.timoutId)
      this.timoutId = setTimeout(() => {
        this.scrollIdle.set(true)
      }, 50)
    }, false)

    page.on("mousedown", (e) => {
      this.pressingScrollbar.set(e.pageX >= (page as any).componentBody.outerWidth())
      if (this.pressingScrollbar.get()) {
        const f = () => {
          this.pressingScrollbar.set(false)
          l1.deactivate()
          l2.deactivate()
        }
        const l1 = document.body.on("mouseup", f)
        const l2 = document.body.on("mouseleave", f)
      }
    })


    new DataCollection(this.scrollIdle, this.pressingScrollbar).get((idle, pressingScrollbar) => {
      if (idle && !pressingScrollbar && this.currentDiffProm !== undefined) this.cleanUp()
    })
  }
  public diff(diff: number) {
    
    // This is a little hacky. For some reason you cant change scrollTop while to compensate for offset while scrolling. 
    // This is why this first resolves the diff with a negative margingTop on the scrollElementParent. And later when scroll
    // is idle resolve the diff back to the scroll position.
    
    this.compensationCurrentDiff -= diff
    
    if (!this.scrollIdle.get()) {
      (this.page as any).componentBody.css("marginTop", this.compensationCurrentDiff)
      if (this.currentDiffProm === undefined) {
        let r: any
        let p = new SyncProm((resClean) => {r = resClean})
        p.resolve = r
        return this.currentDiffProm = p
      }
      else return this.currentDiffProm
    }
    else {
      this.working = true
      this.page.scrollTop -= this.compensationCurrentDiff
      this.compensationCurrentDiff = 0
      this.working = false
      return new SyncProm((r) => r())
    }

    
  }
  private cleanUp() {
    (this.page as any).componentBody.css("marginTop", 0)
    // console.log("cleaning compensation", diff)
    this.working = true
    this.page.scrollTop -= this.compensationCurrentDiff
    this.compensationCurrentDiff = 0
    this.working = false
    this.currentDiffProm.resolve()
    delete this.currentDiffProm
  }
}
