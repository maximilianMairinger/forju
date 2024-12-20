import Manager from "../manager";
import {ImportanceMap, Import} from "../../../../../lib/lazyLoad"
import NotFoundPage from "../../_page/notFound/notFound"
import HomePage from "../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage";
import ContactPage from "../../_page/_sectionedPage/_lazySectionedPage/contactPage/contactPage";
import TeamPage from "../../_page/_sectionedPage/_lazySectionedPage/teamPage/teamPage";
import AboutPage from "../../_page/_sectionedPage/_lazySectionedPage/aboutPage/aboutPage";
import { declareComponent } from "../../../../../lib/declareComponent"
import HighlightAbleIcon from "../../../_icon/_highlightAbleIcon/highlightAbleIcon";
import FixedGhostBlogPage from "../../_page/_blogPage/ghostBlogPage/fixedGhostPage/fixedGhostPage"
import GhostBlogPage from "../../_page/_blogPage/ghostBlogPage/ghostBlogPage"
import ProjectsPage from "../../_page/projectBrowsePage/projectBrowsePage"




export default class PageManager extends Manager {
  constructor(pageChangeCallback?: (page: string, sectiones: {[link: string]: HighlightAbleIcon}[], domainLevel: number) => void, sectionChangeCallback?: (section: string) => void, onScroll?: (scrollProgress: number) => void, onUserScroll?: (scrollProgress: number, userInited: boolean) => void) {

    super(new ImportanceMap<() => Promise<any>, any>(
      
      {
        key: new Import("", 10, (homepage: typeof HomePage) =>
            new homepage("", sectionChangeCallback)
        ), val: () => import(/* webpackChunkName: "homepage" */"../../_page/_sectionedPage/_lazySectionedPage/homepage/homepage")
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
        key: new Import("impressum", 10, (fixedGhostBlogPage: typeof FixedGhostBlogPage) =>
            new fixedGhostBlogPage("impressum-forju")
        ), val: () => import(/* webpackChunkName: "legalPage" */"../../_page/_blogPage/ghostBlogPage/fixedGhostPage/fixedGhostPage")
      },
      {
        key: new Import("blog/*", 10, (ghostBlogPage: typeof GhostBlogPage) => 
          new ghostBlogPage()
        ), val: () => import(/* webpackChunkName: "ghostBlogPage" */"../../_page/_blogPage/ghostBlogPage/ghostBlogPage")
      },
      {
        key: new Import("services/*", 10, (ghostBlogPage: typeof GhostBlogPage) => 
          new ghostBlogPage()
      ), val: () => import(/* webpackChunkName: "ghostBlogPage" */"../../_page/_blogPage/ghostBlogPage/ghostBlogPage")
    },
    {
        key: new Import("projects/*", 10, (ghostBlogPage: typeof GhostBlogPage) => 
          new ghostBlogPage()
        ), val: () => import(/* webpackChunkName: "ghostBlogPage" */"../../_page/_blogPage/ghostBlogPage/ghostBlogPage")
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