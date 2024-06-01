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






// TODO: above may be reused by scrollBody

export default class ProjectBrowsePage extends Page {
  protected body: BodyTypes

  constructor() {
    super()

    loadRecord.content.add(async () => {
      const blogs = await ghostApi.posts.browse({
        formats: "html",
        limit: 15,
        filter: "tag:forju+tag:projekt+tag:test",
        include: "authors"
      })
      return blogs
    }).then((blogs) => {
      this.body.contentContainer.innerHTML = ""


            
      for (const blog of blogs) {
        const projContainer = ce("project-container")
        const card = new Parallax()
        card.setAttribute("zoomOnHover", "zoomOnHover")
        card.curDir.set("y")
        card.autoHook(this)
        
        const img = new Image(blog.feature_image ?? "greenSpace", true) // is this force even needed
        card.append(img)
        projContainer.append(card)

        const projTitle = new TextBlob()
        projTitle.heading(blog.title)
        projTitle.text(blog.excerpt)
        projTitle.note(AT.formatDate(blog.published_at))
        projContainer.append(projTitle as any)
        this.componentBody.append(projContainer)

        // const card = new ParallaxImgCard()
        // card.imgSrc(blog.feature_image, true)
        // card.heading(blog.title)
        // card.desc(blog.excerpt)

        // const btn = new RippleButton()
        // btn.link(`blog/${blog.slug}`)
        // this.styleRippleButton(btn);
        // (btn as any).relativeScrollProg = card.relativeScrollProg.bind(card)
        // btn.append(card)
        // this.body.scrollBody.append(btn)
      }
    })


    loadRecord.full.add(async () => {
      await import("./blobMove").then(({ default: blobMove }) => {
        blobMove(this)
      })
    })

  }

  stl() {
    return super.stl() + require("./projectBrowsePage.css").toString()
  }
  pug() {
    return require("./projectBrowsePage.pug").default
  }
}

declareComponent("c-project-browse-page", ProjectBrowsePage)
