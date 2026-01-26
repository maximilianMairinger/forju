import { mousePos } from "../../lib/dataBindings";
import { signedEasing } from "../../lib/util";
import animationFrameDelta from "animation-frame-delta"
import { Easing } from "waapi-easing"
import BlobAndGlassBackground from "./blobAndGlassBackground";

const easeOutFunc = signedEasing(new Easing("easeOut"))

const posSwivPerc = .25
const possibleSwivelPercent = {
  x: posSwivPerc,
  y: posSwivPerc
}
const approachSpeed = 0.04

export default function(page: BlobAndGlassBackground) {
  for (const blob of page.q(".blob", true) as any as HTMLElement[]) {
    const topFrac = blob.css("top") / page.clientHeight
    const leftFrac = blob.css("left") / page.clientWidth

    console.log(blob.css("top"), blob.css("height") / 2, page.clientHeight)

    let wantPos = {
      x: 0,
      y: 0
    }

    mousePos(({x: mouseX, y: mouseY}) => {
      const mouseXFrac = mouseX / page.clientWidth
      const mouseYFrac = mouseY / page.clientHeight

      const mouseXFracAroundCenter = easeOutFunc(mouseXFrac - leftFrac)
      const mouseYFracAroundCenter = easeOutFunc(mouseYFrac - topFrac)


      const swivelX = possibleSwivelPercent.x * page.offsetHeight * mouseXFracAroundCenter
      const swivelY = possibleSwivelPercent.y * page.offsetWidth * mouseYFracAroundCenter

      wantPos.x = swivelX
      wantPos.y = swivelY
    }, true, false)

    let currentPos = {
      x: 0,
      y: 0
    }

    animationFrameDelta((delta) => {
      currentPos.x += (wantPos.x - currentPos.x) * delta * approachSpeed
      currentPos.y += (wantPos.y - currentPos.y) * delta * approachSpeed

      // currentPos.x = wantPos.x
      // currentPos.y = wantPos.y

      blob.style.transform = `translate(-50%, -50%) translate(${Math.round(currentPos.x * 100) / 100}px, ${Math.round(currentPos.y * 100) / 100}px)`
    })


    
  } 
}