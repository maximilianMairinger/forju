import declareComponent from "../../../../../lib/declareComponent"
import { ghostApi } from "../../../../../lib/ghostApi";
import Parallax from "../../../../parallax/parallax";
import Image from "../../../../image/image";
import { getCurrentLoadRecord } from "../../frame";
import Page from "../page"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import TextBlob from "../../../textBlob/textBlob";
import { Data, DataCollection, DataSubscription } from "josm";
import AT from "../../../../../lib/formatTime";
import { probRange } from "../../../../../lib/util";
import UiButton from "../../../_focusAble/_formUi/_rippleButton/rippleButton";
import Button from "../../../_focusAble/_button/button";
import Link from "../../../link/link";
import FooterSection from "../../_pageSection/footerSection/footerSection";
import { ResablePromise } from "more-proms";
import delay from "tiny-delay";





export default class ProjectBrowsePage extends Page {
  protected body: BodyTypes

  private blogDataProm: Promise<any>

  private loadRecord = getCurrentLoadRecord()

  constructor() {
    super()

    


    const blogElemOffsetTopIndexProm = new ResablePromise<Map<Element, number>>()

    const blogDataProm = this.blogDataProm = this.loadRecord.content.add(async () => {
      const blogs = await ghostApi.posts.browse({
        formats: "html",
        limit: 15,
        filter: "tag:forju+tag:projekt",
        include: "authors"
      })
      return blogs
    }) as Promise<any>

    blogDataProm.catch(() => {
      this.body.contentContainer.childs("h1").txt("Failed to load projects, try refreshing the page.")
    })

    blogDataProm.then((blogs) => {
      this.body.contentContainer.innerHTML = ""
      this.body.contentContainer.css({
        opacity: 0,
        translateY: 30
      })


      const blogElemOffsetTopIndex = new Map<Element, number>()
      

      let toggle = true
      for (const blog of blogs) {
        toggle = !toggle
        const projContainerWrapper = ce("project-container-wrapper")
        const projContainer = ce("project-container")
        projContainerWrapper.append(projContainer)
        const btn = new Button()
        btn.link(`projects/${blog.slug}`)
        projContainer.append(btn)
        const card = new Parallax(100)
        card.setAttribute("zoomOnHover", "zoomOnHover")
        card.curDir.set("y")
        card.autoHook(this)
        
        const img = new Image(blog.feature_image ?? "greenSpace", true) // is this force even needed
        card.append(img)
        btn.append(card)

        const projTitle = new Link(blog.title)
        projTitle.eventTarget(btn)
        // projTitle.text(blog.excerpt)
        // projTitle.note(AT.formatDate(blog.published_at))
        btn.append(projTitle as any)
        
        // btn.append(projContainer)

        const offsetTop = new Data<number>()
        offsetTop.get((size) => {
          blogElemOffsetTopIndex.set(projContainer, size)
        }, false)
        this.body.contentContainer.append(projContainerWrapper)
        this.resizeDataBase()(() => {
          offsetTop.set(projContainer.getBoundingClientRect().top + (projContainer.css("translateY")))
        })
        
      }

      blogElemOffsetTopIndexProm.res(blogElemOffsetTopIndex)




      this.body.contentContainer.anim({
        opacity: 1,
        translateY: 0
      }, 1000)


      this.componentBody.apd(new FooterSection().css("opacity", 1))
    })


    this.loadRecord.full.add(async () => {
      await this.body.bg.loadAnimations()
    })


    blogElemOffsetTopIndexProm.then((blogElemOffsetTopIndex) => {
      const elemAnimMap = new Map<Element, Data<boolean>>()
      for (const elem of blogElemOffsetTopIndex.keys()) {
        const animData = new Data(false)
        elemAnimMap.set(elem, animData)
        animData.get((show) => {
          if (show) {
            elem.anim({
              translateY: 0,
              opacity: 1
            })
          }
          else {
            elem.anim({
              translateY: 30,
              opacity: 0
            })
          }
        })
      }
      const containerSize = this.resizeDataBase()()
      this.scrollData(true, "y").get((progress) => {
        for (const [ elem, elemTop ] of blogElemOffsetTopIndex.entries()) {
          const animData = elemAnimMap.get(elem)
          animData.set(progress > elemTop + 50 || elemTop < containerSize.height)
        } 
      })
    })
  }

  private initLoad = true

  protected async navigationCallback(loadId: unknown): Promise<void> {
    if (this.initLoad) {
      this.initLoad = false

      delay(600).then(() => {
        this.body.countMA.animateValueTo(57, 15).onProgress(0.9).then(() => {
          this.body.plusBtn.css({pointerEvents: "all"})
          this.body.plusBtn.anim([
            { offset: 0, opacity: 0, scale: .98, translateY: -4 },
            { offset: 1, opacity: 1, scale: 1, translateY: 0 }
          ])
        })
      })

      Promise.all([this.blogDataProm, delay(500)]).then(async ([blogs]) => {
        this.body.countProj.animateValueTo(blogs.length)
      })
    }
    
  }


  stl() {
    return super.stl() + require("./projectBrowsePage.css").toString()
  }
  pug() {
    return require("./projectBrowsePage.pug").default
  }
}

declareComponent("c-project-browse-page", ProjectBrowsePage)
