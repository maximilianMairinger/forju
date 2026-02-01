import declareComponent from "../../../../../../../lib/declareComponent"
import BlogSection from "../blogDisplaySection"

export default class PresseaussendungenBlogSection extends BlogSection {


  constructor() {
    super({
      blogTag: "presseaussendung",
      note: "AKTUELLE",
      header: "Presseaussendungen",
      text: "Hier finden Sie alle Presseaussendungen des Forju-Teams. Wir informieren Sie über aktuelle Entwicklungen und Neuigkeiten rund um unseren Verein."
    })


  }
  stl() {
    return super.stl() + require("./presseaussendungenBlogSection.css").toString()
  }
}

declareComponent("c-presseaussendungen-blog-section", PresseaussendungenBlogSection)
