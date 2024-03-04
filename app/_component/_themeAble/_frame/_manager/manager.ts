import Frame from "./../frame";
import LoadingIndecator from "../../../_indicator/loadingIndicator/loadingIndicator";
import * as domain from "../../../../lib/domain";
import lazyLoad, { ImportanceMap, Import, ResourcesMap, PriorityPromise } from "../../../../lib/lazyLoad";
import SectionedPage from "../_page/_sectionedPage/sectionedPage";
import delay from "delay";
import { Theme } from "../../../_themeAble/themeAble";
import PageSection from "../_pageSection/pageSection";
import { EventListener } from "extended-dom";
import Page from "../_page/page";

import HighlightAbleIcon from "../../_icon/_highlightAbleIcon/highlightAbleIcon";
import { Data } from "josm";
import { linkRecord } from "../../link/link";
import * as isSafari from "is-safari"



/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string: string, subString: string, allowOverlapping = false) {

  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);

  var n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

  while (true) {
      pos = string.indexOf(subString, pos);
      if (pos >= 0) {
          ++n;
          pos += step;
      } else break;
  }
  return n;
}






export default abstract class Manager extends Frame {

  protected busySwaping: boolean = false;
  public currentPage: Page

  protected bod: HTMLElement;

  private wantedFrame: Page;


  private loadingElem: any;




  private resourcesMap: ResourcesMap

  constructor(private importanceMap: ImportanceMap<() => Promise<any>, any>, public domainLevel: number, private pageChangeCallback?: (page: string, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number) => void, private pushDomainDefault: boolean = true, private onScroll?: (scrollProgress: number) => void, private onUserScroll?: (scrollProgress: number, userInited: boolean) => void, public blurCallback?: Function, public preserveFocus?: boolean) {
    super(null);

    this.bod = ce("manager-body");
    this.loadingElem = new LoadingIndecator();
    
    this.bod.apd(this.loadingElem)
    this.sra(this.bod);

    this.on("keydown", (e) => {
      if (e.code === "Escape") {
        this.blur();
        if (this.blurCallback !== undefined) this.blurCallback(e);
      }
    });


    if (onUserScroll && onScroll) {
      this.scrollEventListener = new EventListener(this, "scroll", () => {
        //@ts-ignore
        let y = this.currentPage.scrollTop
        onUserScroll(y, this.currentPage.userInitedScrollEvent)
        onScroll(y)
      }, true, {passive: true})
    }
    else {
      if (onUserScroll) this.scrollEventListener = new EventListener(this, "scroll", () => {
        //@ts-ignore
        onUserScroll(this.currentPage.scrollTop, this.currentPage.userInitedScrollEvent)
      }, false, {passive: true})
      else if (onScroll) this.scrollEventListener = new EventListener(this, "scroll", () => {
        //@ts-ignore
        onScroll(this.currentPage.scrollTop)
      }, false, {passive: true})
    }

    const { resourcesMap } = lazyLoad(this.importanceMap, e => {
      this.bod.apd(e)
    })
    this.resourcesMap = resourcesMap
    this.domainSubscription = domain.get(this.domainLevel, this.setDomain.bind(this), false, "")
  }
  private async setDomain(to: string) {
    const linkRecording = linkRecord.record()
    await this.setElem(to)
    this.currentPageFullyLoaded.then(() => {
      this.preloadLinks(linkRecording())
    })
  }

  private scrollEventListener: EventListener
  private domainSubscription: domain.DomainSubscription

  private currentPageFullyLoaded: Promise<any>

  async minimalContentPaint() {
    await this.setDomain(this.domainSubscription.domain)
    await super.minimalContentPaint()
  }


  async preloadLinks(links: {link: string, level: number}[]) {
    const toBePreloadedLocally = [] as string[]
    const toBePreloadedExternally = [] as string[]
    
    for (const {link, level} of links) {
      const { href, isOnOrigin} = domain.linkMeta(link, level)
      if (isOnOrigin) {
        toBePreloadedLocally.add(href)
      }
      else toBePreloadedExternally.add(href)
      
    }

    const el = await Promise.all(toBePreloadedLocally.map(async (url) => 
      (await this.findSuitablePage(url)).pageProm.imp
    ))
    await this.importanceMap.whiteList(el, "minimalContentPaint")
    
    
    await Promise.all(toBePreloadedExternally.map((url) => fetch(url).catch(() => {})))
    
    
  }

  private lastScrollbarWidth: number


  private intersectionListenerIndex: Map<HTMLElement, {cb: (elem: Frame) => void, threshold?: number}> = new Map

  public addIntersectionListener(root: HTMLElement, cb: (elem: Frame) => void, threshold?: number) {
    this.intersectionListenerIndex.set(root, {cb, threshold})
    if (this.currentPage) {
      if (this.currentPage.addIntersectionListener) this.currentPage.addIntersectionListener(root, cb, threshold)
      else {
        cb(this.currentPage)
      }
    }
  }
  public removeIntersectionListener(root: HTMLElement) {
    this.intersectionListenerIndex.delete(root)
    if (this.currentPage) {
      if (this.currentPage.removeIntersectionListener) this.currentPage.removeIntersectionListener(root)
    }
  }

  public addThemeIntersectionListener(root: HTMLElement, cb: (theme: Data<Theme>) => void) {
    this.addIntersectionListener(root, (q) => {
      cb(q.theme)
    })
  }
  public addAccentThemeIntersectionListener(root: HTMLElement, cb: (theme: Data<"primary" | "secondary">) => void) {
    this.addIntersectionListener(root, (q) => {
      cb(q.accentTheme)
    })
  }

  public removeThemeIntersectionListener(root: Frame) {
    this.removeIntersectionListener(root)
  }

  private async canSwap(to: Page, domainFragment: string): Promise<boolean> {
    return await to.tryNavigate(domainFragment)
  }
  /**
   * Swaps to given Frame
   * @param to frame to be swaped to
   */
  private async swapFrame(to: Page): Promise<void> {
    if (this.busySwaping) {
      console.warn("was busy, unable to execute pageswap")
      // maybe retry, or cancel ...
      return 
    }
    this.busySwaping = true;
    this.loadingElem.remove();

    this.wantedFrame = to;
    let from = this.currentPage;

    
    

    if (from === to) {
      //Focus even when it is already the active frame
      if (!this.preserveFocus) to.focus()
      to.navigate()
      this.busySwaping = false
      return
    }
    

    

    to.show();
    if (!this.preserveFocus) to.focus();
    
    if (from !== undefined) from.deactivate()
    if (this.active) {
      to.navigate()
      to.activate()
    }


  
    this.currentPage = to;


    
    this.scrollEventListener.target((to as any)).activate()

    if (this.onUserScroll && this.onScroll) {
      
      let y = (this.currentPage as any).scrollTop
      this.onUserScroll(y, this.currentPage.userInitedScrollEvent)
      this.onScroll(y)
    }
    else {

      if (this.onUserScroll) {
        this.onUserScroll((this.currentPage as any).scrollTop, this.currentPage.userInitedScrollEvent)
      }
      else if (this.onScroll) this.onScroll((this.currentPage as any).scrollTop)
    }

    if (from !== undefined) if (from.removeIntersectionListener) {
      this.intersectionListenerIndex.forEach((q, elem) => {
        from.removeIntersectionListener(elem)
      })
    }
    if (to.addIntersectionListener) {
      this.intersectionListenerIndex.forEach(({cb, threshold}, elem) => {
        to.addIntersectionListener(elem, cb, threshold)
      })
    }
    else {
      this.intersectionListenerIndex.forEach(({cb}) => {
        cb(to)
      })
    }


    let showAnim = from !== undefined ? !(isSafari && domain.isInNativeUserNavigation()) ? to.anim([{zIndex: 100, opacity: 0, translateX: -5, scale: 1.005, offset: 0}, {opacity: 1, translateX: 0, scale: 1}], 400) : to.css({opacity: 1}) : to.anim([{offset: 0, opacity: 0}, {opacity: 1}], 400);


    (async () => {
      if (from === undefined) {
        await showAnim
      }
      else {

        // let fromAnim = from.anim([{offset: 0, translateX: 0}, {translateX: 10}], 3000)
        await Promise.all([showAnim as any])
  
        from.css({opacity: 0, display: "none"})
  
      }
  
  
      to.css("zIndex", 0)
      this.busySwaping = false;
      if (this.wantedFrame !== to) {
        await this.swapFrame(this.wantedFrame);
        return
      }
    })()
  }

  private currentUrl: string
  private nextPageToken: Symbol

  public element(): string
  public element(to: string, push?: boolean): void
  public element(to?: string, push: boolean = this.pushDomainDefault) {
    if (to) domain.set(to, this.domainLevel, push)
    else return this.currentUrl
  }

  private async findSuitablePage(fullDomain: string) {
    let to: any = fullDomain

    if (fullDomain.startsWith(domain.dirString)) to = to.slice(1)
    const fullDomainHasTrailingSlash = fullDomain.endsWith(domain.dirString)
    if (fullDomainHasTrailingSlash) to = to.slice(0, -1)
    

    let sucDomainFrag: string
    let sucPage: any
    let sucDomainLevel: any

    let accepted = false
    let pageProm = this.resourcesMap.get(to, 0)
    while(!accepted) {
      let nthTry = 0
      
      
      while(pageProm === undefined) {
        if (to === "") {
          const msg = "421 Misdirected request"
          document.body.html(`<b>${msg}</b>`)
          throw new Error(msg)
        }
        to = to.substr(0, to.lastIndexOf("/")) as any
        pageProm = this.resourcesMap.get(to, nthTry)
      }

      const toIsEmpty = to === ""
      let domFrag = fullDomain.slice(to.length + (toIsEmpty ? 1 : 2), fullDomainHasTrailingSlash ? -1 : undefined)
      const rootDomainFragment = domFrag
      let domainFragment: string
      const domainLevel = toIsEmpty ? 0 : (occurrences(to, "/") + 1 + this.domainLevel)
      sucDomainLevel = domainLevel

      while(pageProm !== undefined) {
        nthTry++

        let suc: boolean = await pageProm.priorityThen(async (page: Page | SectionedPage) => {
          sucPage = page
          page.domainLevel = domainLevel
          domainFragment = rootDomainFragment === "" ? page.defaultDomain : rootDomainFragment
          return await this.canSwap(page, domainFragment)
        }, false)
  
        if (suc) {
          sucDomainFrag = domainFragment
          accepted = true
          break
        }
        else {
          pageProm = this.resourcesMap.get(to, nthTry)
        }
      }
    }

    return { to, pageProm, fullDomainHasTrailingSlash, suc: {
        domain: sucDomainFrag,
        page: sucPage,
        level: sucDomainLevel
      } 
    }
  }

  private async setElem(fullDomain: string) {
    let nextPageToken = Symbol("nextPageToken")
    this.nextPageToken = nextPageToken;
    const { to, pageProm, fullDomainHasTrailingSlash, suc } = await this.findSuitablePage(fullDomain)
    if (this.nextPageToken !== nextPageToken) return
    
    this.currentPageFullyLoaded = new Promise((doneLoading) => {
      domain.set(domain.dirString + suc.domain + (fullDomainHasTrailingSlash && suc.domain !== "" ? domain.dirString : ""), suc.level, false).then(() => {

        pageProm.priorityThen(() => {
          if (this.currentUrl !== to) {
            this.currentUrl = to;
            let page = this.currentPage;
            (async () => {
              if (this.pageChangeCallback) {
                try {
                  if ((page as SectionedPage).sectionList) {
                    (page as SectionedPage).sectionList.tunnel(e => e.filter(s => s !== "")).get((sectionListNested) => {
                      let ob = {} as any
                      for (let e of sectionListNested) {
                        let ic = (page as SectionedPage).iconIndex[e]
                        while (!ic) {
                          if (e === "") break
                          e = e.substr(0, e.lastIndexOf("/"))
                          ic = (page as SectionedPage).iconIndex[e]
                        }
                        ob[e] = ic
                      }
                      
                      this.pageChangeCallback(to, ob, page.domainLevel)
                    })
                  }
                  else this.pageChangeCallback(to, [], page.domainLevel)
                }
                catch(e) {}
              }
            })()
          }
        }, "completePaint")
  
        this.swapFrame(suc.page)
      }).then(doneLoading)
    })
  }

  protected async activationCallback(active: boolean) {
    if (this.currentPage) if (this.currentPage.active !== active) this.currentPage.vate(active as any)
  }
  stl() {
    return super.stl() + require('./manager.css').toString();
  }
}