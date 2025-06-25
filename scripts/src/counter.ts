import { getSiteProps } from "./utils";

export function updateCounterItems() {
  const propRoot = document.querySelector("#pukiwiki-site-properties");
  if (!propRoot) return;
  const pluginNameE = propRoot.querySelector(".plugin-name");
  if (!pluginNameE) return;
  if (pluginNameE.value !== "read") {
    return;
  }
  const pageNameE = propRoot.querySelector(".page-name");
  if (!pageNameE) return;
  const pageName = pageNameE.value;
  if (!document.querySelector("._plugin_counter_item")) return;
  // Found async counter items
  const sitePathname = getSiteProps().base_uri_pathname;
  const url = sitePathname + "?plugin=counter&page=" + encodeURIComponent(pageName);
  fetch(url, { credentials: "same-origin" })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.status + ": " + response.statusText + " on " + url);
    })
    .then((obj) => {
      showCounterItems(obj);
    })
    ["catch"]((err) => {
      // eslint-disable-line dot-notation
      if (window.console && console.log) {
        console.log(err);
        console.log("Error! Please check JavaScript console\n" + JSON.stringify(err) + "|" + err);
      }
    });
  function showCounterItems(obj) {
    const items = document.querySelectorAll("._plugin_counter_item");
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.classList.contains("_plugin_counter_item_total")) {
        item.textContent = obj.total;
      }
      if (item.classList.contains("_plugin_counter_item_today")) {
        item.textContent = obj.today;
      }
      if (item.classList.contains("_plugin_counter_item_yesterday")) {
        item.textContent = obj.yesterday;
      }
    }
  }
}
