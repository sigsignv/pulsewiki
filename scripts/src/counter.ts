export function updateCounterItems() {
  if (!isEnabledFetchFunctions()) return;
  var propRoot = document.querySelector("#pukiwiki-site-properties");
  if (!propRoot) return;
  var propsE = propRoot.querySelector(".site-props");
  if (!propsE || !propsE.value) return;
  var siteProps = JSON.parse(propsE.value);
  var sitePathname = siteProps && siteProps.base_uri_pathname;
  if (!sitePathname) return;
  var pluginNameE = propRoot.querySelector(".plugin-name");
  if (!pluginNameE) return;
  if (pluginNameE.value !== "read") {
    return;
  }
  var pageNameE = propRoot.querySelector(".page-name");
  if (!pageNameE) return;
  var pageName = pageNameE.value;
  if (!document.querySelector("._plugin_counter_item")) return;
  // Found async counter items
  var url = sitePathname + "?plugin=counter&page=" + encodeURIComponent(pageName);
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
    var items = document.querySelectorAll("._plugin_counter_item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
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
  function isEnabledFetchFunctions() {
    if (window.fetch && document.querySelector && window.JSON) {
      return true;
    }
    return false;
  }
}
