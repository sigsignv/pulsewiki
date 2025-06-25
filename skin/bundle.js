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
        setYourName();
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
            if (this.name !== "") {
                return;
            }
            this.#nameElement().value = value;
        }
    }
    function getCommentPluginElements(root) {
        const selector = ["comment", "pcomment", "article", "bugtrack"]
            .map((value) => `input[type="hidden"][name="plugin"][value="${value}"]`)
            .join(",");
        return Array.from(root.querySelectorAll(selector));
    }
    function restoreCommentName(formElement, store) {
        const restore = () => {
            if (store.name !== "") {
                const form = new CommentForm(formElement);
                form.name = store.name;
            }
        };
        formElement.addEventListener("focusin", restore, { once: true });
    }
    function saveCommentName(formElement, store) {
        const save = () => {
            const form = new CommentForm(formElement);
            store.name = form.name;
        };
        formElement.addEventListener("submit", save, { once: true });
    }
    // Name for comment
    function setYourName() {
        function handleCommentPlugin(form) {
            const pathName = getSiteProps(document.documentElement).base_uri_pathname;
            const store = CommentNameStore.fromBasePath(pathName);
            restoreCommentName(form, store);
            saveCommentName(form, store);
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

    document.addEventListener("DOMContentLoaded", () => {
        keepCommentUserName();
    });

})();
