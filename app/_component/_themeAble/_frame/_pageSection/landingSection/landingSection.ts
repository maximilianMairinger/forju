import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import "./../../../_icon/lineAccent/lineAccent"
import "./../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import RippleButton from "./../../../_focusAble/_formUi/_rippleButton/rippleButton"
import "./../../../_focusAble/_button/button"
import Button from "./../../../_focusAble/_button/button"
import "./../../../link/link"
import Link from "./../../../link/link"
import "./../../../_icon/bigVideo/bigVideo"
import "./../../../_icon/landingCircle/landingCircle"
import "./../../../../_icon/spikeIcon/spikeIcon"
import "./../../../../_icon/crossIcon/crossIcon"
import "./../../../../_icon/ovalIcon/ovalIcon"
import "./../../../textBlob/textBlob"
import { getCurrentLoadRecord } from "../../frame"

import * as isSafari from "is-safari"

import { EventListener } from "extended-dom"
import delay from "tiny-delay"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class LandingSection extends PageSection {
  protected body: BodyTypes

  private coverButton = this.q("view-work .coverButton") as Button
  private rippleButton = this.q("view-work .rippleButton") as RippleButton
  private link = this.q("view-work c-link") as Link
  private heroParallax = this.q("right-side c-parallax") as HTMLElement
  private heroVideo = this.q("img-wrapper video") as unknown as HTMLVideoElement
  constructor() {
    super("light")
    if (isSafari) this.addClass("safari")

    this.setupHeroVideoMorph()

    new EventListener(this.coverButton, ["mouseover", "focusin"], this.link.mouseOverAnimation)
    new EventListener(this.coverButton, ["mouseleave", "focusout"], this.link.mouseOutAnimation)
    this.coverButton.addActivationCallback(this.link.mouseOutAnimation)
    // this.coverButton.addActivationCallback(this.link.clickAnimation)

    this.coverButton.on("mousedown", () => {
      let release = this.rippleButton.initRipple();
      new EventListener(this.coverButton, ["mouseup", "mouseout"], release, undefined, {once: true})
    })


    delay(0, () => {
      this.q("c-cross-icon", true).anim([
        {offset: 0, rotateZ: "0deg", scale: 1},
        {offset: .25, rotateZ: "180deg", scale: 1.3},
        {offset: .5, rotateZ: "360deg", scale: 1},
        {offset: .75, rotateZ: "540deg", scale: 1.3},
        {offset: 1, rotateZ: "720deg", scale: 1}
      ], {
        duration: 5000,
        iterations: Infinity
      })

    })
  }

  private setupHeroVideoMorph() {
    if (!this.heroParallax || !this.heroVideo) return

    const fullRecord = getCurrentLoadRecord()
    const video = this.heroVideo
    let playbackStarted = false
    let revealStarted = false

    video.loop = false
    video.preload = "none"
    video.muted = true
    video.playsInline = true

    fullRecord.full.add(async () => {
      const deferredSrc = video.getAttribute("data-src")
      if (!deferredSrc || video.getAttribute("src")) return
      video.setAttribute("src", deferredSrc)
      video.preload = "auto"
      video.load()
    })

    const revealVideo = () => {
      if (revealStarted) return
      revealStarted = true
      this.addClass("videoReveal")
    }

    const startPlayback = async () => {
      if (!video.getAttribute("src")) return
      if (playbackStarted) return
      playbackStarted = true

      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((res) => {
          const done = () => res()
          video.addEventListener("canplay", done, { once: true })
          video.addEventListener("loadeddata", done, { once: true })
        })
      }

      await video.play()
    }

    const revealAndQueuePlayback = () => {
      this.addClass("imageMorph")
      // Let the still image tilt/zoom first, then fade in the already-playing video.
      delay(200, () => {
        startPlayback()
          .then(revealVideo)
          .catch(() => {
            // Hover-triggered playback can still be blocked on some browsers.
            revealVideo()
          })
      })
    }

    this.heroParallax.addEventListener("mouseenter", revealAndQueuePlayback, { once: true })

    video.addEventListener("ended", () => {
      this.addClass("videoFinished")
      video.pause()
    }, { once: true })
  }

  stl() {
    return super.stl() + require("./landingSection.css").toString()
  }
  pug() {
    return require("./landingSection.pug").default
  }
}

declareComponent("landing-section", LandingSection)
