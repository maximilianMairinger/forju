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




// Output: 0 when above view and when the bottom of element hits the top of the view, 1 when the top of the element hits the bottom of the view or when it is below
function percentageInViewPort(elem: {begin: number, size: number}, viewPort: {begin: number, size: number}) {
  // const widthWhereElemIsVis = viewPort.size + elem.size
  // const scrollProgRight = viewPort.begin + viewPort.size
  
  // return probRange((scrollProgRight - elem.begin) / widthWhereElemIsVis)


  return probRange((viewPort.begin + viewPort.size - elem.begin) / (viewPort.size + elem.size))
}

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


      const thisCurHeight = this.resizeDataBase().height
      
      
      for (const blog of blogs) {
        const projContainer = ce("project-container")
        const card = new Parallax(.9)
        card.setAttribute("zoomOnHover", "zoomOnHover")
        card.curDir.set("y")
        const cardSize = card.resizeDataBase()
        const percentInViewPort = new Data(0)
        new DataCollection(this.scrollData(false, "y"), thisCurHeight, cardSize.top, cardSize.bottom).get((scrollProg, viewPortHeight, cardTop, cardHeight) => {          
          cardTop = card.offsetTop
          
          const res = percentageInViewPort({ begin: cardTop, size: cardHeight }, { begin: scrollProg, size: viewPortHeight })
          // console.log(res)
          percentInViewPort.set(res)
        })
        percentInViewPort.get((prog) => {
          card.parallaxProgHook.set(prog)
        })
        
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
