export function keepCommentUserName() {
  setYourName();
}

class UsernameStore {
  constructor(public key: string) {}

  getName(): string {
    return localStorage.getItem(this.key) ?? "";
  }

  setName(name: string): void {
    localStorage.setItem(this.key, name);
  }

  static fromBasePath(basePath: string): UsernameStore {
    const key = `path.${basePath}.pukiwiki_comment_plugin_name`;
    return new UsernameStore(key);
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
  let actionPathname = null;
  function getPathname(formAction) {
    if (actionPathname) return actionPathname;
    try {
      const u = new URL(formAction, document.location);
      const u2 = new URL("./", u);
      actionPathname = u2.pathname;
      return u2.pathname;
    } catch (e) {
      // Note: Internet Explorer doesn't support URL class
      const m = formAction.match(/^https?:\/\/([^/]+)(\/([^?&]+\/)?)/);
      if (m) {
        actionPathname = m[2]; // pathname
      } else {
        actionPathname = "/";
      }
      return actionPathname;
    }
  }
  function getForm(element) {
    if (element.form && element.form.tagName === "FORM") {
      return element.form;
    }
    let e = element.parentElement;
    for (let i = 0; i < 5; i++) {
      if (e.tagName === "FORM") {
        return e;
      }
      e = e.parentElement;
    }
    return null;
  }
  function handleCommentPlugin(form) {
    const pathName = getPathname(form.action);
    const store = UsernameStore.fromBasePath(pathName);
    const namePrevious = store.getName();

    const onFocusForm = () => {
      if (form.name && !form.name.value && namePrevious) {
        form.name.value = namePrevious;
      }
    };
    const addOnForcusForm = (eNullable) => {
      if (!eNullable) return;
      if (eNullable.addEventListener) {
        eNullable.addEventListener("focus", onFocusForm);
      }
    };
    if (namePrevious) {
      const textList = form.querySelectorAll("input[type=text],textarea");
      textList.forEach((v) => {
        addOnForcusForm(v);
      });
    }
    form.addEventListener(
      "submit",
      () => {
        store.setName(form.name.value);
      },
      false,
    );
  }
  function setNameForComment() {
    if (!document.querySelectorAll) return;
    const elements = getCommentPluginElements(document.documentElement);
    for (let i = 0; i < elements.length; i++) {
      const form = getForm(elements[i]);
      if (form) {
        handleCommentPlugin(form);
      }
    }
  }
  setNameForComment();
}

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest;

  describe("UsernameStore", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should return empty string when name is not saved", () => {
      const store = new UsernameStore("test_key");
      expect(store.getName()).toBe("");
    });

    it("should return the saved name when name is saved", () => {
      const store = new UsernameStore("test_key");
      store.setName("Alice");
      expect(store.getName()).toBe("Alice");
    });

    it("should return the new name when saving again", () => {
      const store = new UsernameStore("test_key");
      store.setName("Alice");
      store.setName("Bob");
      expect(store.getName()).toBe("Bob");
    });

    it("should return the correct name for each key", () => {
      const store1 = new UsernameStore("test_key1");
      const store2 = new UsernameStore("test_key2");
      store1.setName("Alice");
      store2.setName("Bob");
      expect(store1.getName()).toBe("Alice");
      expect(store2.getName()).toBe("Bob");
    });

    it("should create correct key with fromBasePath", () => {
      const store = UsernameStore.fromBasePath("/wiki/");
      expect(store.key).toBe("path./wiki/.pukiwiki_comment_plugin_name");
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
