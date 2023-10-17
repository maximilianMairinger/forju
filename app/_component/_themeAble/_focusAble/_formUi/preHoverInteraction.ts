import FormUi from "./formUi";
import animationFrame from "animation-frame-delta";
import Easing from "waapi-easing"

const dragImpactEaseFunc = new Easing("easeIn").function





// /* let i = 0
// const getColor = () => {
//   i++
//   if (i % 3 === 0) {
//     return "red"
//   }
//   if (i % 3 === 1) {
//     return "green"
//   }
//   return "blue"
// } */

const maxPxPerFrame = .75
const overShoot = 11
const targetOverflow = 15
const targetOverflowWidthStr = `calc(100% + ${targetOverflow * 2}px)`
const activeTargetOverflow = 30
const activeTargetOverflowWidthStr = `calc(100% + ${activeTargetOverflow * 2}px)`
const qlance = .4



const halfQlance = qlance / 2


export default function(root: HTMLElement, target: HTMLElement, moveElement: HTMLElement, evTarget: HTMLElement) {



  target.css({
    left: -targetOverflow,
    top: -targetOverflow,
    width: targetOverflowWidthStr,
    height: targetOverflowWidthStr,
    zIndex: 1,
  })

  // target.css({backgroundColor: getColor()});



  // target.css({scale: overShootFactor})
  // const overShootX = t.offsetWidth * (overShootFactor-1) / 2;
  // const overShootY = t.offsetHeight * (overShootFactor-1) / 2;

  let renderedX = 0
  let renderedY = 0

  let relX = 0
  let relY = 0



  const mouseLeaveF = () => {
    relX = relY = 0

    root.css({zIndex: 6})


    target.css({
      left: -targetOverflow,
      top: -targetOverflow,
      width: targetOverflowWidthStr,
      height: targetOverflowWidthStr,
      zIndex: 1,
    })

    followRuntime.cancel()
    snapBackRuntime.resume()
  }


  evTarget.on("mouseleave", mouseLeaveF)


  let bounds: DOMRect
  let absX: number
  let absY: number
  let width: number
  let height: number
  let qWidth: number
  let qHeight: number
  let qWithWithActiveTargetOverflow: number
  let qHeightWithActiveTargetOverflow: number

  const mouseMoveF = (e: MouseEvent) => {
    bounds = root.getBoundingClientRect()

    absX = e.pageX - bounds.left
    absY = e.pageY - bounds.top


    width = bounds.width
    height = bounds.height
    qWidth = width * halfQlance
    qHeight = height * halfQlance
    qWithWithActiveTargetOverflow = qWidth + activeTargetOverflow
    qHeightWithActiveTargetOverflow = qHeight + activeTargetOverflow



    if (absX - bounds.width + qWidth < 0) {
      if (absX - qWidth > 0) absX = 0
      else absX -= qWidth
    }
    else absX -= width - qWidth

    if (absY - height + qHeight < 0) {
      if (absY - qHeight > 0) absY = 0
      else absY -= qHeight
    }
    else absY -= height - qHeight



    relX = dragImpactEaseFunc(absX / qWithWithActiveTargetOverflow) * overShoot
    relY = dragImpactEaseFunc(absY / qHeightWithActiveTargetOverflow) * overShoot
  }

  evTarget.on("mousemove", mouseMoveF)

  const mouseEneterF = (e) => {
    root.css({zIndex: -1})

    target.css({
      left: -activeTargetOverflow,
      top: -activeTargetOverflow,
      width: activeTargetOverflowWidthStr,
      height: activeTargetOverflowWidthStr,
      zIndex: 3
    })

    mouseMoveF(e)

    snapBackRuntime.cancel()
    followRuntime.resume()
  }

  evTarget.on("mouseenter", mouseEneterF)

  const rootMouseEnterF = () => {
    root.css({zIndex: -1})
    target.css({
      zIndex: 3
    })
  }

  root.on("mouseenter", rootMouseEnterF)




  let maxDistance = 0
  let curDistance = 0
  const followRuntimeFunc = (delta: number) => {
    const diffX = relX - renderedX
    const diffY = relY - renderedY

    curDistance = Math.sqrt(diffX**2 + diffY**2)

    if (Math.abs(curDistance) < .4) return

    if (maxDistance < curDistance) {
      maxDistance = curDistance
    }

    const speed = curDistance / maxDistance * maxPxPerFrame

    let fac = Math.min(1, (speed * delta) / curDistance)
    if (isNaN(fac)) fac = 0

    renderedX += diffX * fac
    renderedY += diffY * fac



    moveElement.css({translateX: renderedX, translateY: renderedY})
  }


  const followRuntime = animationFrame(followRuntimeFunc)
  followRuntime.cancel()
  // let currentlyActiveRuntime = followRuntime
  const snapBackRuntime = animationFrame((delta: number) => {
    followRuntimeFunc(delta)

    if (curDistance < .4) snapBackRuntime.cancel()
  })
  snapBackRuntime.cancel()

  return {
    disable() {
      evTarget.off("mouseleave", mouseLeaveF)
      evTarget.off("mousemove", mouseMoveF)
      evTarget.off("mouseenter", mouseEneterF)
      root.off("mouseenter", rootMouseEnterF)
      mouseLeaveF()
      target.css({pointerEvents: "none"})
    },
    enable() {
      evTarget.on("mouseleave", mouseLeaveF)
      evTarget.on("mousemove", mouseMoveF)
      evTarget.on("mouseenter", mouseEneterF)
      root.on("mouseenter", rootMouseEnterF)
      target.css({pointerEvents: "all"})
    }
  }
}