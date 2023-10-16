import Site from "./_component/site/site"

export default function() {
  let site = new Site()

  document.body.append(site)
}