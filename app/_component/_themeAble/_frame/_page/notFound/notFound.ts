import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import { dirString, domainIndex } from "../../../../../lib/domain";


// function doesResourceExsist(resource: string) {
//   return new Promise<boolean>((resolve) => {
//     fetch(resource,
//       { method: "HEAD" }
//     ).then((res) => {
//       if (res.ok) resolve(true)
//       else resolve(false)
//     })
//   })
// }

// async function* makeTextFileLineIterator(fileURL) {
//   const utf8Decoder = new TextDecoder('utf-8');
//   const response = await fetch(fileURL);
//   const reader = response.body.getReader();
//   let { value: _chunk, done: readerDone } = await reader.read();
//   let chunk = _chunk as any
//   chunk = chunk ? utf8Decoder.decode(chunk) : '';

//   const re = /\n|\r|\r\n/gm;
//   let startIndex = 0;
//   let result;

//   for (;;) {
//     let result = re.exec(chunk);
//     if (!result) {
//       if (readerDone) {
//         break;
//       }
//       let remainder = chunk.substr(startIndex);
//       ({ value: chunk, done: readerDone } = await reader.read());
//       chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
//       startIndex = re.lastIndex = 0;
//       continue;
//     }
//     yield chunk.substring(startIndex, result.index);
//     startIndex = re.lastIndex;
//   }
//   if (startIndex < chunk.length) {
//     // last line didn't end in a newline char
//     yield chunk.substr(startIndex);
//   }
// }

async function getAtLeastFirstXBytes(req: Promise<Response> | Response, x: number) {
  const reader = (await req).body.getReader();
  let bigChunk: Uint8Array 
  while(true) {
    let { value: chunk, done: readerDone } = await reader.read();
    bigChunk = chunk
    if (readerDone || chunk.length >= x) break
  }
  return bigChunk
}



// quickfix
function doesResourceExsist(resource: string) {
  const utf8Decoder = new TextDecoder('utf-8');
  const resStr = getAtLeastFirstXBytes(fetch(resource), 51).then((bytes) => utf8Decoder.decode(bytes).substr(0, 50))
  const baseStr = getAtLeastFirstXBytes(fetch("/"), 51).then((bytes) => utf8Decoder.decode(bytes).substr(0, 50))
  return Promise.all([resStr, baseStr]).then(([res, base]) => res !== base)
}


class NotFoundPage extends Page {


  protected async navigationCallback() {
    const res = (location.href.endsWith(dirString) ? location.href.slice(0, -1) : location.href) + (domainIndex.setWithTrailingSlash ? "/" : "")
    if (await doesResourceExsist(res)) {
      location.replace(res)
    }
  }

  protected activationCallback(active: boolean): void {
    
  }
  stl() {
    return super.stl() + require("./notFound.css").toString()
  }
  pug() {
    return require("./notFound.pug").default
  }

}

export default declareComponent("not-found-page", NotFoundPage)