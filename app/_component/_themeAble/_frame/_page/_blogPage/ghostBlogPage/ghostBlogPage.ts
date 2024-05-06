import {declareComponent} from "../../../../../../lib/declareComponent"
import BlogPage from "../blogPage"
import * as domain from "./../../../../../../lib/domain"
import Image from "../../../../../image/image" 

import GhostContentAPI, {PostOrPage} from '@tryghost/content-api'
import {lang} from "../../../../../../lib/lang"
import {Data} from "josm";
import {ghostApi} from "../../../../../../lib/ghostApi";
import "../../../../link/link"
import "../../../../../image/image" 
import "../../../../textBlob/textBlob"
import TextBlob from "../../../../textBlob/textBlob"
import AT from "../../../../../../lib/formatTime"
import PersonCircle from "../../../../../personCircle/personCircle"
import keyIndex from "key-index"


function parseContentHTML(html: string) {
  html = html
    //@ts-ignore
    .replaceAll("'", "&apos;")
    .replaceAll(/<(?:a.*? href=(?:"|')(.*?)(?:"|').*?>)(.*?)<\/a>/gi, "<c-link link='$1'>$2</c-link>")
    .replaceAll(/<(?:img.*? src=(?:"|')(.*?)(?:"|').*?>)(.*?)<\/img>/gi, "<c-image src='$1'></c-image>")
    .replaceAll(/<(?:h(1|2|3|4|5|6|7).*?>)(.*?)<\/h.>/gi, "<c-text-blob popunderline='' class='h$1' heading='$2'></c-text-blob>")

  return html
  // console.log(html)
  // let parser = new DOMParser();
  // let htmlDOM = parser.parseFromString(html, 'text/html');
  // htmlDOM.querySelectorAll(".kg-gallery-image").forEach((img) => {
  //   let ratio = parseInt(img.childs().getAttribute("width"), 10) / parseInt(img.childs().getAttribute("height"), 10);
  //   img.css({"flex": ratio + "1 0"});
  // });
  
  // return (htmlDOM.firstChild as HTMLElement).innerHTML;
}



export default class GhostBlogPage extends BlogPage {

  private parseBlogPostToHTML(slug: string, blogData: PostOrPage) {
    // let blogData: Required<PostOrPage> = {
    //   title: "My Title",
    //   published_at: new Date().toISOString(),
    //   feature_image: "https://picsum.photos/seed/picsum/500/300",
    //   html: `<h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p>`,
    // } as any

    lang({links: {[slug]: blogData.title}})

    
    const headingElem = new TextBlob()
    headingElem.setAttribute("popunderline", "")
    headingElem.addClass("title")
    headingElem.heading(blogData.title)
    headingElem.note(AT.formatDate(new Date(blogData.published_at)))

    const author = new PersonCircle()  
    author.src(blogData.primary_author.profile_image ?? "unknownAvatarDepthRect")
    author.heading(blogData.primary_author.name)
    author.subText(blogData.primary_author.location)
    author.link(blogData.primary_author.website ?? "")
    headingElem.text(author as any)
    
    const imgElem = new Image(blogData.feature_image)
    imgElem.addClass("title")

    const titleContainer = ce("title-container")
    titleContainer.apd(headingElem as any, imgElem)

    

    this.addHooksToChilds([headingElem as any as Element, imgElem])

    return [ 
      titleContainer,
      ce("content-inner-container").apd(parseContentHTML(blogData.html))
    ]
  }
  domainFragmentToLoadUid = true

  private async setBlogFromQuery(query: string) {
    this.setBlog(...this.cache.get(query))
  }
  public domainLevel = 1
  // private allDomainFragments: string[]
  private setBlogFromUrl(id: string) {
    // this.domainLevel = this.allDomainFragments.length

    return this.setBlogFromQuery(id)
  }



  private cache = new Map<string, ReturnType<typeof this.parseBlogPostToHTML>>()
  private domainFrag: string

  async tryNavigationCallback(domainFragment: string) {
    const splitDomain = domainFragment.split(domain.dirString)
    // it is important to set this to a local variable. As two tryNavigations can be called (by preloading)
    // at the same time, and then the latent cache set would be a race condition depending on which blog 
    // loads first and who set this.domainFrag.
    const slug = this.domainFrag = splitDomain.last
    if (this.cache.has(this.domainFrag)) return true
    let blogData: PostOrPage
    try {
      blogData = await ghostApi.posts.read({slug: this.domainFrag}, {formats: ['html'], include: ['authors']})
    } catch (e) {
      return false
    }
    this.cache.set(slug, this.parseBlogPostToHTML(slug, blogData))
    return true
  }

  private loadStages = keyIndex((id: unknown) => {
    return 
  })

  public async minimalContentPaint(loadUid: string) {
    await super.minimalContentPaint(loadUid)
    console.log("load ghost", loadUid)
  }

  navigationCallback() {
    super.navigationCallback()
    return this.setBlogFromUrl(this.domainFrag)
  }

  stl() {
    return super.stl() + require("./ghostBlogPage.css").toString()
  }



}

declareComponent("ghost-blog-page", GhostBlogPage)