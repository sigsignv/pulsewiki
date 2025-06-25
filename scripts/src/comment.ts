import { getSiteProps } from "./utils";

export function keepCommentUserName() {
  setYourName();
}

class CommentNameStore {
  constructor(public key: string) {}

  get name(): string {
    return localStorage.getItem(this.key) ?? "";
  }

  set name(value: string) {
    localStorage.setItem(this.key, value);
  }

  static fromBasePath(basePath: string): CommentNameStore {
    const key = `path.${basePath}.pukiwiki_comment_plugin_name`;
    return new CommentNameStore(key);
  }
}

class CommentNameHandler {
  constructor(public form: HTMLFormElement) {}

  #nameElement(): HTMLInputElement {
    const name = this.form.elements.namedItem("name");
    if (name && name instanceof HTMLInputElement) {
      return name;
    }
    throw new Error("input[name='name'] not found");
  }

  getName(): string {
    return this.#nameElement().value;
  }

  setName(value: string) {
    this.#nameElement().value = value;
  }
}

function getCommentPluginElements(root: HTMLElement): HTMLInputElement[] {
  const selector = ["comment", "pcomment", "article", "bugtrack"]
    .map((value) => `input[type="hidden"][name="plugin"][value="${value}"]`)
    .join(",");

  return Array.from(root.querySelectorAll<HTMLInputElement>(selector));
}

// Name for comment
function setYourName() {
  function handleCommentPlugin(form) {
    const handler = new CommentNameHandler(form);
    const pathName = getSiteProps(document.documentElement).base_uri_pathname;
    const store = CommentNameStore.fromBasePath(pathName);
    const namePrevious = store.name;

    const onFocusForm = () => {
      if (handler.getName() === "" && namePrevious) {
        handler.setName(namePrevious);
      }
    };
    if (namePrevious) {
      form.addEventListener("focusin", onFocusForm, false);
    }
    form.addEventListener(
      "submit",
      () => {
        store.name = handler.getName();
      },
      false,
    );
  }
  function setNameForComment() {
    const elements = getCommentPluginElements(document.documentElement);
    for (const elm of elements) {
      const form = elm.form;
      if (form) {
        handleCommentPlugin(form);
      }
    }
  }
  setNameForComment();
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest;

  describe("CommentNameStore", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should return empty string when name is not saved", () => {
      const store = new CommentNameStore("test_key");
      expect(store.name).toBe("");
    });

    it("should return the saved name when name is saved", () => {
      const store = new CommentNameStore("test_key");
      store.name = "Alice";
      expect(store.name).toBe("Alice");
    });

    it("should return the new name when saving again", () => {
      const store = new CommentNameStore("test_key");
      store.name = "Alice";
      store.name = "Bob";
      expect(store.name).toBe("Bob");
    });

    it("should return the correct name for each key", () => {
      const store1 = new CommentNameStore("test_key1");
      const store2 = new CommentNameStore("test_key2");
      store1.name = "Alice";
      store2.name = "Bob";
      expect(store1.name).toBe("Alice");
      expect(store2.name).toBe("Bob");
    });

    it("should create correct key with fromBasePath", () => {
      const store = CommentNameStore.fromBasePath("/wiki/");
      expect(store.key).toBe("path./wiki/.pukiwiki_comment_plugin_name");
    });
  });

  describe("CommentNameHandler", () => {
    const createForm = () => {
      const form = document.createElement("form");
      const nameElement = document.createElement("input");
      nameElement.type = "text";
      nameElement.name = "name";
      form.appendChild(nameElement);
      return { form, nameElement };
    };

    it("should get the name value from the form", () => {
      const { form, nameElement } = createForm();
      nameElement.value = "Alice";
      const handler = new CommentNameHandler(form);
      expect(handler.getName()).toBe("Alice");
    });

    it("should set the name value to the form", () => {
      const { form, nameElement } = createForm();
      const handler = new CommentNameHandler(form);
      handler.setName("Bob");
      expect(nameElement.value).toBe("Bob");
    });

    it("should throw if input[name='name'] is not found", () => {
      const formWithoutName = document.createElement("form");
      const handler = new CommentNameHandler(formWithoutName);
      expect(() => handler.getName()).toThrow("input[name='name'] not found");
    });
  });

  describe("getCommentPluginElements", () => {
    it("should return an empty array when no elements match", () => {
      const root = document.createElement("div");
      const result = getCommentPluginElements(root);
      expect(result).toEqual([]);
    });

    it("should return matching input elements", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <input type="hidden" name="plugin" value="comment">
        <input type="hidden" name="plugin" value="pcomment">
        <input type="hidden" name="plugin" value="article">
        <input type="hidden" name="plugin" value="bugtrack">
      `;
      const result = getCommentPluginElements(root);
      expect(result.length).toBe(4);
    });
  });
}
