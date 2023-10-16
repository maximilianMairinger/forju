import Component from "../_component/component";

const byMe = Symbol()

/**
 * Declare new Component and append it to the customElementRegitry
 * @param name Name of the component, how it should be refelected in the dom (when not starting with "c-", "c-" will be prefixed) 
 * @param component The component class; observedAttributes will be injected automatically
 */
export function declareComponent<Comp>(name: string, component: Comp){
  //@ts-ignore
  const observedAttributes = component.observedAttributes
  if (!observedAttributes || observedAttributes[byMe]) {
    //Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(component).prototype))
    let attrbs = []
    attrbs[byMe] = true
    let cur = component

    const attrIndex = {} as any
    const attrSetFunc = function (attrName: string, oldVal: string, newVal: string) {
      this[attrIndex[attrName]](newVal)
    }

    //@ts-ignore
    while (cur.prototype instanceof Component) {
      //@ts-ignore
      let localAttrbs = Object.getOwnPropertyNames(cur.prototype)
      
      //@ts-ignore
      cur.prototype.attributeChangedCallback = attrSetFunc
      for (let i = 0; i < localAttrbs.length; i++) {
        const lc = localAttrbs[i].toLowerCase()
        attrIndex[lc] = localAttrbs[i]
        localAttrbs[i] = lc
      }

      attrbs.add(...localAttrbs)
      cur = Object.getPrototypeOf(cur)
      
    }


    //@ts-ignore
    component.observedAttributes = attrbs.rmV("constructor", "stl", "pug")
  }

  if (!name.startsWith("c-")) name = "c-" + name
  //@ts-ignore
  window.customElements.define(name, component)

  return component as Comp
}

function isLowerCase(myString) { 
  return (myString == myString.toLowerCase()); 
} 

export default declareComponent
