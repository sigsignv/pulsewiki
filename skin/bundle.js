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
    function getPageName(root = document.documentElement) {
        const element = root.querySelector("#pukiwiki-site-properties .page-name");
        if (!element) {
            throw new Error(".page-name does not exist");
        }
        return element.value;
    }
    function getPluginName(root = document.documentElement) {
        const element = root.querySelector("#pukiwiki-site-properties .plugin-name");
        if (!element) {
            throw new Error(".plugin-name does not exist");
        }
        return element.value;
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

    function updateCounterItems() {
        const pluginName = getPluginName();
        if (pluginName !== "read") {
            return;
        }
        if (!document.querySelector("._plugin_counter_item"))
            return;
        // Found async counter items
        const sitePathname = getSiteProps().base_uri_pathname;
        const pageName = getPageName();
        const url = sitePathname + "?plugin=counter&page=" + encodeURIComponent(pageName);
        fetch(url, { credentials: "same-origin" })
            .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.status + ": " + response.statusText + " on " + url);
        })
            .then((obj) => {
            showCounterItems(obj);
        })["catch"]((err) => {
            // eslint-disable-line dot-notation
            if (window.console && console.log) {
                console.log(err);
                console.log("Error! Please check JavaScript console\n" + JSON.stringify(err) + "|" + err);
            }
        });
        function showCounterItems(obj) {
            const items = document.querySelectorAll("._plugin_counter_item");
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.classList.contains("_plugin_counter_item_total")) {
                    item.textContent = obj.total;
                }
                if (item.classList.contains("_plugin_counter_item_today")) {
                    item.textContent = obj.today;
                }
                if (item.classList.contains("_plugin_counter_item_yesterday")) {
                    item.textContent = obj.yesterday;
                }
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        autofillCommentName();
        updateCounterItems();
    });

})();
