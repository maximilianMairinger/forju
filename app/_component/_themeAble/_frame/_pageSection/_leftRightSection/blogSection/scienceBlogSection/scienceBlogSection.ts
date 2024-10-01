import declareComponent from "../../../../../../../lib/declareComponent"
import SpikeShadowIcon from "../../../../../../_icon/spikeShadowIcon/spikeShadowIcon"
import BlogSection from "../blogSection"

export default class ScienceBlogSection extends BlogSection {


  constructor() {
    super({
      blogTag: "scienceBlog",
      note: "UNSER",
      header: "Science Blog",
      text: "Unser Blog präsentiert fesselnde, topaktuelle und leicht verständliche Inhalte, die darauf abzielen, das Interesse und die Neugierde der jungen Leserschaft zu wecken und Jugendliche zu inspirieren.",
      btns: [
        { text: "Instagram", link: "https://www.instagram.com/forju.at/" },
        { text: "Facebook", link: "https://www.facebook.com/people/ForJu-Verein-der-Forschenden-Jugend/61556404965389/" }
      ]
    })

    this.componentBody.prepend(new SpikeShadowIcon().addClass("a"))
  }

  stl() {
    return super.stl() + require("./scienceBlogSection.css").toString()
  }
}

declareComponent("c-science-blog-section", ScienceBlogSection)
