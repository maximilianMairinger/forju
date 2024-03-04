import {declareComponent} from "../../../../../../lib/declareComponent"
import BlogPage from "../blogPage"
import * as domain from "./../../../../../../lib/domain"
import Image from "../../../../../image/image" 

import GhostContentAPI, {PostOrPage} from '@tryghost/content-api'
import {lang} from "../../../../../../lib/lang"
import {Data} from "josm";
import {api} from "../../../../../../lib/ghostApi";
import "../../../../link/link"


function parseHTML(html: string) {
  html = html
  // @ts-ignore
      .replaceAll("<a href", "<c-link link")
      .replaceAll("<\/a>", "<\/c-link>");
  let parser = new DOMParser();
  let htmlDOM = parser.parseFromString(html, 'text/html');
  htmlDOM.querySelectorAll(".kg-gallery-image").forEach((img) => {
    let ratio = parseInt(img.childs().getAttribute("width"), 10) / parseInt(img.childs().getAttribute("height"), 10);
    img.css({"flex": ratio + "1 0"});
  });
  
  return (htmlDOM.firstChild as HTMLElement).innerHTML;
}



export default class GhostBlogPage extends BlogPage {


  private blogLoaded = false;

  private async setBlog(query: string) {
    if (this.blogLoaded) {
      this.componentBody.scrollTop = 0
    }

    // let blogData: Required<PostOrPage> = {
    //   title: "My Title",
    //   published_at: new Date().toISOString(),
    //   feature_image: "https://picsum.photos/seed/picsum/500/300",
    //   html: `<h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p>`,
    // } as any

    const blogData = this.cache[query]


    lang({links: {[query]: blogData.title}})


    const imgElem = ce("img")
    imgElem.src = blogData.feature_image

    this.body.slotElem.apd(
      ce("h1").txt(blogData.title), 
      imgElem,
      parseHTML(blogData.html)
    )


    this.blogLoaded = true;
  }

  private setBlogFromUrl(id: string) {
    this.domainLevel = this.domainFrag.length

    return this.setBlog(id)
  }

  private cache: { [slug in string]: PostOrPage } = {}
  private domainFrag: string
  private splitDomain: string[]

  async tryNavigationCallback(domainFragment: string) {

    this.splitDomain = domainFragment.split(domain.dirString)
    this.domainFrag = this.splitDomain.last
    if (this.cache[this.domainFrag]) return true
    let blogData: PostOrPage
    try {
      blogData = await api.posts.read({slug: this.domainFrag}, {formats: ['html', 'plaintext']})
    } catch (e) {
      return false
    }
    this.cache[this.domainFrag] = blogData
    return true
  }

  navigationCallback() {
    return this.setBlogFromUrl(this.domainFrag)
  }

  stl() {
    return super.stl() + require("./ghostBlogPage.css").toString()
  }



}

declareComponent("ghost-blog-page", GhostBlogPage)