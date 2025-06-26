import { getPageName, getPluginName, getSiteProps } from "./utils";

export function updateCounterItems() {
  const pluginName = getPluginName();
  if (pluginName !== "read") {
    return;
  }
  const items = getCounterItems();
  if (items.length === 0) {
    return;
  }
  // Found async counter items
  const sitePathname = getSiteProps().base_uri_pathname;
  const pageName = getPageName();
  const url = sitePathname + "?plugin=counter&page=" + encodeURIComponent(pageName);
  fetchCounterData(url)
    .then((obj) => {
      for (const item of items) {
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
    })
    ["catch"]((err) => {
      // eslint-disable-line dot-notation
      if (window.console && console.log) {
        console.log(err);
        console.log("Error! Please check JavaScript console\n" + JSON.stringify(err) + "|" + err);
      }
    });
}

type CounterData = {
  page: string;
  total: string;
  today: string;
  yesterday: string;
};

async function fetchCounterData(url: string): Promise<CounterData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return response.json() as Promise<CounterData>;
}

function getCounterItems(root: HTMLElement = document.documentElement): HTMLElement[] {
  return Array.from(root.querySelectorAll("._plugin_counter_item"));
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("getCounterItems", () => {
    it("should return an empty array when no counter items are present", () => {
      const root = document.createElement("div");
      expect(getCounterItems(root)).toEqual([]);
    });

    it("should return all counter items", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <span class="_plugin_counter_item _plugin_counter_item_total">100</span>
        <span class="_plugin_counter_item _plugin_counter_item_today">10</span>
        <span class="_plugin_counter_item _plugin_counter_item_yesterday">5</span>
      `;
      const items = getCounterItems(root);
      expect(items.length).toBe(3);
    });
  });
}
