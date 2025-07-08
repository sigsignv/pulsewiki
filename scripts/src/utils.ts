export type SiteProps = {
  is_utf8: boolean;
  json_enabled: boolean;
  show_passage: boolean;
  base_uri_pathname: string;
  base_uri_absolute: string;
};

export function getSiteProps(root: HTMLElement = document.documentElement): SiteProps {
  const element = root.querySelector<HTMLInputElement>("#pukiwiki-site-properties .site-props");
  if (!element || !element.value) {
    throw new Error(".site-props does not exist");
  }

  try {
    return JSON.parse(element.value) as SiteProps;
  } catch (e) {
    throw new Error(".site-props contains invalid JSON");
  }
}

function getPageInfo(selector: string, root: HTMLElement = document.documentElement): string {
  const element = root.querySelector<HTMLInputElement>(`#pukiwiki-site-properties ${selector}`);
  if (!element) {
    throw new Error(`${selector} does not exist`);
  }

  return element.value;
}

export function getPageName(root: HTMLElement = document.documentElement): string {
  return getPageInfo(".page-name", root);
}

export function getPluginName(root: HTMLElement = document.documentElement): string {
  return getPageInfo(".plugin-name", root);
}

export function getIsPreview(root: HTMLElement = document.documentElement): boolean {
  const value = getPageInfo(".page-in-edit", root);
  return value === "true";
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("getSiteProps", () => {
    it("throws an error when the .site-props element does not exist", () => {
      const root = document.createElement("div");
      expect(() => getSiteProps(root)).toThrowError(".site-props does not exist");
    });

    it("throws an error when the .site-props value is an empty string", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="site-props" value="" />
        </div>
      `;
      expect(() => getSiteProps(root)).toThrowError(".site-props does not exist");
    });

    it("throws an error when the .site-props value is not valid JSON", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="site-props" value="InvalidJSON" />
        </div>
      `;
      expect(() => getSiteProps(root)).toThrowError(".site-props contains invalid JSON");
    });

    it("returns parsed SiteProps when the element exists and value is valid JSON", () => {
      const props = {
        is_utf8: true,
        json_enabled: true,
        show_passage: true,
        base_uri_pathname: "/wiki/",
        base_uri_absolute: "https://example.com/wiki/",
      };
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="site-props" value='${JSON.stringify(props)}' />
        </div>
      `;
      expect(getSiteProps(root)).toEqual(props);
    });
  });

  describe("getPluginName", () => {
    it("throws an error when the .plugin-name element does not exist", () => {
      const root = document.createElement("div");
      expect(() => getPluginName(root)).toThrowError(".plugin-name does not exist");
    });

    it("returns the plugin name when the .plugin-name element exists", () => {
      const pluginName = "read";
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="plugin-name" value="${pluginName}" />
        </div>
      `;
      expect(getPluginName(root)).toBe(pluginName);
    });
  });

  describe("getPageName", () => {
    it("throws an error when the .page-name element does not exist", () => {
      const root = document.createElement("div");
      expect(() => getPageName(root)).toThrowError(".page-name does not exist");
    });

    it("returns the page name when the .page-name element exists", () => {
      const pageName = "FrontPage";
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="page-name" value="${pageName}" />
        </div>
      `;
      expect(getPageName(root)).toBe(pageName);
    });
  });

  describe("getIsPreview", () => {
    it("throws an error when the .page-in-edit element does not exist", () => {
      const root = document.createElement("div");
      expect(() => getIsPreview(root)).toThrowError(".page-in-edit does not exist");
    });

    it("returns true when .page-in-edit value is 'true'", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="page-in-edit" value="true" />
        </div>
      `;
      expect(getIsPreview(root)).toBe(true);
    });

    it("returns false when .page-in-edit value is not 'true'", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input type="hidden" class="page-in-edit" value="false" />
        </div>
      `;
      expect(getIsPreview(root)).toBe(false);
    });
  });
}
