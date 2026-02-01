import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import BlogSection from "../../_pageSection/blogSection/blogSection"
import delay from "delay"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class BlogPage extends Page {
  protected body: BodyTypes

  constructor(blogSection?: BlogSection) {
    super()
    if (blogSection) {
      this.append(blogSection)
    }
  }

  private get blogSection() {
    return this.children[0] as BlogSection
  }

  async tryNavigationCallback(domainFragment: string) {
    return await this.blogSection.tryNavigate(domainFragment)
  }

  // this is important for frame, so that it knows that each sub domainFragment should be treated as a unique load 
  // process with a seperate loadUid, where loadUid === domainFragment. 
  domainFragmentToLoadUid = true


  public async minimalContentPaint(loadUid: string) {
    await this.blogSection.minimalContentPaint(loadUid)
    await super.minimalContentPaint(loadUid)
  }

  public async fullContentPaint(loadUid: string) {
    await this.blogSection.fullContentPaint(loadUid)
    await super.fullContentPaint(loadUid)
  }

  public async completePaint(loadUid: string) {
    await this.blogSection.completePaint(loadUid)
    await super.completePaint(loadUid)
  }

  // this is used for the header, the left side, how far to query the subpages for the breadcrumbs
  public domainLevel = 2

  navigationCallback(loadId: string) {
    delay(0).then(() => {
      this.scroll({y: 0})
    })
    return this.blogSection.setBlogFromQuery(loadId)
  }



  stl() {
    return super.stl() + require("./blogPage.css").toString()
  }

  pug() {
    return require("./blogPage.pug").default
  }



}

declareComponent("c-blog-page", BlogPage)