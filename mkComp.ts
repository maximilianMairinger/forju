// deno-lint-ignore-file 
import path from "node:path"
import { paramCase } from "change-case"
import chokidar from "chokidar"
import { delay } from "tiny-delay"
import { LinkedList } from "fast-linked-list" 
import {promises as fs} from "fs"
declare const Bun: any

console.log("mkComp: Watching...")

async function makeComponent(parentDir: string, name: string) {
  await fs.mkdir(path.join(parentDir, name), { recursive: true })

  let parentCompName = path.basename(parentDir)
  if (parentCompName.startsWith("_")) parentCompName = parentCompName.slice(1)


  let declareCompImport = path.relative(path.join(parentDir, name), "app/lib/declareComponent")
  if (!declareCompImport.startsWith(".")) declareCompImport = "./" + declareCompImport

  const tsContent = 
`import declareComponent from "${declareCompImport}"
import ${capitalize(parentCompName)} from "../${parentCompName}"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class ${capitalize(name)} extends ${capitalize(parentCompName)} {
  protected body: BodyTypes

  constructor() {
    super()


  }

  stl() {
    return super.stl() + require("./${name}.css").toString()
  }
  pug() {
    return require("./${name}.pug").default
  }
}

declareComponent("c-${paramCase(name)}", ${capitalize(name)})
`

  const cssContent = 
`:host {
  display: block;
  position: relative;
}

component-body {
  
}
`

  await Promise.all([
    fs.writeFile(path.join(parentDir, name, `${name}.ts`), tsContent),
    fs.writeFile(path.join(parentDir, name, `${name}.pug`), ""),
    fs.writeFile(path.join(parentDir, name, `${name}.css`), cssContent),
  ])

}


const justRemovedList = new LinkedList<{path: string, name: string}>()
function getNamesByPath<T extends {path: string, name: string}>(ls: LinkedList<T>, _pth: string) {
  const pth = path.resolve(_pth)
  const matches = [] as string[]
  for (let i of ls) {
    if (i.path === pth) matches.push(i.name)
  }
  return matches
}

const matchPugAndCssRequireRegex = /(?<=stl\s*\(\s*\)\s*\{\s*[\s\S]*?require\s*\(\s*['"`]\.\/)([a-zA-Z][a-zA-Z\-_\.]*)(?=\.css['"`]\s*\)[\s\S]*?\})|(?<=pug\s*\(\s*\)\s*\{\s*[\s\S]*?require\s*\(\s*['"`]\.\/)([a-zA-Z][a-zA-Z\-_\.]*)(?=\.pug['"`]\s*\)[\s\S]*?\})/g
const matchClassDeclarationRegex = /(?<=class\s+)[a-zA-Z][a-zA-Z0-9\-_]*(?=(?:<(?:[a-zA-Z][a-zA-Z0-9<>,\.\s\-_]*)+>)?\s+extends\s+[a-zA-Z][a-zA-Z0-9<>,\.\s\-_]*\s*{)/g
const matchComponentClassNameRegex = /(?<=declareComponent\s*\(\s*["'`][a-zA-Z][a-zA-Z0-9\-_]*["'`]\s*,\s*)[a-zA-Z][a-zA-Z0-9\-_]*(?=\s*\))/g
const matchComponentTagNameRegex = /(?<=declareComponent\s*\(\s*["'`])[a-zA-Z][a-zA-Z0-9\-_]*(?=["'`]\s*,\s*[a-zA-Z][a-zA-Z0-9\-_]*\s*\))/g


const watcher = chokidar.watch("app/_component", {ignoreInitial: true})


watcher
  .on("addDir", async (pth) => {
    const splitPath = pth.split("/")
    const name = splitPath.pop()!
    const parentPath = splitPath.join("/")


    const wasRename = await (async () => {
      const possibleJustRemovedNames = getNamesByPath(justRemovedList, parentPath)
      if (possibleJustRemovedNames.length > 0 && (await fs.readdir(pth)).length !== 0) {
        // do checks
        if (!(await fileExists(path.join(pth, `${name}.ts`)))) {
          const doesSomeJustRemovedNameWork = await someAsync(possibleJustRemovedNames, (possibleJustRemovedName) => fileExists(path.join(pth, `${possibleJustRemovedName}.ts`)))
          if (doesSomeJustRemovedNameWork !== false) {
            const oldName = doesSomeJustRemovedNameWork.item

            console.log(`Rename ${oldName} to ${name}`)


            const handleRenameInTsFile = (async () => {
              let content = await fs.readFile(path.join(pth, `${oldName}.ts`), "utf8")
              const delProm = fs.unlink(path.join(pth, `${oldName}.ts`))
              content = content.replace(matchPugAndCssRequireRegex, name)
              content = content.replace(matchClassDeclarationRegex, capitalize(name))
              content = content.replace(matchComponentClassNameRegex, capitalize(name))
              content = content.replace(matchComponentTagNameRegex, `c-${paramCase(name)}`)

              await Promise.all([
                fs.writeFile(path.join(pth, `${name}.ts`), content),
                delProm
              ])
            })()
      
      
            await Promise.all([
              handleRenameInTsFile,
              fileExists(path.join(pth, `${oldName}.css`)).then((exists) => exists ? fs.rename(path.join(pth, `${oldName}.css`), path.join(pth, `${name}.css`)) : undefined),
              fileExists(path.join(pth, `${oldName}.pug`)).then((exists) => exists ? fs.rename(path.join(pth, `${oldName}.pug`), path.join(pth, `${name}.pug`)) : undefined),
            ])

            return true
          }
        }  
      }
      return false
    })()
    
    if (!wasRename) {
      console.log(`No rename for ${name}`)
      await delay(150)
      if ((await fs.readdir(pth)).length !== 0) return
      console.log(`Make component ${name}`)
  
      await makeComponent(parentPath, name)
    }
    
  })
  .on("unlinkDir", async (pth) => {
    const splitPath = pth.split("/")
    const name = splitPath.pop()!
    const parentPath = splitPath.join("/")

    const el = justRemovedList.push({path: path.resolve(parentPath), name})
    delay(50).then(() => {
      el.rm()
    }) 
  })



function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}


async function isAsyncIterableEmpty(ai: AsyncIterable<any>) {
  for await (let _ of ai) {
    return false; // if there's at least one value, it's not empty
  }
  return true; // if we exited the loop, there were no values so it's empty
}

const fileExists = async (filename: string): Promise<boolean> => {
  try {
    await fs.access(filename);
    return true;
  } catch (error) {
    return false;
  }
};

function isEmpty(a: any[]) {
  return a.length === 0
}


async function someAsync<T>(arr: Iterable<T> | AsyncIterable<T>, asyncTest: (item: T) => (Promise<boolean> | boolean)): Promise<{item: T} | false> {
  for await (const item of arr) {
    if (await asyncTest(item)) {
      return { item }
    }
  }
  return false
}

