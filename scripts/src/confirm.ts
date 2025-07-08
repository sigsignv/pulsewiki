export function confirmEdit() {
  confirmEditFormLeaving();
}

function confirmEditFormLeaving() {
  let canceled = false;
  const pluginNameE = document.querySelector("#pukiwiki-site-properties .plugin-name");
  if (!pluginNameE) return;
  let originalText = null;
  if (pluginNameE.value !== "edit") return;
  const editForm = document.querySelector(".edit_form form._plugin_edit_edit_form");
  if (!editForm) return;
  const cancelMsgE = editForm.querySelector("#_msg_edit_cancel_confirm");
  const unloadBeforeMsgE = editForm.querySelector("#_msg_edit_unloadbefore_message");
  const textArea = editForm.querySelector('textarea[name="msg"]');
  if (!textArea) return;
  originalText = textArea.value;
  let isPreview = false;
  const inEditE = document.querySelector("#pukiwiki-site-properties .page-in-edit");
  if (inEditE && inEditE.value) {
    isPreview = inEditE.value === "true";
  }
  const cancelForm = document.querySelector(".edit_form form._plugin_edit_cancel");
  let submited = false;
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
  window.addEventListener(
    "beforeunload",
    (e) => {
      if (canceled) return;
      if (submited) return;
      if (!isPreview) {
        if (trimString(textArea.value) === trimString(originalText)) return;
      }
      let message = "Data you have entered will not be saved.";
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
