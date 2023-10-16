type FormatOptions = {weekday?: "long" | "short", year?: "numeric", month?: "2-digit" | "long" | "short" | "numeric", day?: "2-digit" | "numeric"}


// Locals documentation https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation


function err() {
  throw new Error("Invalid Date")
}

function parseDateToLocal(dateImp: string | Date, formatOptions: any[] /*[local: string, options: FormatOptions]*/) {
  let d: Date
  if (dateImp instanceof Date) d = dateImp
  else {
    const l = dateImp.split(".")
    if (l.length === 3) {
      const [ date, month, year ] = l
      d = new Date(+year, +month - 1, +date)
    }
    else if (l.length < 3) {
      if (l.length < 2) err()
      else {
        const last = +l.last
        const first = +l.first
        if (!isNaN(first) && !isNaN(last)) {
          if (last > 12) {
            delete formatOptions[1].day
            d = new Date(last, +l.first - 1)
          }
          else {
            delete formatOptions[1].year
            d = new Date(0, +last - 1, +l.first)
          }
        }
      }
    }
    else err()
    
  }
  
  if (isNaN(+d)) d = new Date(dateImp)
  if (isNaN(+d)) err()
  else return d.toLocaleDateString(...formatOptions)
}


export function constructFormat(local: string, timeZone = "Europe/Vienna", defaultFormat: FormatOptions = {day: "2-digit", month: "2-digit", year: "numeric"}) {
  return {
    formatDate(date: Date | string | Date[]/*[from: Date, until: Date]*/, format: FormatOptions = {}) { 
      const options = { ...defaultFormat, ...format, timeZone }
      try {
        if (date instanceof Array) {
          return date.map((date) => parseDateToLocal(date, [local, options])).join(" - ")
        }
        else return parseDateToLocal(date, [local, options])
      }
      catch(e) {
        return date as string
      }
      
    }
  }
}


export const AT = constructFormat("de-AT")
export const local = AT
export default local
