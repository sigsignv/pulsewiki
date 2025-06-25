import { getSiteProps } from "./utils";

export function keepCommentUserName() {
  const pathName = getSiteProps(document.documentElement).base_uri_pathname;
  const store = CommentNameStore.fromBasePath(pathName);
  const forms = getCommentPluginForms(document.documentElement);
  for (const form of forms) {
    restoreCommentName(form, store);
    saveCommentName(form, store);
  }
}

class CommentNameStore {
  constructor(public key: string) {}

  get name(): string {
    return localStorage.getItem(this.key) ?? "";
  }

  set name(value: string) {
    localStorage.setItem(this.key, value);
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  static fromBasePath(basePath: string): CommentNameStore {
    const key = `path.${basePath}.pukiwiki_comment_plugin_name`;
    return new CommentNameStore(key);
  }
}

class CommentForm {
  constructor(public form: HTMLFormElement) {}

  #nameElement(): HTMLInputElement {
    const name = this.form.elements.namedItem("name");
    if (name && name instanceof HTMLInputElement) {
      return name;
    }
    throw new Error("input[name='name'] not found");
  }

  get name(): string {
    return this.#nameElement().value;
  }

  set name(value: string) {
    this.#nameElement().value = value;
  }
}

function getCommentPluginForms(root: HTMLElement): HTMLFormElement[] {
  const selector = ["comment", "pcomment", "article", "bugtrack"]
    .map((value) => `input[type="hidden"][name="plugin"][value="${value}"]`)
    .join(",");

  return Array.from(root.querySelectorAll<HTMLInputElement>(selector))
    .map((input) => input.form)
    .filter((form) => form !== null);
}

function restoreCommentName(formElement: HTMLFormElement, store: CommentNameStore) {
  const restore = () => {
    const form = new CommentForm(formElement);
    if (form.name === "") {
      form.name = store.name;
    }
  };
  formElement.addEventListener("focusin", restore, { once: true });
}

function saveCommentName(formElement: HTMLFormElement, store: CommentNameStore) {
  const save = () => {
    const form = new CommentForm(formElement);
    if (form.name === "") {
      store.clear();
    } else {
      store.name = form.name;
    }
  };
  formElement.addEventListener("submit", save, { once: true });
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

    it("should clear the saved name when clear is called", () => {
      const store = new CommentNameStore("test_key");
      store.name = "Alice";
      store.clear();
      expect(store.name).toBe("");
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

  describe("CommentForm", () => {
    const createForm = () => {
      const formElement = document.createElement("form");
      const nameElement = document.createElement("input");
      nameElement.type = "text";
      nameElement.name = "name";
      formElement.appendChild(nameElement);
      return { formElement, nameElement };
    };

    it("should get the name value from the form", () => {
      const { formElement, nameElement } = createForm();
      nameElement.value = "Alice";
      const form = new CommentForm(formElement);
      expect(form.name).toBe("Alice");
    });

    it("should set the name value to the form", () => {
      const { formElement, nameElement } = createForm();
      const form = new CommentForm(formElement);
      form.name = "Bob";
      expect(nameElement.value).toBe("Bob");
    });

    it("should throw if input[name='name'] is not found", () => {
      const formWithoutName = document.createElement("form");
      const form = new CommentForm(formWithoutName);
      expect(() => form.name).toThrow("input[name='name'] not found");
    });
  });

  describe("getCommentPluginForms", () => {
    it("should return an empty array when no elements match", () => {
      const root = document.createElement("div");
      const result = getCommentPluginForms(root);
      expect(result).toEqual([]);
    });

    it("should return matching input elements", () => {
      const root = document.createElement("div");
      root.innerHTML = `
        <form>
          <input type="hidden" name="plugin" value="comment" />
        </form>
        <form>
          <input type="hidden" name="plugin" value="pcomment" />
        </form>
        <form>
          <input type="hidden" name="plugin" value="article" />
        </form>
        <form>
          <input type="hidden" name="plugin" value="bugtrack" />
        </form>
      `;
      const result = getCommentPluginForms(root);
      expect(result.length).toBe(4);
    });
  });
}
