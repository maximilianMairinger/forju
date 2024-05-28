import { mousePos } from "../../../../../lib/dataBindings";
import ProjectBrowsePage from "./projectBrowsePage";
import animationFrameDelta from "animation-frame-delta"



const posSwiv = 300
const possibleSwivel = {
  x: posSwiv,
  y: posSwiv
}
const approachSpeed = 0.04

export default function(page: ProjectBrowsePage) {
  for (const blob of page.q(".blob.a", true) as any as HTMLElement[]) {
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

      const mouseXFracAroundCenter = mouseXFrac - leftFrac
      const mouseYFracAroundCenter = mouseYFrac - topFrac

      const swivelX = possibleSwivel.x * mouseXFracAroundCenter
      const swivelY = possibleSwivel.y * mouseYFracAroundCenter

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

      blob.style.transform = `translate(-50%, -50%) translate(${currentPos.x}px, ${currentPos.y}px)`
    })


    
  } 
}