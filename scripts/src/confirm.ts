export function confirmEdit() {
  confirmEditFormLeaving();
}

function confirmEditFormLeaving() {
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
    if (trimString(textArea.value) === trimString(originalText)) {
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
        if (trimString(textArea.value) === trimString(originalText)) return;
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

function trimString(str: string) {
  if (typeof str !== "string") {
    return str;
  }
  return str.trim();
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("trimString", () => {
    it("should trim leading and trailing spaces", () => {
      expect(trimString("No Spaces")).toBe("No Spaces");
      expect(trimString("  With Spaces  ")).toBe("With Spaces");
      expect(trimString("\n\n  With New Lines  \n\n")).toBe("With New Lines");
    });

    it("should return an empty string for strings with only spaces", () => {
      expect(trimString("  ")).toBe("");
      expect(trimString("\n")).toBe("");
    });
  });
}
