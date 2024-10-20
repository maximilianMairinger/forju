import { Data, ReadonlyData } from "josm"


export function parseEscapedValues(text: string): string
export function parseEscapedValues(text: ReadonlyData<string>): Data<string>
export function parseEscapedValues(text: string | ReadonlyData<string>): string | Data<string>
export function parseEscapedValues(text: string | ReadonlyData<string>) {
  if (typeof text === "string") return parseEscapedValuesTxt(text)
  else return (text as ReadonlyData<string>).tunnel(parseEscapedValuesTxt)
}

function parseEscapedValuesTxt(text: string) { 
  text = text
    //@ts-ignore
    .replaceAll("\\u00AD", "\u00AD")
    .replaceAll("&shy;", "\u00AD")

  return text
}
