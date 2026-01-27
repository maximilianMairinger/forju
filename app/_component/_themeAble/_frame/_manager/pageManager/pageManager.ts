import Manager from "../manager";
import {ImportanceMap, Import} from "../../../../../lib/lazyLoad"
import NotFoundPage from "../../_page/notFound/notFound"
import HomePage from "../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage";
import ContactPage from "../../_page/_sectionedPage/_lazySectionedPage/contactPage/contactPage";
import TeamPage from "../../_page/_sectionedPage/_lazySectionedPage/teamPage/teamPage";
import AboutPage from "../../_page/_sectionedPage/_lazySectionedPage/aboutPage/aboutPage";
import JobsPage from "../../_page/_sectionedPage/_lazySectionedPage/jobsPage/jobsPage";
import { declareComponent } from "../../../../../lib/declareComponent"
import HighlightAbleIcon from "../../../_icon/_highlightAbleIcon/highlightAbleIcon";
import ProjectsPage from "../../_page/projectBrowsePage/projectBrowsePage"
import GhostBlogSection from "../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection";
import BlogPage from "../../_page/blogPage/blogPage";



export default class PageManager extends Manager {
  constructor(pageChangeCallback?: (page: string, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number) => void, sectionChangeCallback?: (section: string) => void, onScroll?: (scrollProgress: number) => void, onUserScroll?: (scrollProgress: number, userInited: boolean) => void) {

    super(new ImportanceMap<() => Promise<any>, any>(
      
      {
        key: new Import("", 10, (homepage: typeof HomePage) =>
            new homepage("", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "homepage" */"../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage")
      },
      {
        key: new Import<string, [BlogPage, GhostBlogSection]>("jobsPlain", 10, ([blogPage, ghostBlogSection]) =>
            new blogPage(new ghostBlogSection("jobs-forju"))
        ), val: () => Promise.all([import("../../_page/blogPage/blogPage"), import("../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")])
      },
      {
        key: new Import("contactSite", 10, (contactPage: typeof ContactPage) =>
            new contactPage("contactSite", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "contactPage" */"../../_page/_sectionedPage/_lazySectionedPage/contactPage/contactPage")
      },
      {
        key: new Import("ourTeam", 10, (teamPage: typeof TeamPage) =>
            new teamPage("ourTeam", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "teamPage" */"../../_page/_sectionedPage/_lazySectionedPage/teamPage/teamPage")
      },
      {
        key: new Import("projects", 10, (projectsPage: typeof ProjectsPage) =>
            new projectsPage()
        ), val: () => import(/* webpackChunkName: "projectsPage" */"../../_page/projectBrowsePage/projectBrowsePage")
      },
      {
        key: new Import("about", 10, (aboutPage: typeof AboutPage) =>
            new aboutPage("about", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "aboutPage" */"../../_page/_sectionedPage/_lazySectionedPage/aboutPage/aboutPage")
      },
      {
        key: new Import("jobs", 10, (jobsPage: typeof JobsPage) =>
            new jobsPage("jobs", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "jobsPage" */"../../_page/_sectionedPage/_lazySectionedPage/jobsPage/jobsPage")
      },
      {
        key: new Import<string, [BlogPage, GhostBlogSection]>("impressum", 10, ([blogPage, ghostBlogSection]) =>
            new blogPage(new ghostBlogSection("impressum"))
        ), val: () => Promise.all([import("../../_page/blogPage/blogPage"), import("../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")])
      },
      {
        key: new Import<string, [BlogPage, GhostBlogSection]>("blog/*", 10, ([blogPage, ghostBlogSection]) =>
            new blogPage(new ghostBlogSection())
        ), val: () => Promise.all([import("../../_page/blogPage/blogPage"), import("../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")])
      },
      {
        key: new Import<string, [BlogPage, GhostBlogSection]>("services/*", 10, ([blogPage, ghostBlogSection]) =>
            new blogPage(new ghostBlogSection())
        ), val: () => Promise.all([import("../../_page/blogPage/blogPage"), import("../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")])
      },
      {
        key: new Import<string, [BlogPage, GhostBlogSection]>("projects/*", 10, ([blogPage, ghostBlogSection]) =>
            new blogPage(new ghostBlogSection())
        ), val: () => Promise.all([import("../../_page/blogPage/blogPage"), import("../../_pageSection/blogSection/ghostBlogSection/ghostBlogSection")])
      },
      {
        key: new Import("", 60, (notFoundPage: typeof NotFoundPage) =>
          new notFoundPage()
        ), val: () => import(/* webpackChunkName: "notFoundPage" */"../../_page/notFound/notFound")
      }
    ), 0, pageChangeCallback, true, onScroll, onUserScroll)
  }


  stl() {
    return super.stl() + require("./pageManager.css").toString()
  }
  pug() {
    return "";
  }
}


declareComponent("page-manager", PageManager)