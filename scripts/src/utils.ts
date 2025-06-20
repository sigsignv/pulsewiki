export type SiteProps = {
  is_utf8: boolean;
  json_enabled: boolean;
  show_passage: boolean;
  base_uri_pathname: string;
  base_uri_absolute: string;
};

export function getSiteProps(root: HTMLElement): SiteProps {
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
}
