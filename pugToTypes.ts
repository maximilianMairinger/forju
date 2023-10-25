import { render } from "pug"
import { Document, load as loadCheerio } from "cheerio"
import { camelCase } from "change-case"
import chokidar from "chokidar"
import path from "node:path"
import {promises as fs} from "fs"
declare const Bun: any
import { program } from "commander"

program
  .option('-w, --watch')
  .parse()

const options = program.opts() as {watch?: boolean}







const htmlInterfaceString = `
"a": HTMLAnchorElement;
"abbr": HTMLElement;
"address": HTMLElement;
"area": HTMLAreaElement;
"article": HTMLElement;
"aside": HTMLElement;
"audio": HTMLAudioElement;
"b": HTMLElement;
"base": HTMLBaseElement;
"bdi": HTMLElement;
"bdo": HTMLElement;
"blockquote": HTMLQuoteElement;
"body": HTMLBodyElement;
"br": HTMLBRElement;
"button": HTMLButtonElement;
"canvas": HTMLCanvasElement;
"caption": HTMLTableCaptionElement;
"cite": HTMLElement;
"code": HTMLElement;
"col": HTMLTableColElement;
"colgroup": HTMLTableColElement;
"data": HTMLDataElement;
"datalist": HTMLDataListElement;
"dd": HTMLElement;
"del": HTMLModElement;
"details": HTMLDetailsElement;
"dfn": HTMLElement;
"dialog": HTMLDialogElement;
"div": HTMLDivElement;
"dl": HTMLDListElement;
"dt": HTMLElement;
"em": HTMLElement;
"embed": HTMLEmbedElement;
"fieldset": HTMLFieldSetElement;
"figcaption": HTMLElement;
"figure": HTMLElement;
"footer": HTMLElement;
"form": HTMLFormElement;
"h1": HTMLHeadingElement;
"h2": HTMLHeadingElement;
"h3": HTMLHeadingElement;
"h4": HTMLHeadingElement;
"h5": HTMLHeadingElement;
"h6": HTMLHeadingElement;
"head": HTMLHeadElement;
"header": HTMLElement;
"hgroup": HTMLElement;
"hr": HTMLHRElement;
"html": HTMLHtmlElement;
"i": HTMLElement;
"iframe": HTMLIFrameElement;
"img": HTMLImageElement;
"input": HTMLInputElement;
"ins": HTMLModElement;
"kbd": HTMLElement;
"label": HTMLLabelElement;
"legend": HTMLLegendElement;
"li": HTMLLIElement;
"link": HTMLLinkElement;
"main": HTMLElement;
"map": HTMLMapElement;
"mark": HTMLElement;
"menu": HTMLMenuElement;
"meta": HTMLMetaElement;
"meter": HTMLMeterElement;
"nav": HTMLElement;
"noscript": HTMLElement;
"object": HTMLObjectElement;
"ol": HTMLOListElement;
"optgroup": HTMLOptGroupElement;
"option": HTMLOptionElement;
"output": HTMLOutputElement;
"p": HTMLParagraphElement;
"picture": HTMLPictureElement;
"pre": HTMLPreElement;
"progress": HTMLProgressElement;
"q": HTMLQuoteElement;
"rp": HTMLElement;
"rt": HTMLElement;
"ruby": HTMLElement;
"s": HTMLElement;
"samp": HTMLElement;
"script": HTMLScriptElement;
"search": HTMLElement;
"section": HTMLElement;
"select": HTMLSelectElement;
"slot": HTMLSlotElement;
"small": HTMLElement;
"source": HTMLSourceElement;
"span": HTMLSpanElement;
"strong": HTMLElement;
"style": HTMLStyleElement;
"sub": HTMLElement;
"summary": HTMLElement;
"sup": HTMLElement;
"table": HTMLTableElement;
"tbody": HTMLTableSectionElement;
"td": HTMLTableCellElement;
"template": HTMLTemplateElement;
"textarea": HTMLTextAreaElement;
"tfoot": HTMLTableSectionElement;
"th": HTMLTableCellElement;
"thead": HTMLTableSectionElement;
"time": HTMLTimeElement;
"title": HTMLTitleElement;
"tr": HTMLTableRowElement;
"track": HTMLTrackElement;
"u": HTMLElement;
"ul": HTMLUListElement;
"var": HTMLElement;
"video": HTMLVideoElement;
"wbr": HTMLElement;
`;

const svgInterfaceString = `
"a": SVGAElement;
"animate": SVGAnimateElement;
"animateMotion": SVGAnimateMotionElement;
"animateTransform": SVGAnimateTransformElement;
"circle": SVGCircleElement;
"clipPath": SVGClipPathElement;
"defs": SVGDefsElement;
"desc": SVGDescElement;
"ellipse": SVGEllipseElement;
"feBlend": SVGFEBlendElement;
"feColorMatrix": SVGFEColorMatrixElement;
"feComponentTransfer": SVGFEComponentTransferElement;
"feComposite": SVGFECompositeElement;
"feConvolveMatrix": SVGFEConvolveMatrixElement;
"feDiffuseLighting": SVGFEDiffuseLightingElement;
"feDisplacementMap": SVGFEDisplacementMapElement;
"feDistantLight": SVGFEDistantLightElement;
"feDropShadow": SVGFEDropShadowElement;
"feFlood": SVGFEFloodElement;
"feFuncA": SVGFEFuncAElement;
"feFuncB": SVGFEFuncBElement;
"feFuncG": SVGFEFuncGElement;
"feFuncR": SVGFEFuncRElement;
"feGaussianBlur": SVGFEGaussianBlurElement;
"feImage": SVGFEImageElement;
"feMerge": SVGFEMergeElement;
"feMergeNode": SVGFEMergeNodeElement;
"feMorphology": SVGFEMorphologyElement;
"feOffset": SVGFEOffsetElement;
"fePointLight": SVGFEPointLightElement;
"feSpecularLighting": SVGFESpecularLightingElement;
"feSpotLight": SVGFESpotLightElement;
"feTile": SVGFETileElement;
"feTurbulence": SVGFETurbulenceElement;
"filter": SVGFilterElement;
"foreignObject": SVGForeignObjectElement;
"g": SVGGElement;
"image": SVGImageElement;
"line": SVGLineElement;
"linearGradient": SVGLinearGradientElement;
"marker": SVGMarkerElement;
"mask": SVGMaskElement;
"metadata": SVGMetadataElement;
"mpath": SVGMPathElement;
"path": SVGPathElement;
"pattern": SVGPatternElement;
"polygon": SVGPolygonElement;
"polyline": SVGPolylineElement;
"radialGradient": SVGRadialGradientElement;
"rect": SVGRectElement;
"script": SVGScriptElement;
"set": SVGSetElement;
"stop": SVGStopElement;
"style": SVGStyleElement;
"svg": SVGSVGElement;
"switch": SVGSwitchElement;
"symbol": SVGSymbolElement;
"text": SVGTextElement;
"textPath": SVGTextPathElement;
"title": SVGTitleElement;
"tspan": SVGTSpanElement;
"use": SVGUseElement;
"view": SVGViewElement;
`;

const htmlMap = parseInterface(htmlInterfaceString);
const svgMap = parseInterface(svgInterfaceString);



const rootPath = "app/_component"




const componentIndex = new Map<string, {
  path: string
}>()



const kind = "add"
const paths = [] as string[]
await readDirRecursiveOnce(rootPath, (path: string) => {
  updateComponentIndex(path, kind)
  paths.push(path)
})

const proms = [] as Promise<any>[]
for (const path of paths) {
  proms.push(handlePugUpdate(path, kind))
}
await Promise.all(proms)
console.log("PugToTypes: Done")


if (options.watch) {
  console.log("PugToTypes: Watching...")

  chokidar.watch(rootPath, { ignoreInitial: true }).on("add", (path: string) => updateComponentIndex(path, "add"))
  chokidar.watch(rootPath, { ignoreInitial: true }).on("unlink", (path: string) => updateComponentIndex(path, "remove"))


  // after initial
  setTimeout(() => {
    chokidar.watch(rootPath, { ignoreInitial: true }).on("add", (path: string) => handlePugUpdate(path, "add"))
    chokidar.watch(rootPath, { ignoreInitial: true }).on("change", (path: string) => handlePugUpdate(path, "change"))
  }, 500)
}


async function readDirRecursiveOnce(dir: string, func: (path: string) => (void | Promise<void>)) {
  const proms = [] as (void | Promise<void>)[]
  const files = await fs.readdir(dir)
  const subDirs = [] as string[]
  for await (const filePath of files) {
    const file = await fs.stat(path.join(dir, filePath))
    if (file.isDirectory()) {
      subDirs.push(filePath)
    }
    else if (file.isFile()) {
      proms.push(func(path.join(dir, filePath)))
    }
  }

  for (const subDir of subDirs) {
    proms.push(readDirRecursiveOnce(path.join(dir, subDir), func))
  }

  await Promise.all(proms)
}



function updateComponentIndex(dir: string, kind: "add" | "remove") {
  const name = path.basename(dir) as string
  if (!name.endsWith(".ts")) return

  if (kind === "add") {
    componentIndex.set(name.slice(0, -3), { path: dir })
  }
  else if (kind === "remove") {
    componentIndex.delete(name.slice(0, -3))
  }
}







async function pugToTypes(pugFilePath: string) {
  const pugContent = await fs.readFile(pugFilePath, "utf8")
  const html = render(pugContent, { pretty: true })
  const $ = loadCheerio(html);

  const allElems = [...$("body *")]


  const types = {
    imports: new Map<ComponentPath, ComponentTagName | false>(),
    types: [] as string[]
  }

  for (const el of allElems) {
    const componentTagName = parseComponentTagName(el.tagName.toLowerCase())
    if (componentTagName !== false) {
      const component = componentIndex.get(componentTagName)
      if (component) {
        const componentPath = "./" + removeExtension(path.relative(path.join(pugFilePath, ".."), component.path))
        
        types.imports.set(componentPath, false)
      }
    }
  }






  const elemsWithName = allElems.filter((el) => "name" in el.attribs)

  const links = elemsWithName.map((el) => ({name: el.attribs.name, tagName: el.tagName.toLowerCase(), componentTagName: parseComponentTagName(el.tagName.toLowerCase())} as const))

  type ComponentPath = string
  type ComponentTagName = string
  


  for (const { name, tagName, componentTagName } of links) {
    if (componentTagName !== false) {
      const component = componentIndex.get(componentTagName)
      if (component) {
        const componentPath = "./" + removeExtension(path.relative(path.join(pugFilePath, ".."), component.path))
        const elemName = capitalize(componentTagName)


        types.imports.set(componentPath, elemName)
        // types.imports.add(`import ${elemName} from "${componentPath}"; import "${componentPath}"`)
        types.types.push(`${name}: ${elemName}`)
      }
      else {
        types.types.push(`${name}: HTMLElement`)
      }
    }
    else {
      if (htmlMap.has(tagName)) {
        types.types.push(`${name}: ${htmlMap.get(tagName)}`)
      }
      else if (svgMap.has(tagName)) {
        types.types.push(`${name}: ${svgMap.get(tagName)}`)
      }
      else {
        types.types.push(`${name}: HTMLElement`)
      }
    }
  }

  

  return [...types.imports.keys()].map((componentPath) => {
    const elemName = types.imports.get(componentPath)
    const justElemImport = `import "${componentPath}"`
    if (elemName === false) return justElemImport
    else return `import ${elemName} from "${componentPath}"; ` + justElemImport 
  }).join("\n") + (types.imports.size > 0 ? "\n\n" : "") + 
`export interface BodyTypes {
  ${types.types.join("\n  ")}    
}
`
}


async function handlePugUpdate(dir: string, kind: "add" | "change") {
  const name = path.basename(dir) as string
  if (!name.endsWith(".pug")) return

  const types = await pugToTypes(dir)
  const typesPath = path.join(path.dirname(dir), "pugBody.gen.ts")

  await fs.writeFile(typesPath, types)
}



function removeExtension(s: string) {
  return s.replace(/\.[^/.]+$/, "")
}

function parseComponentTagName(s: string) {
  if (s.startsWith("c-")) return camelCase(s.slice(2))
  else return false
}


function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}


function parseInterface(interfaceString: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = interfaceString.split('\n');

  // Assuming each line is in the format: '"tag": ClassName;'
  for (let line of lines) {
      const match = line.match(/"(\w+)": (\w+);/);
      if (match) {
          const tag = match[1];
          const className = match[2];
          map.set(tag, className);
      }
  }

  return map;
}

