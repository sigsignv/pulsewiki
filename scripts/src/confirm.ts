import { getIsPreview, getPluginName } from "./utils";

export function confirmEdit() {
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
  if (!editForm) return;
  const cancelMsgE = editForm.querySelector("#_msg_edit_cancel_confirm");
  const textArea = editForm.querySelector('textarea[name="msg"]');
  if (!textArea) return;
  originalText = textArea.value;
  const cancelForm = document.querySelector(".edit_form form._plugin_edit_cancel");
  let submited = false;

  const confirm = (ev: BeforeUnloadEvent) => {
    if (canceled) return;
    if (submited) return;
    if (!isPreview) {
      if (trimString(textArea.value) === trimString(originalText)) return;
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
