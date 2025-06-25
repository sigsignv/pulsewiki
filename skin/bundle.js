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
    class CommentNameHandler {
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
        getName() {
            return this.#nameElement().value;
        }
        setName(value) {
            this.#nameElement().value = value;
        }
    }
    function getCommentPluginElements(root) {
        const selector = ["comment", "pcomment", "article", "bugtrack"]
            .map((value) => `input[type="hidden"][name="plugin"][value="${value}"]`)
            .join(",");
        return Array.from(root.querySelectorAll(selector));
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
            const addOnForcusForm = (eNullable) => {
                if (!eNullable)
                    return;
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
            form.addEventListener("submit", () => {
                store.name = handler.getName();
            }, false);
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
