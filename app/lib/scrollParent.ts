export function getScrollParent(node: Node, dirs: ("x" | "y")[] = ["y"]) {
  if (node == null) return document.body
  if (node instanceof ShadowRoot) return getScrollParent(node.host, dirs)
  if (!(node instanceof Element)) return getScrollParent(node.parentNode, dirs)
  

  for (const dir of dirs) {
    let overflowY = node.css(`overflow${dir.toUpperCase()}` as `overflow${"X" | "Y"}`)
    let isScrollable = overflowY !== 'visible' && overflowY !== 'hidden'
    if (isScrollable && node.scrollHeight > node.clientHeight) {
      return node
    }
  }

  return getScrollParent(node.parentNode, dirs)
}


export default getScrollParent