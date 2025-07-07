import { autofillCommentName } from "./comment";
import { confirmEdit } from "./confirm";
import { updateCounterItems } from "./counter";

document.addEventListener("DOMContentLoaded", () => {
  autofillCommentName();
  confirmEdit();
  updateCounterItems();
});
