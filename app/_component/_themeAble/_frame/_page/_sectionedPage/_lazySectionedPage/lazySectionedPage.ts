import SectionedPage, { QuerySelector, AliasList, scrollToPadding } from "../sectionedPage";
import lazyLoad, { ImportanceMap, ResourcesMap } from "../../../../../../lib/lazyLoad";
import LoadingIndecator from "../../../../../_indecator/loadingIndecator/loadingIndecator";
import * as domain from "../../../../../../lib/domain";
import constructAttachToPrototype from "attatch-to-prototype";

export default abstract class LazySectionedPage extends SectionedPage {

  private resourceMap: ResourcesMap

  private loadingIndecatorBot: HTMLElement
  private loadingIndecatorTop: HTMLElement
  private importanceMap: ImportanceMap<any, any>

  constructor(sectionIndex: ImportanceMap<() => Promise<any>, any>, baselink: string, sectionChangeCallback?: (section: string) => void, sectionAliasList?: AliasList, mergeIndex?: {[part in string]: string}) {
    const { resourcesMap, importanceMap } = lazyLoad(sectionIndex, (e, ind) => {
      let priorElem: HTMLElement
      let i = ind
      do {
        i--
        priorElem = loadedElementsIndex[i]
      } while (priorElem === undefined)

      e.hide()
      this.componentBody.insertAfter(e, priorElem)
      e.showSection = () => {
        e.show()
      }
      loadedElementsIndex[ind] = e
      this.newSectionArrived(e, ind)

      
      
    })
    super(resourcesMap, baselink, sectionChangeCallback, sectionAliasList, mergeIndex)


    
    this.componentBody.apd(this.loadingIndecatorTop = ce("loading-indecator"))
    this.componentBody.apd(this.loadingIndecatorBot = ce("loading-indecator"))

    
    const loadedElementsIndex = {"-1": this.loadingIndecatorTop}
    loadedElementsIndex[sectionIndex.size] = this.loadingIndecatorBot
    const attach = constructAttachToPrototype(loadedElementsIndex)
    let i = 0
    if (sectionIndex.size > 1) {
      //@ts-ignore
      attach("0", {set: (e) => {
        attach("0", {value: e})
        const showSection = e.showSection.bind(e)
        e.showSection = () => {
          const scrollTop = this.scrollTop - this.componentBody.css("marginTop")
          showSection()
          let sideEffect = e.offsetHeight + e.css("marginTop") + e.css("marginBottom")
          if (e.offsetTop > scrollTop) this.scrollTop += sideEffect
          
          this.loadingIndecatorTop.remove()
          return sideEffect
        }
      }})
      

      const lastIndex = (sectionIndex.size - 1) + ""
      //@ts-ignore
      attach(lastIndex, {set: (e) => {
        attach(lastIndex, {value: e})
        const showSection = e.showSection.bind(e)
        e.showSection = () => {
          showSection()
          this.loadingIndecatorBot.remove()
          // console.log(e.offsetTop)
        }
      }})
      
    }
    else {
      //@ts-ignore
      attach("0", {set: (e) => {
        const showSection = e.showSection.bind(e)
        e.showSection = () => {
          showSection()          
          this.loadingIndecatorTop.remove()
          this.loadingIndecatorBot.remove()
          e.showSection = showSection
        }
        attach("0", {value: e})
      }})
    }


    this.importanceMap = importanceMap
    this.resourceMap = resourcesMap
  }
  
  async minimalContentPaint() {
    const e = await this.resourceMap.get(this.currentDomainFragment, this.currentlyActiveSectionIdIndex).priorityThen(() => {}, "minimalContentPaint")
    await super.minimalContentPaint()
  }
  


  async fullContentPaint() {
    await this.resourceMap.get(this.currentDomainFragment, this.currentlyActiveSectionIdIndex).priorityThen(() => {}, "completePaint")
    await this.importanceMap.whiteListAll("minimalContentPaint")
    await this.resourceMap.fullyLoaded  
    await super.fullContentPaint()
  }

  async completePaint() {
    await this.importanceMap.whiteListAll("completePaint")
    await super.completePaint()
  }

  

  stl() {
    return super.stl() + require("./lazySectionedPage.css").toString()
  }
}
