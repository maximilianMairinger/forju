import declareComponent from "../../../../../lib/declareComponent"
import { ghostApi } from "../../../../../lib/ghostApi";
import Parallax from "../../../../parallax/parallax";
import Image from "../../../../image/image";
import { loadRecord } from "../../frame";
import Page from "../page"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import TextBlob from "../../../textBlob/textBlob";
import { Data, DataCollection, DataSubscription } from "josm";
import AT from "../../../../../lib/formatTime";
import { probRange } from "../../../../../lib/util";
import UiButton from "../../../_focusAble/_formUi/_rippleButton/rippleButton";
import Button from "../../../_focusAble/_button/button";
import Link from "../../../link/link";






export default class ProjectBrowsePage extends Page {
  protected body: BodyTypes

  constructor() {
    super()

    loadRecord.content.add(async () => {
      const blogs = await ghostApi.posts.browse({
        formats: "html",
        limit: 15,
        filter: "tag:forju+tag:projekt",
        include: "authors"
      })
      return blogs
    }).then((blogs) => {
      this.body.countProj.txt(blogs.length.toString())
      // todo maybe count up slowly like a rolling clock?



      this.body.contentContainer.innerHTML = ""
      this.body.contentContainer.css({
        opacity: 0,
        translateY: 30
      })


            
      for (const blog of blogs) {
        const projContainer = ce("project-container")
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

        this.body.contentContainer.append(projContainer)
      }




      this.body.contentContainer.anim({
        opacity: 1,
        translateY: 0
      }, 1000)
    })


    // loadRecord.full.add(async () => {
    //   await import("./blobMove").then(({ default: blobMove }) => {
    //     blobMove(this)
    //   })
    // })

  }

  stl() {
    return super.stl() + require("./projectBrowsePage.css").toString()
  }
  pug() {
    return require("./projectBrowsePage.pug").default
  }
}

declareComponent("c-project-browse-page", ProjectBrowsePage)
