import declareComponent from "../../../../../../lib/declareComponent"
import UiButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton";
import LeftRightSection from "../leftRightSection"
import "../../../../link/link"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { ghostApi } from "../../../../../../lib/ghostApi"
import ParallaxImgCard from "../../../../../parallaxImgCard/parallaxImgCard";
import RippleButton from "../../../../_focusAble/_formUi/_rippleButton/rippleButton"
import { loadRecord } from "../../../frame";
import BlockButton from "../../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton";

const baseTag = "forju"

export default class BlogDisplaySection extends LeftRightSection {
  protected body: BodyTypes

  constructor({ blogTag, note, header, text, btns }: { blogTag: string, note?: string, header: string, text: string, btns?: {text: string, link: string | VoidFunction}[] }) {
    super(1010);

    this.body.txtBlob.heading(header)
    this.body.txtBlob.text(text)
    if (note !== undefined) this.body.txtBlob.note(note)

    if (btns !== undefined) {
      for (const btn of btns) {
        const btnElem = new BlockButton()
        btnElem.addClass("themed")
        btnElem.content(btn.text as string)
        if (btn.link instanceof Function) btnElem.click(btn.link)
        else btnElem.link(btn.link)

        this.body.btnContainer.append(btnElem)
      }
    }

    // const filter = process.env.DEV_BUILD === "true" ? `tag:${baseTag}+tag:test` : `tag:${baseTag}+tag:${blogTag}`
    const filter = `tag:${baseTag}+tag:${blogTag}`


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
    return super.stl() + require("./blogDisplaySection.css").toString()
  }
  pug() {
    return require("./blogDisplaySection.pug").default
  }
}

declareComponent("c-blog-display-section", BlogDisplaySection)
