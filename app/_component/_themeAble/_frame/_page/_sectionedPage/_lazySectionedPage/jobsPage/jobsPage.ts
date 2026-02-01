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

export default class JobsPage extends LazySectionedPage {
  protected body: BodyTypes
  public iconIndex: { [key: string]: HighlightAbleIcon } = {}

  constructor(baselink: string, sectionChangeCallback?: (section: string) => void) {
    let landingToggle: ResablePromise<Data<boolean>> = new ResablePromise()
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("", 1, (jobsLandingSection: typeof JobsLandingSection) => {
          const jobsSec = new jobsLandingSection()
          landingToggle.res(jobsSec.toggled)
          return jobsSec
        }), val: () => import(/* webpackChunkName: "jobsLandingSection" */"../../../../_pageSection/jobsLandingSection/jobsLandingSection")
      },
      {
        key: new Import<string, GhostBlogSection>("jobs", 10, (ghostBlogSection) => {
          const ghSec = new ghostBlogSection("jobs-forju")
          ghSec.addClass("noBg")
          return ghSec
        }), val: () => import("../../../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")
      }
    ), baselink, sectionChangeCallback)


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
      await delay(400)
    }).then(async () => {
      bg.anim({backgroundColor: "rgb(244, 244, 247)"}, 1600)
      await delay(800)
      this.css({overflow: "auto"})
      if (this.scrollTop === 0) this.scroll({y: 200}, {speed: 300, cancelOnUserInput: true, easing: new Easing("ease-out").function})
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
  }

  navigationCallback(loadId: string): Promise<void> {
    delay(0).then(() => {
      this.scroll({y: 0})
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
