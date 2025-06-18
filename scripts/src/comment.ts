export function keepCommentUserName() {
  setYourName();
}

// Name for comment
function setYourName() {
  var NAME_KEY_ID = "pukiwiki_comment_plugin_name";
  var actionPathname = null;
  function getPathname(formAction) {
    if (actionPathname) return actionPathname;
    try {
      var u = new URL(formAction, document.location);
      var u2 = new URL("./", u);
      actionPathname = u2.pathname;
      return u2.pathname;
    } catch (e) {
      // Note: Internet Explorer doesn't support URL class
      var m = formAction.match(/^https?:\/\/([^/]+)(\/([^?&]+\/)?)/);
      if (m) {
        actionPathname = m[2]; // pathname
      } else {
        actionPathname = "/";
      }
      return actionPathname;
    }
  }
  function getNameKey(form) {
    var pathname = getPathname(form.action);
    var key = "path." + pathname + "." + NAME_KEY_ID;
    return key;
  }
  function getForm(element) {
    if (element.form && element.form.tagName === "FORM") {
      return element.form;
    }
    var e = element.parentElement;
    for (var i = 0; i < 5; i++) {
      if (e.tagName === "FORM") {
        return e;
      }
      e = e.parentElement;
    }
    return null;
  }
  function handleCommentPlugin(form) {
    var namePrevious = "";
    var nameKey = getNameKey(form);
    if (typeof localStorage !== "undefined") {
      namePrevious = localStorage[nameKey];
    }
    var onFocusForm = () => {
      if (form.name && !form.name.value && namePrevious) {
        form.name.value = namePrevious;
      }
    };
    var addOnForcusForm = (eNullable) => {
      if (!eNullable) return;
      if (eNullable.addEventListener) {
        eNullable.addEventListener("focus", onFocusForm);
      }
    };
    if (namePrevious) {
      var textList = form.querySelectorAll("input[type=text],textarea");
      textList.forEach((v) => {
        addOnForcusForm(v);
      });
    }
    form.addEventListener(
      "submit",
      () => {
        if (typeof localStorage !== "undefined") {
          localStorage[nameKey] = form.name.value;
        }
      },
      false,
    );
  }
  function setNameForComment() {
    if (!document.querySelectorAll) return;
    var elements = document.querySelectorAll(
      "input[type=hidden][name=plugin][value=comment]," +
        "input[type=hidden][name=plugin][value=pcomment]," +
        "input[type=hidden][name=plugin][value=article]," +
        "input[type=hidden][name=plugin][value=bugtrack]",
    );
    for (var i = 0; i < elements.length; i++) {
      var form = getForm(elements[i]);
      if (form) {
        handleCommentPlugin(form);
      }
    }
  }
  setNameForComment();
}
