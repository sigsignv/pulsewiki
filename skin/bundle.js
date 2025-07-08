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
    function getPageInfo(selector, root = document.documentElement) {
        const element = root.querySelector(`#pukiwiki-site-properties ${selector}`);
        if (!element) {
            throw new Error(`${selector} does not exist`);
        }
        return element.value;
    }
    function getPageName(root = document.documentElement) {
        return getPageInfo(".page-name", root);
    }
    function getPluginName(root = document.documentElement) {
        return getPageInfo(".plugin-name", root);
    }
    function getIsPreview(root = document.documentElement) {
        const value = getPageInfo(".page-in-edit", root);
        return value === "true";
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

    function confirmEdit() {
        confirmEditFormLeaving();
    }
    function confirmEditFormLeaving() {
        if (getPluginName() !== "edit") {
            return;
        }
        const isPreview = getIsPreview();
        let canceled = false;
        let originalText = null;
        const editForm = document.querySelector(".edit_form form._plugin_edit_edit_form");
        if (!editForm)
            return;
        const cancelMsgE = editForm.querySelector("#_msg_edit_cancel_confirm");
        const textArea = editForm.querySelector('textarea[name="msg"]');
        if (!textArea)
            return;
        originalText = textArea.value;
        const cancelForm = document.querySelector(".edit_form form._plugin_edit_cancel");
        let submited = false;
        const confirm = (ev) => {
            if (canceled)
                return;
            if (submited)
                return;
            if (!isPreview) {
                if (trimString(textArea.value) === trimString(originalText))
                    return;
            }
            const message = "Data you have entered will not be saved.";
            ev.returnValue = message;
        };
        editForm.addEventListener("submit", () => {
            canceled = false;
            submited = true;
        });
        cancelForm.addEventListener("submit", (e) => {
            submited = false;
            canceled = false;
            if (trimString(textArea.value) === trimString(originalText)) {
                canceled = true;
                return false;
            }
            let message = "The text you have entered will be discarded. Is it OK?";
            if (cancelMsgE && cancelMsgE.value) {
                message = cancelMsgE.value;
            }
            if (window.confirm(message)) {
                // eslint-disable-line no-alert
                // Execute "Cancel"
                canceled = true;
                return true;
            }
            e.preventDefault();
            return false;
        });
        window.addEventListener("beforeunload", confirm, false);
    }
    function trimString(str) {
        if (typeof str !== "string") {
            return str;
        }
        return str.trim();
    }

    function updateCounterItems() {
        const pluginName = getPluginName();
        if (pluginName !== "read") {
            return;
        }
        const items = getCounterItems();
        if (items.length === 0) {
            return;
        }
        const basePath = getSiteProps().base_uri_pathname;
        const pageName = getPageName();
        const url = `${basePath}?plugin=counter&page=${encodeURIComponent(pageName)}`;
        fetchCounterData(url)
            .then((counter) => {
            for (const item of items) {
                if (item.classList.contains("_plugin_counter_item_total")) {
                    item.textContent = counter.total;
                }
                if (item.classList.contains("_plugin_counter_item_today")) {
                    item.textContent = counter.today;
                }
                if (item.classList.contains("_plugin_counter_item_yesterday")) {
                    item.textContent = counter.yesterday;
                }
            }
        })
            .catch((err) => {
            console.error(err);
        });
    }
    async function fetchCounterData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Request failed: ${url}`);
        }
        return response.json();
    }
    function getCounterItems(root = document.documentElement) {
        return Array.from(root.querySelectorAll("._plugin_counter_item"));
    }

    document.addEventListener("DOMContentLoaded", () => {
        autofillCommentName();
        confirmEdit();
        updateCounterItems();
    });

})();
