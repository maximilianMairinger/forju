import featureRequirementsMet from "./featureDetection"



document.addEventListener("DOMContentLoaded", async () => {
  // TODO: Extra error msg
  if (!featureRequirementsMet) return;

  document.body.innerHTML = ""

  await (await import(/* webpackChunkName: "init" */"./init")).init()
});
