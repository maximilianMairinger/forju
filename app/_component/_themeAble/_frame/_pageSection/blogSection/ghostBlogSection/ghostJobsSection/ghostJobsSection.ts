import declareComponent from "../../../../../../../lib/declareComponent"
import GhostBlogSection from "../ghostBlogSection"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class GhostJobsSection extends GhostBlogSection {
  

  constructor() {
    super("jobs-forju")


  }
}

declareComponent("c-ghost-jobs-section", GhostJobsSection)
