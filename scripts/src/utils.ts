export type SiteProps = {
  is_utf8?: boolean;
  json_enabled?: boolean;
  show_passage?: boolean;
  base_uri_pathname?: string;
  base_uri_absolute?: string;
};

export function getSiteProps(root: HTMLElement): SiteProps | null {
  const element = root.querySelector<HTMLInputElement>("#pukiwiki-site-properties .site-props");
  const value = element?.value;
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as SiteProps;
  } catch (e) {
    return null;
  }
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("getSiteProps", () => {
    it("should return null when element does not exist", () => {
      const root = document.createElement("div");
      expect(getSiteProps(root)).toBeNull();
    });

    it("should return null when value is empty string", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input class="site-props" value="" />
        </div>
      `;
      expect(getSiteProps(root)).toBeNull();
    });

    it("should return null when value is not valid JSON", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <div id="pukiwiki-site-properties">
          <input class="site-props" value="InvalidJSON" />
        </div>
      `;
      expect(getSiteProps(root)).toBeNull();
    });

    it("should return parsed SiteProps when element exists and value is valid JSON", () => {
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
          <input class="site-props" value='${JSON.stringify(props)}' />
        </div>
      `;
      expect(getSiteProps(root)).toEqual(props);
    });
  });
}
