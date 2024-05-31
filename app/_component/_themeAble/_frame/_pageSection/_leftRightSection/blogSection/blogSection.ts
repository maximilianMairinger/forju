import declareComponent from "../../../../../../lib/declareComponent"
import UiButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton";
import LeftRightSection from "../leftRightSection"
import "./../../../../link/link"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { ghostApi } from "../../../../../../lib/ghostApi"
import ParallaxImgCard from "../../../../../parallaxImgCard/parallaxImgCard";
import RippleButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton"
import { loadRecord } from "../../../frame";

export default class BlogSection extends LeftRightSection {
  protected body: BodyTypes

  constructor() {
    super(1010);

    const filter = process.env.DEV_BUILD === "true" ? "tag:forju+tag:test+tag:test2" : "tag:forju+tag:scienceBlog"


    loadRecord.full.add(async () => {
      const blogs = await ghostApi.posts.browse({
        formats: "html",
        limit: 15,
        filter,
        include: "authors"
      })
      return blogs
    }).then((blogs) => {
      this.body.scrollBody.innerHTML = ""

      
      for (const blog of blogs) {
        const card = new ParallaxImgCard()
        card.imgSrc(blog.feature_image, true)
        card.heading(blog.title)
        card.desc(blog.excerpt)

        const btn = new RippleButton()
        btn.link(`blog/${blog.slug}`)
        this.styleRippleButton(btn);
        (btn as any).relativeScrollProg = card.relativeScrollProg.bind(card)
        btn.append(card)
        this.body.scrollBody.append(btn)
      }
    })
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
