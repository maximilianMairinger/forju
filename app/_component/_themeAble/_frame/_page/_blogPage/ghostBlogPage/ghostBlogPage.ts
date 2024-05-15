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
import { Grid } from "gridjs"
import keyIndex, { memoize } from "key-index"
import { loadRecord } from "../../../frame"

const importGridJs = memoize(() => Promise.all([import("gridjs").then(({Grid}) => Grid), import("./gridjsStyles")]))
const importAudioJs = memoize(() => Promise.all([import("./audioPlayerJs").then(({default: audioPlayer}) => audioPlayer), import("./audioPlayerStyles")]))

function parseContentHTML(html: string) {
  
  html = html
    //@ts-ignore
    .replaceAll("'", "&apos;")
    // a tag to link 
    .replaceAll(/<(?:a.*?\shref=(?:"|')(.*?)(?:"|').*?>)(.*?)<\/a>/gi, "<c-link link='$1'>$2</c-link>")
    // this must be below the link parsing
    .replaceAll(/<(?:div.*?\sclass=(?:"|')(?:kg-card kg-button-card kg-align-)(.*?)(?:"|').*?>)(?:<c-link link=(?:"|'))(.*?)(?:(?:"|').*?>)(.*?)(?:<\/c-link>)(?:<\/div>)/gi, "<c-block-button link='$2' class='align-btn-$1 themed' content='$3'></c-block-button>")
    // delete imgs with empty src
    .replaceAll(/<img\s.*?src(\s|(=(""|''))).*?>(<\/img>)?/gi, "") 
    // img to c-image
    .replaceAll(/<(?:img.*?\ssrc=(?:"|')(.*?)(?:"|').*?>)(.*?)(?:<\/img>)?/gi, "<c-image src='$1'></c-image>")
    // heading
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

    const contentContainer = ce("content-inner-container").apd(parseContentHTML(blogData.html))

    const tables = contentContainer.childs("table", true)
    if (tables.length > 0) {
      loadRecord.content.add(() => {
        importGridJs().then(([ Grid, css ]) => {
          this.addStyle(css)
  
  
          for (const table of tables) {
          
            const grid = new Grid({
              from: table as HTMLElement,
              sort: true
            })
            const tableContainer = ce("table-container")
            tableContainer.addClass("blogCard", "bg")
            grid.render(tableContainer)
            
            contentContainer.insertAfter(tableContainer, table)
            table.remove()
          } 
        })
      })
    }

    const audioPlayers = contentContainer.childs("div.kg-card.kg-audio-card", true)
    if (audioPlayers.length > 0) {
      audioPlayers.addClass("blogCard", "bg")
      loadRecord.content.add(() => {
        importAudioJs().then(([ f, css ]) => {
          // debugger
          this.addStyle(css)
          f(this.body.contentContainer)
        })
      })
    }

    


    this.addHooksToChilds([...titleContainer.children, ...contentContainer.children])



    return [ 
      titleContainer,
      contentContainer
    ]
  }

  addStyle = keyIndex(({css}) => {
    this.shadowRoot.append(ce("style").addClass("gridJsCss").html(css))
  })
  // this is important for frame, so that it knows that each sub domainFragment should be treated as a unique load 
  // process with a seperate loadUid, where loadUid === domainFragment. 
  domainFragmentToLoadUid = true

  private async setBlogFromQuery(query: string) {
    this.setBlog(...this.cache.get(query))
  }
  public domainLevel = 2


  private cache = new Map<string, ReturnType<typeof this.parseBlogPostToHTML>>()
  private domainFrag: string

  async tryNavigationCallback(domainFragment: string) {
    const splitDomain = domainFragment.split(domain.dirString)
    const slug = splitDomain.last
    if (this.cache.has(this.domainFrag)) return true
    let blogData: PostOrPage
    try {
      blogData = await ghostApi.posts.read({ slug }, {formats: ['html'], include: ['authors']})
    } catch (e) {
      return false
    }
    
    return {slug, blogData}
  }
  
  attachStructureCallback({blogData, slug}: {blogData: PostOrPage, slug: string}) {
    this.cache.set(slug, this.parseBlogPostToHTML(slug, blogData))
  }


  public async minimalContentPaint(loadUid: string) {
    await super.minimalContentPaint(loadUid)
  }

  public async fullContentPaint(loadUid: string) {
    await super.fullContentPaint(loadUid)
  }

  public async completePaint(loadUid: string) {
    await super.completePaint(loadUid)
  }

  navigationCallback(loadId: string) {
    super.navigationCallback(loadId)
    return this.setBlogFromQuery(loadId)
  }

  stl() {
    return super.stl() + require("./ghostBlogPage.css").toString()
  }



}

declareComponent("ghost-blog-page", GhostBlogPage)