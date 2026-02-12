import declareComponent from "../../../../../../lib/declareComponent"
import BlogSection from "../blogSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import * as domain from "./../../../../../../lib/domain"
import Image from "../../../../../image/image"

import GhostContentAPI, { PostOrPage } from '@tryghost/content-api'
import { lang } from "../../../../../../lib/lang"
import { Data, ReadonlyData } from "josm";
import { ghostApi } from "../../../../../../lib/ghostApi";
import "../../../../link/link"
import "../../../../../image/image"
import "../../../../textBlob/textBlob"
import "../../../../../parallax/parallax"
import TextBlob from "../../../../textBlob/textBlob"
import AT from "../../../../../../lib/formatTime"
import PersonCircle from "../../../../../personCircle/personCircle"
import keyIndex, { memoize } from "key-index"
import { loadRecord } from "../../../frame"
import Parallax from "../../../../../parallax/parallax"
import { parseEscapedValues } from "../../../../../../lib/txtParse"
import { ResablePromise } from "more-proms";

const parallaxLength = 100

const importGridInteractAndCss = memoize(() => Promise.all([import("gridjs").then(({ Grid }) => Grid), import("./gridjsStyles")]))
const importAudioCss = memoize(() => import("./audioPlayerStyles"))
const importGhostInteractivity = memoize(() => import("./ghostInteractivity").then(e => e.default))
const importAccordionCss = memoize(() => import("./accordionStyles"))



function parseContentHTML(html: string) {

  html = html ?? ""


  html = html
    //@ts-ignore
    .replaceAll("'", "&apos;")
    // a tag to link 
    .replaceAll(/<(?:a.*?\shref=(?:"|')(.*?)(?:"|').*?>)(.*?)<\/a>/gi, (match, link, content) => "<c-link link='" + link + "'>" + content.replace(/<\/?u>/gi, "") + "</c-link>")
    // this must be below the link parsing
    .replaceAll(/<(?:div.*?\sclass=(?:"|')(?:kg-card kg-button-card kg-align-)(.*?)(?:"|').*?>)(?:<c-link link=(?:"|'))(.*?)(?:(?:"|').*?>)(.*?)(?:<\/c-link>)(?:<\/div>)/gi, "<c-block-button link='$2' class='align-btn-$1 themed' content='$3'></c-block-button>")
    // delete imgs with empty src
    .replaceAll(/<img\s.*?src(\s|(=(""|''))).*?>(<\/img>)?/gi, "")
    // img to c-image
    .replaceAll(/<(?:img.*?\ssrc=(?:"|')(.*?)(?:"|').*?>)(.*?)(?:<\/img>)?/gi, "<c-parallax y='y'><c-image src='$1'></c-image></c-parallax>")
    // heading (but not toggle headings which contain HTML)
    .replaceAll(/<(?:h(1|2|3|4|5|6|7).*?>)(.*?)<\/h.>/gi, (match, level, content) => {
      if (match.includes('kg-toggle-heading-text')) return match;
      return `<c-text-blob class='h${level}' heading='${content}'></c-text-blob>`;
    })

  return parseEscapedValues(html)
  // console.log(html)
  // let parser = new DOMParser();
  // let htmlDOM = parser.parseFromString(html, 'text/html');
  // htmlDOM.querySelectorAll(".kg-gallery-image").forEach((img) => {
  //   let ratio = parseInt(img.childs().getAttribute("width"), 10) / parseInt(img.childs().getAttribute("height"), 10);
  //   img.css({"flex": ratio + "1 0"});
  // });

  // return (htmlDOM.firstChild as HTMLElement).innerHTML;
}



export default class GhostBlogSection extends BlogSection {
   constructor(private slug?: string) {
    super()

    // this is very chick and dirty
    if (slug !== undefined) {
      (async () => {
        await this.tryNavigate(undefined)
        this.setBlogFromQuery(slug)
      })()
    }
  }

  private parseBlogPostToHTML(slug: string, blogData: PostOrPage) {
    // let blogData: Required<PostOrPage> = {
    //   title: "My Title",
    //   published_at: new Date().toISOString(),
    //   feature_image: "https://picsum.photos/seed/picsum/500/300",
    //   html: `<h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p><h2>lel</h2><p>My Content</p><p>lelellelel ll el elle le le l</p>`,
    // } as any



    lang({ links: { [slug]: blogData.title } })

    const retArr = [] as HTMLElement[]
    const contentContainer = ce("content-inner-container").apd(parseContentHTML(blogData.html))

    let headingElem: TextBlob
    if (blogData.title && blogData.title !== "(Untitled)" && blogData.title.trim() !== "" && blogData.title.trim() !== "(Untitled)") {
      headingElem = new TextBlob()
      headingElem.addClass("h1")
      headingElem.setAttribute("popunderline", "popunderline")
      headingElem.heading(parseEscapedValues(blogData.title))
      headingElem.note(AT.formatDate(new Date(blogData.published_at)))
    }

    

    // special header section
    if (blogData.feature_image != null) {

      if (headingElem) {
        const author = new PersonCircle()
        author.src(blogData.primary_author.profile_image ?? "unknownAvatarDepthRect")
        author.heading(blogData.primary_author.name)
        author.subText(blogData.primary_author.location)
        if (blogData.primary_author.website !== undefined && blogData.primary_author.website !== null) author.link(blogData.primary_author.website)
        headingElem.text(author as any)
      }
      

      const imgElem = new Image(blogData.feature_image ?? "greenSpace")
      imgElem.addClass("title")
      const imgParallaxElem = new Parallax(parallaxLength)
      imgParallaxElem.append(imgElem)
      imgParallaxElem.y("y")
      imgParallaxElem.autoHook(this.parentElement as any)


      if (headingElem) {
        const titleContainer = ce("title-container")
        titleContainer.apd(headingElem as any, imgParallaxElem)
        retArr.push(titleContainer)
      }
      
    }
    else {
      if (headingElem) contentContainer.prepend(headingElem as any)
    }


    const headings = contentContainer.childs("c-text-blob", true)
    for (const header of headings) {
      if (header.hasClass("h1") || header.hasClass("h2")) {
        header.setAttribute("popUnderline", "popunderline")
      }
    }


    const tables = contentContainer.childs("table", true)
    if (tables.length > 0) {
      // loadRecord.content.add(() => {
        importGridInteractAndCss().then(([Grid, css]) => {
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
      // })
    }

    const audioPlayers = contentContainer.childs("div.kg-card.kg-audio-card", true)
    if (audioPlayers.length > 0) {
      audioPlayers.addClass("blogCard", "bg")
      // loadRecord.content.add(() => {
        importGhostInteractivity().then((f) => {
          f(this.body.contentContainer)
        })

        importAudioCss().then(({ css }) => {
          this.addStyle(css)
        })
      // })
    }


    const toggleCards = contentContainer.childs("div.kg-card.kg-toggle-card", true)
    if (toggleCards.length > 0) {
      toggleCards.addClass("blogCard")
      
      for (const card of toggleCards) {
        const content = card.querySelector(".kg-toggle-content")
        if (content) {
          const wrapper = document.createElement("div")
          wrapper.className = "kg-toggle-content-wrapper"
          while (content.firstChild) {
            wrapper.appendChild(content.firstChild)
          }
          content.appendChild(wrapper)
        }
      }

      // loadRecord.content.add(() => {
        importGhostInteractivity().then((f) => {
          f(this.body.contentContainer)
        })
        importAccordionCss().then(({ css }) => this.addStyle(css))
      // })
    }

    const parallaxElems = contentContainer.childs("c-parallax", true) as any as Parallax[]

    for (const parallaxElem of parallaxElems) {
      parallaxElem.autoHook(this.parentElement as any)

      parallaxElem.parallaxLength(parallaxLength)

    }

    retArr.push(contentContainer)


    return retArr
  }

  addStyle = (css) => {
    this.shadowRoot.append(ce("style").addClass("ghostCss").html(css))
  }

  // this is important for frame, so that it knows that each sub domainFragment should be treated as a unique load 
  // process with a seperate loadUid, where loadUid === domainFragment. 
  domainFragmentToLoadUid = true

  public blogContentLoaded = new ResablePromise()

  public async setBlogFromQuery(query: string) {
    this.setBlog(...this.parseBlogPostToHTML(query, this.cache.get(query)))
    this.blogContentLoaded.res()
  }


  private cache = new Map<string, PostOrPage>()

  async tryNavigationCallback(domainFragment: string) {
    if (this.slug !== undefined) domainFragment = this.slug
    const splitDomain = domainFragment.split(domain.dirString)
    const slug = splitDomain.last
    if (this.cache.has(slug)) return true
    if (this.blogContentLoaded.settled) this.blogContentLoaded = new ResablePromise()
    let blogData: PostOrPage
    try {
      blogData = await ghostApi.posts.read({ slug }, { formats: ['html'], include: ['authors'] })
    } catch (e) {
      return false
    }

    this.cache.set(slug, blogData)

    this.setBlogFromQuery(slug)

    return { slug, blogData }
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
  

  stl() {
    return super.stl() + require("./ghostBlogSection.css").toString()
  }
}

declareComponent("c-ghost-blog-section", GhostBlogSection)
