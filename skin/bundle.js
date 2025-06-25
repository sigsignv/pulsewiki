(function () {
    'use strict';

    function getSiteProps(root) {
        const element = root.querySelector("#pukiwiki-site-properties .site-props");
        if (!element || !element.value) {
            throw new Error(".site-props does not exist");
        }
        try {
            return JSON.parse(element.value);
        }
        catch (e) {
            throw new Error(".site-props contains invalid JSON");
        }
    }

    function keepCommentUserName() {
        const pathName = getSiteProps(document.documentElement).base_uri_pathname;
        const store = CommentNameStore.fromBasePath(pathName);
        const forms = getCommentPluginForms(document.documentElement);
        for (const form of forms) {
            restoreCommentName(form, store);
            saveCommentName(form, store);
        }
    }
    class CommentNameStore {
        key;
        constructor(key) {
            this.key = key;
        }
        get name() {
            return localStorage.getItem(this.key) ?? "";
        }
        set name(value) {
            localStorage.setItem(this.key, value);
        }
        clear() {
            localStorage.removeItem(this.key);
        }
        static fromBasePath(basePath) {
            const key = `path.${basePath}.pukiwiki_comment_plugin_name`;
            return new CommentNameStore(key);
        }
    }
    class CommentForm {
        form;
        constructor(form) {
            this.form = form;
        }
        #nameElement() {
            const name = this.form.elements.namedItem("name");
            if (name && name instanceof HTMLInputElement) {
                return name;
            }
            throw new Error("input[name='name'] not found");
        }
        get name() {
            return this.#nameElement().value;
        }
        set name(value) {
            this.#nameElement().value = value;
        }
    }
    function getCommentPluginForms(root) {
        const selector = ["comment", "pcomment", "article", "bugtrack"]
            .map((value) => `input[type="hidden"][name="plugin"][value="${value}"]`)
            .join(",");
        return Array.from(root.querySelectorAll(selector))
            .map((input) => input.form)
            .filter((form) => form !== null);
    }
    function restoreCommentName(formElement, store) {
        const restore = () => {
            const form = new CommentForm(formElement);
            if (form.name === "") {
                form.name = store.name;
            }
        };
        formElement.addEventListener("focusin", restore, { once: true });
    }
    function saveCommentName(formElement, store) {
        const save = () => {
            const form = new CommentForm(formElement);
            if (form.name === "") {
                store.clear();
            }
            else {
                store.name = form.name;
            }
        };
        formElement.addEventListener("submit", save, { once: true });
    }

    document.addEventListener("DOMContentLoaded", () => {
        keepCommentUserName();
    });

})();
