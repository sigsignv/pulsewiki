(function () {
    'use strict';

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
    }
    // Name for comment
    function setYourName() {
        const NAME_KEY_ID = "pukiwiki_comment_plugin_name";
        let actionPathname = null;
        function getPathname(formAction) {
            if (actionPathname)
                return actionPathname;
            try {
                const u = new URL(formAction, document.location);
                const u2 = new URL("./", u);
                actionPathname = u2.pathname;
                return u2.pathname;
            }
            catch (e) {
                // Note: Internet Explorer doesn't support URL class
                const m = formAction.match(/^https?:\/\/([^/]+)(\/([^?&]+\/)?)/);
                if (m) {
                    actionPathname = m[2]; // pathname
                }
                else {
                    actionPathname = "/";
                }
                return actionPathname;
            }
        }
        function getNameKey(form) {
            const pathname = getPathname(form.action);
            const key = "path." + pathname + "." + NAME_KEY_ID;
            return key;
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
            const nameKey = getNameKey(form);
            const store = new UsernameStore(nameKey);
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
            if (!document.querySelectorAll)
                return;
            const elements = document.querySelectorAll("input[type=hidden][name=plugin][value=comment]," +
                "input[type=hidden][name=plugin][value=pcomment]," +
                "input[type=hidden][name=plugin][value=article]," +
                "input[type=hidden][name=plugin][value=bugtrack]");
            for (let i = 0; i < elements.length; i++) {
                const form = getForm(elements[i]);
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
