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
    class UsernameStore {
        key;
        constructor(key) {
            this.key = key;
        }
        getName() {
            return localStorage.getItem(this.key) ?? "";
        }
        setName(name) {
            localStorage.setItem(this.key, name);
        }
        static fromBasePath(basePath) {
            const key = `path.${basePath}.pukiwiki_comment_plugin_name`;
            return new UsernameStore(key);
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
            const pathName = getSiteProps(document.documentElement).base_uri_pathname;
            const store = UsernameStore.fromBasePath(pathName);
            const namePrevious = store.getName();
            const onFocusForm = () => {
                if (form.name && !form.name.value && namePrevious) {
                    form.name.value = namePrevious;
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
                store.setName(form.name.value);
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
