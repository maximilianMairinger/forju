import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "../../../../image/image"
import "../../../_icon/heartIllustration/heartIllustration"
import "../../../_icon/dotAccent/dotAccent"
import IconArrowPointer from "../../../_icon/arrowPointer/arrowPointer"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import RippleButton from "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import { Data, DataSubscription } from "josm"
import Image from "../../../../image/image"
import delay from "delay"
import { EventListener } from "extended-dom"


const fadeInAnimOptions = {
  opacity: 1,
  translateX: .1
}

const fadeoutAnimOptions = {
  opacity: 0,
  translateX: -15
}

const smooth = false


function makeEntryDetailsElement(data: {name: string, role: string, imgSrc: string}) {
  const img = new Image(data.imgSrc)

  
  return {
    details: ce("details-entry").apd(
      ce("heading-elem").txt(data.name),
      ce("subtext-elem").txt(data.role),
    ),
    img
  }
}


// TODO avid doesnt get rendered at first

const teamMembers = [
  {
    name: "Raphael Schlager",
    role: "Geschäftsführung",
    imgSrc: "rschlagerCrop3"
  },
  {
    name: "Maximilian Mairinger",
    role: "Design & Webentwicklung",
    imgSrc: "mmairinger2Crop"
  },
  {
    name: "Avid Vormann",
    role: "Videoproduktion",
    imgSrc: "avormann"
  }
]

const scrollElemWidth = 300


export default class TeamMemberSection extends PageSection {

  private scrollContainer = this.q("scroll-container") as HTMLElement
  private imageContainer = this.q("image-container")
  private detailsBar = this.q("details-bar") as HTMLElement
  private nextEmploeeBtn: RippleButton = this.detailsBar.childs("c-ripple-button") as any
  constructor() {
    super("light");
    this.accentTheme.set("secondary")

    const arrowIcon = new IconArrowPointer()
      
    arrowIcon.css({
      width: 20,
      height: "min-content",
      padding: 12
    })

    this.nextEmploeeBtn.append(arrowIcon)
    this.nextEmploeeBtn.userFeedbackMode.enabled.set(false)

    
    

    this.nextEmploeeBtn.click(async () => {
      this.nextEmploeeBtn.enabled.set(false)
      await Promise.all([this.nextEmployeeAnimation(), this.rmLastEmployee()])
      this.nextEmploeeBtn.enabled.set(true)
    })


    for (let i = 0; i < 10; i++) {
      this.addScrollElem()
    }

    this.sra(ce("style").html(`scroll-container>scrollmargin-element{width:${scrollElemWidth}px}`))


    let animGuide = new Data(0)
    const itr = this.count = new Data(1)

    
    this.scrollSub = this.scrollContainer.on("scroll", (e) => {
      const t = e.progress.x / (scrollElemWidth - 1)
      itr.set(Math.max(Math.ceil(t), 1))
      
      let animPos = t % 1
      animGuide.set(animPos)
    })


    const { img, details } = this.prepNewEmployeeElements(0)
    img.css(fadeInAnimOptions)
    details.css(fadeInAnimOptions)

    
    let lastItr = itr.get()
    itr.get((itr) => {
      const forwards = itr >= lastItr // the euqal sign here is important
      lastItr = itr

      if (this.preElem) {
        this.lls.push(this.preElem)
        this.preElem = undefined
      }

      if (!forwards) {
        const preGuy = this.lls.pop()
        setTimeout(() => {
          preGuy.img.remove()
          preGuy.details.remove()
        }, 200)
        
        animGuide.set(0)
        animGuide = new Data(0)
        if (itr === 0) {
          return
        }
      }
      else {
        if (itr !== 1) {
          const preGuy = this.lls.shift()
          setTimeout(() => {
            preGuy.img.remove()
            preGuy.details.remove()
          }, 200)
        }
        
        
      }


      
      
      const nextElems = this.prepNewEmployeeElements(itr - (!forwards ? 1 : 0), forwards)
      this.preElem = this.lls.pop()


      // if (this.inTimingAnimation) return

      const curElem = forwards ? this.lls.first : this.preElem


      if (!this.inTimingAnimation) animGuide.set(+forwards)
      animGuide = new Data(+!forwards)

      const fadeInAnimKeyFrames = [{...fadeoutAnimOptions}, {...fadeInAnimOptions}] as any[]
      fadeInAnimKeyFrames.first.translateX *= (forwards ? -1 : 1)
      if (!forwards) fadeInAnimKeyFrames.reverse()
      fadeInAnimKeyFrames.first.offset = 0

      const fadeOutAnimKeyFrames = [{...fadeInAnimOptions}, {...fadeoutAnimOptions}] as any[]
      fadeOutAnimKeyFrames.last.translateX *= (!forwards ? -1 : 1)
      if (!forwards) fadeOutAnimKeyFrames.reverse()
      fadeOutAnimKeyFrames.first.offset = 0

      
      nextElems.img.anim(fadeInAnimKeyFrames, {start: 0, end: 1, smooth}, animGuide)
      nextElems.details.anim(fadeInAnimKeyFrames, forwards ? {start: 0.1, end: 1, smooth} : {start: 0, end: .9, smooth}, animGuide)
      curElem.details.anim(fadeOutAnimKeyFrames, forwards ? {start: 0, end: .6, smooth} : {start: .4, end: 1, smooth}, animGuide)
    }, true)
    


  }
  private scrollSub: EventListener
  private inTimingAnimation = false
  private preElem: ReturnType<typeof makeEntryDetailsElement>
  private count: Data<number>

  private addScrollElem() {
    this.scrollContainer.apd(ce("scrollmargin-element"))
  }

  private lls = [] as ReturnType<typeof makeEntryDetailsElement>[]

  private rmLastEmployee(): Promise<void> {
    const { img, details } = this.lls.last
    delay(500).then(() => img.remove())
    return delay(80).then(() => details.anim(fadeoutAnimOptions, 500).then(() => details.remove()))
  }


  private prepNewEmployeeElements(count: number, beginOrEnd: boolean = true) {
    const data = teamMembers[count % teamMembers.length]

    const e = makeEntryDetailsElement(data)
    if (beginOrEnd) this.lls.add(e)
    else this.lls.unshift(e)

    const begEndFac = !beginOrEnd ? 1 : -1
    const styles = {...fadeoutAnimOptions}
    styles.translateX = -begEndFac * 15
    
    e.img.css(styles)
    e.details.css(styles)
    


    this.imageContainer.apd(e.img)
    this.detailsBar.insertBefore(e.details, this.nextEmploeeBtn)

    return e
  }



  private nextEmployeeAnimation() {
    return new Promise<void>((res) => {

      this.inTimingAnimation = true

      if (this.preElem) {
        this.preElem.img.remove()
        this.preElem.details.remove()
      }
      this.prepNewEmployeeElements(this.count.get())
      this.preElem = this.lls.pop()


      const { img, details } = this.preElem


      

      this.scrollContainer.css({pointerEvents: "none"})
  

      delay(120).then(() => {
        img.anim(fadeInAnimOptions, 500)
        delay(80).then(() => details.anim(fadeInAnimOptions, 500)).then(() => {
          this.count.set(this.count.get() + 1)
          this.scrollContainer.scrollLeft = (this.count.get() - 1) * scrollElemWidth
          this.scrollSub.deactivate()
          
          setTimeout(() => {
            this.inTimingAnimation = false
            this.scrollContainer.css({pointerEvents: "all"})
            this.scrollSub.activate()
            res()
          })
          
          
        })
      })
    })
    
    

    

  }

  stl() {
    return super.stl() + require("./teamMembersSection.css").toString()
  }
  pug() {
    return require("./teamMembersSection.pug").default
  }
}

declareComponent("team-members-section", TeamMemberSection)
