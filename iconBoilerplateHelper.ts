import chokidar from "chokidar"
import { outlineSvg as _outlineSvg } from '@davestewart/outliner'
import path from "node:path"
import svgo, { Config } from "svgo"
import { paramCase } from "change-case"
import { load as cheerioHTML, Element } from "cheerio"
import {promises as fs} from "fs"
declare const Bun: any

type outlineSvg = (content: string) => string
const outlineSvg = _outlineSvg as outlineSvg


const iconPath = "app/_component/_icon"

chokidar.watch(iconPath, { ignoreInitial: true }).on("add", (path: string) => changeFunc(path, false))

console.log("Running iconBoilerplateHelper")

function unifyAttrbIfPossible($: ReturnType<typeof cheerioHTML>, attrbName: string): UnifyAttrbProps {
  const allElems = [...$(`[${attrbName}]`)].filter((el: any) => !notReallyColors.includes(el.attribs[attrbName].toLowerCase())) as Element[]

  const nonEmpty = allElems.length > 0

  const attrb = new Set()
  allElems.forEach((el) => {
    attrb.add(el.attribs[attrbName])
  })
  const onlyOneAttrb = attrb.size === 1

  
  return {
    allElems,
    nonEmpty,
    attrb, 
    onlyOneAttrb
  }
}



async function changeFunc(pth: string, change: boolean) {
  const stat = await fs.stat(pth)
  if (stat.isFile()) {
    const content = await fs.readFile(pth, "utf8")
    if (content === "") return
    if (!pth.endsWith(".svg")) return
  
    const nameAr = pth.split("/").pop()?.split(".")
    if (nameAr === undefined) return
    nameAr.pop()
    let name = nameAr.join(".")
    if (name === undefined) return

    const fillifyVerb = nameAr.pop()
    const fillify = fillifyVerb === "fillify"

    if (fillify) {
      name = nameAr.join(".")
    }


    if (await fileExists(path.join(iconPath, name))) {
      console.log(`A svg under the name ${name} already exists. Skipping`)
      await fs.unlink(pth)
      return
    }



    console.log(`Running ${name}` + (fillify ? ` and fillifying` : ""))





    let colorProps: {
      fill: UnifyAttrbProps,
      stroke: UnifyAttrbProps
    } = {} as any

    let strokeWidthProps: UnifyAttrbProps = {} as any
    
    type Input = string
    type Output = string
    const decorators = [
      parseSvgDecorators.minimize({ assumeWithoutStroke: false, pretty: true }),
      (content) => {
        const $ = cheerioHTML(content)


        const fill = unifyAttrbIfPossible($, "fill")
        const stroke = unifyAttrbIfPossible($, "stroke")

        colorProps = {
          fill,
          stroke
        }


        if (fill.nonEmpty && !stroke.nonEmpty) {
          if (fill.onlyOneAttrb) {
            fill.allElems.forEach((el) => {
              $(el).attr("fill", "var(--color)")
            })
          }
        }
        if (stroke.nonEmpty && !fill.nonEmpty) {
          if (stroke.onlyOneAttrb) {
            stroke.allElems.forEach((el) => {
              $(el).attr("stroke", "var(--color)")
            })
          }
        }
        if (stroke.nonEmpty && fill.nonEmpty) {
          if (fill.onlyOneAttrb) {
            fill.allElems.forEach((el) => {
              $(el).attr("fill", "var(--color)")
            })
          }
          if (stroke.onlyOneAttrb) {
            stroke.allElems.forEach((el) => {
              $(el).attr("stroke", "var(--stroke-color)")
            })
          }
        }
        return $("body").html()
      },
      () => {
        const $ = cheerioHTML(content)
        strokeWidthProps = unifyAttrbIfPossible($, "stroke-width")
        if (strokeWidthProps.nonEmpty && strokeWidthProps.onlyOneAttrb) {
          strokeWidthProps.allElems.forEach((el) => {
            $(el).attr("stroke-width", "var(--stroke-width)")
          })
        }
        return $("body").html()
      },
      parseSvgDecorators.minimize({ assumeWithoutStroke: false, pretty: true }),
    ] as ((content: Input) => Output)[]

    if (fillify) decorators.unshift(parseSvgDecorators.outline())


    const parsedSvg = decorators.reduce((acc, decorator) => decorator(acc), content)

    let color = colorProps.fill.onlyOneAttrb ? colorProps.fill.attrb.values().next().value : undefined
    let strokeColor = colorProps.stroke.onlyOneAttrb ? colorProps.stroke.attrb.values().next().value : undefined
    if (color === undefined && strokeColor !== undefined && !colorProps.fill.nonEmpty) {
      color = strokeColor
      strokeColor = undefined
    }

    const parsedTs = tsTemplate({name})
    const parsedCss = cssTemplate({ color, strokeColor, strokeWidth: strokeWidthProps.onlyOneAttrb ? strokeWidthProps.attrb.values().next().value : undefined })

    await fs.mkdir(path.join(iconPath, `${name}Icon`), { recursive: true })
    await Promise.all([
      fs.writeFile(path.join(iconPath, `${name}Icon`, `${name}Icon.pug`), parsedSvg),
      fs.writeFile(path.join(iconPath, `${name}Icon`, `${name}Icon.ts`), parsedTs),
      fs.writeFile(path.join(iconPath, `${name}Icon`, `${name}Icon.css`), parsedCss),
      fs.unlink(pth)
    ])
    
    
    

  }
}


function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

const tsTemplate = ({name}: {name: string}) => 
`import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class ${capitalize(name)}Icon extends Icon {
  pug() {
    return require("./${name}Icon.pug").default
  }
  stl() {
    return super.stl() + require("./${name}Icon.css").toString()
  }
}

declareComponent("c-${paramCase(name)}-icon", ${capitalize(name)}Icon)
`

const cssTemplate = ({color, strokeColor, strokeWidth}: {color?: string, strokeColor?: string, strokeWidth?: boolean}) => color !== undefined || strokeColor !== undefined || strokeWidth !== undefined ?
`:host {${color === undefined ? "" : `
  --color: ${color};`}${strokeColor === undefined ? "" : `
  --stroke-color: ${strokeColor};`}${strokeWidth === undefined ? "" : `
  --stroke-width: ${strokeWidth};`}
}
` : ""

const removeAttrs = [
  "width",
  "height",
  "class",
  "id",
  "name"
]

const strokeAttributes = [
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-width",
  "stroke-linejoin",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-miterlimit"
]

const fillAttributes = [
  "fill",
  "fill-opacity",
  "fill-rule"
]

const notReallyColors = [
  "none",
  "unset",
  "transparent",
  "initial",
  "inherit",
  "currentColor"
]


type UnifyAttrbProps = {
  allElems: Element[];
  nonEmpty: boolean;
  // @ts-ignore
  attrb: Set<unknown>;
  onlyOneAttrb: boolean;
}
const parseSvgDecorators = {
  minimize: ({assumeWithoutStroke = false, pretty = true}: {assumeWithoutStroke?: boolean, pretty?: boolean}) => (content: string) => {
    try {
      const config = {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                // viewBox is required to resize SVGs with CSS.
                // @see https://github.com/svg/svgo/issues/1128
                removeViewBox: false
              }
            }
          }
        ]
      } as Config

      if (pretty) config.js2svg = {
        indent: 2,
        pretty: true
      }

      const myRmAttrs = [...removeAttrs]
      if (assumeWithoutStroke) myRmAttrs.push(...strokeAttributes)
      config.plugins?.push({
        name: "removeAttrs",
        params: {
          attrs: `(${myRmAttrs.join("|")})`
        }
      })

      const result = svgo.optimize(content, config)
      const out = result?.data ?? content

      return out
    }
    catch(e) {
      console.log("error parsing svg")
      return content
    }
  },
  outline: () => outlineSvg




}


const fileExists = async (filename: string): Promise<boolean> => {
  try {
    await fs.access(filename);
    return true;
  } catch (error) {
    return false;
  }
};