import declareComponent from "../../../../../../../lib/declareComponent"
import LazySectionedPage from "../lazySectionedPage"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import JobsLandingSection from "../../../../_pageSection/jobsLandingSection/jobsLandingSection"
import HighlightAbleIcon from "../../../../../_icon/_highlightAbleIcon/highlightAbleIcon"
import BlogPage from "../../../blogPage/blogPage";
import GhostBlogSection from "../../../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection";
import { Data } from "josm";
import delay from "tiny-delay";
import { latestLatent, ResablePromise } from "more-proms";
import { loadRecord } from "../../../../frame";
import BlobAndGlassBackground from "../../../../../../blobAndGlassBackground/blobAndGlassBackground";
import Easing from "waapi-easing";
import { range } from "../../../../../../../lib/util";
import { ElementList } from "extended-dom";
import FooterSection from "../../../../_pageSection/footerSection/footerSection";



export default class JobsPage extends LazySectionedPage {
  protected body: BodyTypes
  public iconIndex: { [key: string]: HighlightAbleIcon } = {}
  private isInitiallyToggled: Promise<boolean>

  constructor(baselink: string, sectionChangeCallback?: (section: string) => void) {
    const landingToggle: ResablePromise<Data<boolean>> = new ResablePromise()
    const blogSectionInstance: ResablePromise<GhostBlogSection> = new ResablePromise()
    const landingSectionInstance = new ResablePromise<JobsLandingSection>()
    const footerSectionInstance = new ResablePromise<FooterSection>()

    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("", 1, (jobsLandingSection: typeof JobsLandingSection) => {
          const jobsSec = new jobsLandingSection()
          landingSectionInstance.res(jobsSec)
          landingToggle.res(jobsSec.toggled)
          return jobsSec
        }), val: () => import(/* webpackChunkName: "jobsLandingSection" */"../../../../_pageSection/jobsLandingSection/jobsLandingSection")
      },
      {
        key: new Import<string, GhostBlogSection>("jobs", 10, (ghostBlogSection) => {
          const ghSec = new ghostBlogSection("jobs-forju")
          ghSec.addClass("noBg")
          blogSectionInstance.res(ghSec)
          return ghSec
        }), val: () => import("../../../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")
      },
      {
        key: new Import("contact", 1, (footerSection: typeof FooterSection) => {
          const footerSec = new footerSection()
          footerSectionInstance.res(footerSec)
          return footerSec
      }), val: () => import(/* webpackChunkName: "footerSection" */"../../../../_pageSection/footerSection/footerSection")
      }
    ), baselink, sectionChangeCallback, undefined, {
      footer: "jobs"
    })


    const bg = new BlobAndGlassBackground()

    this.shadowRoot.prepend(bg)

    const whiteBlob = ce("white-blob")
    // @ts-ignore 
    whiteBlob.css({
      aspectRatio: "1/1",
      width: 0,
      position: "absolute",
      top: "0%",
      left: "50%",
      backgroundColor: "white",
      borderRadius: "50%",
      transform: "translate(-50%, -50%)"
    })

    bg.prepend(whiteBlob)

    const turnOn = latestLatent(async () => {
      await delay(200)
    }).then(async () => {
      await whiteBlob.anim({width: 500}, {duration: 500, easing: "ease-in"})
    }).then(async () => {
      whiteBlob.css({width: 0})
      await delay(120)
    }).then(async () => {
      whiteBlob.css({width: 700})
      await delay(70)
    }).then(async () => {
      whiteBlob.css({width: 0})
      whiteBlob.anim({width: 2000}, 2000)
      
      
      await delay(200)
    }).then(async () => {
      this.css({overflow: "auto"})
      if (this.scrollTop === 0) this.scroll({y: 200}, {speed: 150, cancelOnUserInput: true})
      
      await delay(200)
    }).then(() => {
      bg.anim({backgroundColor: "rgb(244, 244, 247)"}, 1600)
    })


    this.isInitiallyToggled = landingToggle.then((landingToggle) => landingToggle.get())
    this.isInitiallyToggled.then((toggled) => {
      if (toggled) {
        this.css({overflow: "auto"})
        bg.css({backgroundColor: "rgb(244, 244, 247)"})
        whiteBlob.css({width: 2000})
      }
    })

    

    const turnOff = latestLatent(async () => {
      console.log("turn off")
      bg.anim({backgroundColor: "black"}, 500)
      whiteBlob.anim({width: 0}, 1300)
      await this.scroll({y: 0}, {speed: 1000, cancelOnUserInput: false})
    }).then(() => {
      this.css({overflow: "hidden"})
    })

    
      

    landingToggle.then((landingToggle) => {


      landingToggle.get(latestLatent((on) => {
        if (on) return turnOn()
        else return turnOff()
      }), false)
    })



    loadRecord.full.add(async () => {
      await bg.loadAnimations()
    })


    Promise.all([blogSectionInstance, landingSectionInstance, footerSectionInstance, blogSectionInstance.then((b) => b.blogContentLoaded)]).then(async ([blogSectionInstance, landingSectionInstance, footerSectionInstance]) => {
      const offsetYBlog = -500
      const animDeltaY = -20
      const scale = 0.97
      const animDur = 300


      blogSectionInstance.css({translateY: offsetYBlog})

      footerSectionInstance.css({visibility: "visible"})

      

      const blogContent = blogSectionInstance.blogContentContainer.children[0].children
      const elementsToAnim = new ElementList(...range(30).map(i => blogContent[i]).filter(el => el !== undefined))
      const forwardsAnim = latestLatent(async () => {
        // debugger
        elementsToAnim.css({opacity: 0})

        landingSectionInstance.anim([
          {offset: 0, opacity: 1, translateY: 0, scale: 1},
          {offset: 1, opacity: 0, translateY: animDeltaY, scale},
        ], {duration: animDur})
      })
      elementsToAnim.css({opacity: 0})

      

      let lastLL = forwardsAnim.then(() => delay(110))
      for (const el of elementsToAnim) {
        lastLL = lastLL.then(async () => {
          el.anim([
            {offset: 0, opacity: 0, translateY: animDeltaY, scale},
            {offset: 1, opacity: 1, translateY: 0, scale: 1}
          ], 200)
          await delay(50)
        })
      }

      
      

      const backwardsAnim = latestLatent(async () => {
        elementsToAnim.anim({opacity: 0, translateY: animDeltaY, scale}, 400)

        await delay(140)
      }).then(async () => {
        landingSectionInstance.anim([
          {offset: 0, opacity: 0, translateY: animDeltaY, scale},
          {offset: 1, opacity: 1, translateY: 0, scale: 1}
        ], {duration: animDur})
      })

      let initCall = true
      const animate = latestLatent((forwards: boolean) => {
        if (initCall) {
          initCall = false
          if (!forwards) return Promise.resolve()
        }
        console.log("animate", forwards)
        if (forwards) return forwardsAnim()
        else return backwardsAnim()
      })

      this.scrollTrigger(95, 
        () => animate(true),
        () => animate(false)
      , 25)
    })
    

  }

  navigationCallback(loadId: string): Promise<void> {
    this.isInitiallyToggled.then(async (toggled) => {
      if (!toggled) {
        await delay(0)
        this.scroll({y: 0})
      }
    })
    
    return super.navigationCallback(loadId)
  }

  // this is important for frame, so that it knows that each sub domainFragment should be treated as a unique load 
  // process with a seperate loadUid, where loadUid === domainFragment. 
  // domainFragmentToLoadUid = true

  stl() {
    return super.stl() + require("./jobsPage.css").toString()
  }
  pug() {
    return require("./jobsPage.pug").default
  }
}

declareComponent("c-jobs-page", JobsPage)
