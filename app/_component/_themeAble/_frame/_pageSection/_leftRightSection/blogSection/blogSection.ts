import declareComponent from "../../../../../../lib/declareComponent"
import UiButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton";
import LeftRightSection from "../leftRightSection"
import "./../../../../link/link"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { ghostApi } from "../../../../../../lib/ghostApi"
import ParallaxImgCard from "../../../../../parallaxImgCard/parallaxImgCard";
import RippleButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton"

export default class BlogSection extends LeftRightSection {
  protected body: BodyTypes

  constructor() {
    super(1010);




    (async () => {
      const blogs = await ghostApi.posts.browse({
        formats: "html",
        limit: 15,
        filter: "tag:forju+tag:scienceBlog",
        include: "authors"
      })

      this.body.scrollBody.innerHTML = ""

      for (let i = 0; i < 10; i++) {
        for (const blog of blogs) {
          console.log(blog.title)
          const card = new ParallaxImgCard()
          card.imgSrc(blog.feature_image)
          card.heading(blog.title)
          card.desc(blog.excerpt)
  
          const btn = new RippleButton()
          btn.link(`blog/${blog.slug}`)
          this.styleRippleButton(btn)
          btn.append(card)
          this.body.scrollBody.append(btn)
        }
      }
      
    })()
  }

  styleRippleButton(btn: UiButton) {
    btn.userFeedbackMode({
      ripple: false,
      hover: false,
      focus: true,
      preHover: false
    })

    btn.button.on("focus", () => {
      this.body.scrollBody.scrollToElem(btn)
    })
  }


  stl() {
    return super.stl() + require("./blogSection.css").toString()
  }
  pug() {
    return require("./blogSection.pug").default
  }
}

declareComponent("c-blog-section", BlogSection)
