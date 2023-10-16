import { DataBase, Data } from "josm"

type Key = string
type DefaultValType = string | number | boolean
type ObDefaultValType = {[k in Key]: DefaultValType | ObDefaultValType}
type Name = string

declare let settings: {[key in string]: any}
//@ts-ignore
window.settings = {}


export function createLocalSettings<DefaultVal extends DefaultValType>(settingsName: Name, defaultVal: Data<DefaultVal>): Data<DefaultVal>
export function createLocalSettings<Settings extends ObDefaultValType>(settingsName: Name, defaultVal: DataBase<Settings>):  DataBase<Settings>
export function createLocalSettings<DefaultVal extends DefaultValType>(settingsName: Name, defaultVal: DefaultVal): Data<DefaultVal>
export function createLocalSettings<Settings extends ObDefaultValType>(settingsName: Name, settingsDefault: Settings): DataBase<Settings>
export function createLocalSettings(settingsName: Name, settingsDefault_valDefault: DefaultValType | Data<DefaultValType> | ObDefaultValType | DataBase<ObDefaultValType>): any {
  let val: any
  try {
    val = JSON.parse(localStorage[settingsName])
  }
  catch(e) {}

  let dat: any
  if (settingsDefault_valDefault instanceof DataBase || settingsDefault_valDefault instanceof Data) {
    dat = settingsDefault_valDefault
    if (val !== undefined) {
      if (settingsDefault_valDefault instanceof Data) dat.set(val)
      else dat(val)
    }
  }
  else dat = typeof settingsDefault_valDefault === "object" || settingsDefault_valDefault === null ? new DataBase(val, settingsDefault_valDefault as any) : new Data(typeof val !== "object" ? undefined : val, settingsDefault_valDefault)

  if (dat instanceof DataBase) dat((v: any) => {
    localStorage[settingsName] = JSON.stringify(v)
  }, true, false)
  else if (dat instanceof Data) dat.get((v: any) => {
    localStorage[settingsName] = JSON.stringify(v)
  }, false)
  return settings[settingsName] = dat
}

export default createLocalSettings

