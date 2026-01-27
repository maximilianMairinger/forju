import declareComponent from "../../../../../../../../lib/declareComponent"
import FixedGhostPage from "../fixedGhostPage"


export default class JobsGhostBlog extends FixedGhostPage {
  

  constructor() {
    super("jobs-forju")


  }
}

declareComponent("c-jobs-ghost-blog", JobsGhostBlog)
