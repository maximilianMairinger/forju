import "../global"
import lang from "./../lib/lang"
import { DataBase, Data } from "josm";
import { ElementList, ElementListOrElement, PrimElem, VariableLibrary } from "extended-dom";

type Token = string | string[]

export default abstract class Component<T extends HTMLElement | HTMLAnchorElement | false | never = HTMLElement> extends HTMLElement {
  protected sr: ShadowRoot;
  protected componentBody: T extends (HTMLElement | HTMLAnchorElement) ? T : T extends false ? ShadowRoot : HTMLElement
  protected body: any = {}


  constructor(bodyExtension?: T, indexName = true) {
    super();
    this.sr = this.attachShadow({mode: "open"});

    
    if (bodyExtension !== false) {
      //@ts-ignore
      this.componentBody = bodyExtension !== undefined ? bodyExtension : ce("component-body")


      this.sr.html("<style>" + this.stl() + "</style>")
      this.sr.append(this.componentBody as HTMLElement)
    }
    else {
      //@ts-ignore
      this.componentBody = this.sr
      this.sr.html("<style>" + this.stl() + "</style>")
    }
    this.componentBody.apd(this.pug(), lang as any)


    if (indexName) {
      this.componentBody.childs("*", true).ea((e: any) => {
        const name = e.getAttribute("name")
        if (name !== undefined) {
          if (this.body[name] === undefined) this.body[name] = e
          else if (this.body[name] instanceof ElementList) (this.body[name] as ElementList).add(e)
          else this.body[name] = new ElementList(this.body[name], e)
  
  
        }
      })
    }
  }


  public stl(): string {
    return require('./component.css').toString()
  }
  public abstract pug(): string
  /**
   * Appends to ShadowRoot
   */
  public sra(...elems: HTMLElement[]): void {
    elems.ea((e) => {
      this.sr.append(e);
    });
  }


  /**
   * Gets children matching given css-selector
   * @param selector css-selector filter childs similar to document.querySelector
   * @param alwaysReturnElementList when true, always return a ELementList instead of defaulting to a single instance when the query does only math once (defaults to false)
   */
  public q(selector: string, alwaysReturnElementList: true): ElementList<Element>
  /**
   * Gets children matching given css-selector
   * @param selector css-selector filter childs similar to document.querySelector
   * @param alwaysReturnElementList when true, always return a ELementList instead of defaulting to a single instance when the query does only math once (defaults to false)
   */
  public q(selector: string, alwaysReturnElementList?: boolean): ElementListOrElement
  public q(qs?: string, alwaysReturnElementList?: boolean) {
    return this.componentBody.childs(qs, alwaysReturnElementList)
  }
  public apd(...elems: PrimElem[]): this
  public apd(to: PrimElem | PrimElem[], library?: VariableLibrary, customTokens?: {open?: Token, close?: Token, escape?: Token}): this
  public apd(...a: any): this {
    this.componentBody.apd(...a)
    return this
  }

}



/*
import Component from "../component"
import declareComponent from "../../../lib/declareComponent"

export default class Example extends Component {

  constructor() {
    super()


  }

  stl() {
    return require("./example.css").toString()
  }
  pug() {
    return require("./example.pug").default
  }
}

declareComponent("example", Example)

*/
