(function () {
    'use strict';

    function getSiteProps(root = document.documentElement) {
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

    function autofillCommentName() {
        const pathName = getSiteProps().base_uri_pathname;
        const store = CommentNameStore.fromBasePath(pathName);
        for (const formElement of getCommentPluginForms()) {
            const form = new CommentForm(formElement);
            const restoreOnFocus = () => {
                if (form.name === "") {
                    form.name = store.name;
                }
            };
            formElement.addEventListener("focusin", restoreOnFocus, { once: true });
            const saveOnSubmit = () => {
                if (form.name === "") {
                    store.clear();
                }
                else {
                    store.name = form.name;
                }
            };
            formElement.addEventListener("submit", saveOnSubmit, { once: true });
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
    function getCommentPluginForms(root = document.documentElement) {
        const selector = ["comment", "pcomment", "article", "bugtrack"]
            .map((value) => `input[type="hidden"][name="plugin"][value="${value}"]`)
            .join(",");
        return Array.from(root.querySelectorAll(selector))
            .map((input) => input.form)
            .filter((form) => form !== null);
    }

    document.addEventListener("DOMContentLoaded", () => {
        autofillCommentName();
    });

})();
