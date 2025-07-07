export function confirmEdit() {
  confirmEditFormLeaving();
}

function confirmEditFormLeaving() {
  function trim(s) {
    if (typeof s !== "string") {
      return s;
    }
    return s.replace(/^\s+|\s+$/g, "");
  }
  var canceled = false;
  var pluginNameE = document.querySelector("#pukiwiki-site-properties .plugin-name");
  if (!pluginNameE) return;
  var originalText = null;
  if (pluginNameE.value !== "edit") return;
  var editForm = document.querySelector(".edit_form form._plugin_edit_edit_form");
  if (!editForm) return;
  var cancelMsgE = editForm.querySelector("#_msg_edit_cancel_confirm");
  var unloadBeforeMsgE = editForm.querySelector("#_msg_edit_unloadbefore_message");
  var textArea = editForm.querySelector('textarea[name="msg"]');
  if (!textArea) return;
  originalText = textArea.value;
  var isPreview = false;
  var inEditE = document.querySelector("#pukiwiki-site-properties .page-in-edit");
  if (inEditE && inEditE.value) {
    isPreview = inEditE.value === "true";
  }
  var cancelForm = document.querySelector(".edit_form form._plugin_edit_cancel");
  var submited = false;
  editForm.addEventListener("submit", () => {
    canceled = false;
    submited = true;
  });
  cancelForm.addEventListener("submit", (e) => {
    submited = false;
    canceled = false;
    if (trim(textArea.value) === trim(originalText)) {
      canceled = true;
      return false;
    }
    var message = "The text you have entered will be discarded. Is it OK?";
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
  window.addEventListener(
    "beforeunload",
    (e) => {
      if (canceled) return;
      if (submited) return;
      if (!isPreview) {
        if (trim(textArea.value) === trim(originalText)) return;
      }
      var message = "Data you have entered will not be saved.";
      if (unloadBeforeMsgE && unloadBeforeMsgE.value) {
        message = unloadBeforeMsgE.value;
      }
      e.returnValue = message;
    },
    false,
  );
}
