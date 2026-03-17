/**
 * popup.js — AutoFill Extension popup logic.
 *
 * Handles:
 *  - Loading / saving user data via chrome.storage.local
 *  - Rendering the empty-state form and the filled-state field rows
 *  - Copy, Edit, Save-Edit, Cancel, and Delete actions per field
 *  - Auto-fill trigger via chrome.scripting.executeScript
 *  - Feedback bar display
 */

/* -------------------------------------------------------
   DOM references
   ------------------------------------------------------- */
const emptyState   = document.getElementById("empty-state");
const filledState  = document.getElementById("filled-state");
const dataForm     = document.getElementById("data-form");
const autofillBtn  = document.getElementById("autofill-btn");
const feedbackBar  = document.getElementById("feedback-bar");

/* -------------------------------------------------------
   Helpers
   ------------------------------------------------------- */

/** Show / hide the two UI states */
function showEmpty() {
  emptyState.classList.remove("hidden");
  filledState.classList.add("hidden");
}

function showFilled() {
  emptyState.classList.add("hidden");
  filledState.classList.remove("hidden");
}

/**
 * Render all saved fields into the filled-state view.
 * Only shows rows whose value is non-empty.
 */
function renderFields(userData) {
  let hasAny = false;

  FIELDS_CONFIG.forEach((field) => {
    const row = document.getElementById(`field-${field.id}`);
    if (!row) return;

    const value = userData[field.id];
    if (value && value.trim() !== "") {
      hasAny = true;
      row.classList.remove("hidden");

      // Populate display value
      const valueSpan = document.getElementById(`value-${field.id}`);
      if (valueSpan) valueSpan.textContent = value;
    } else {
      row.classList.add("hidden");
    }
  });

  if (hasAny) {
    showFilled();
  } else {
    showEmpty();
  }
}

/**
 * Display a temporary feedback message below the auto-fill button.
 */
function showFeedback(matched, skipped) {
  feedbackBar.classList.remove("hidden", "success", "warning", "error");

  if (matched === 0) {
    feedbackBar.textContent = "❌ No matching fields found on this page";
    feedbackBar.classList.add("error");
  } else if (skipped > 0) {
    feedbackBar.textContent = `⚠️ ${matched} fields matched, ${skipped} fields skipped`;
    feedbackBar.classList.add("warning");
  } else {
    feedbackBar.textContent = `✅ ${matched} fields filled successfully`;
    feedbackBar.classList.add("success");
  }

  setTimeout(() => {
    feedbackBar.classList.add("hidden");
  }, 3000);
}

/* -------------------------------------------------------
   Initialise on popup open
   ------------------------------------------------------- */
chrome.storage.local.get("userData", (result) => {
  const userData = result.userData;
  if (userData && Object.keys(userData).length > 0) {
    renderFields(userData);
  } else {
    showEmpty();
  }
});

/* -------------------------------------------------------
   Save (empty-state form)
   ------------------------------------------------------- */
dataForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const userData = {};
  FIELDS_CONFIG.forEach((field) => {
    const input = document.getElementById(`input-${field.id}`);
    if (input) {
      userData[field.id] = input.value.trim();
    }
  });

  chrome.storage.local.set({ userData }, () => {
    renderFields(userData);
  });
});

/* -------------------------------------------------------
   Filled-state actions (event delegation)
   ------------------------------------------------------- */
filledState.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const fieldId = btn.dataset.field;
  if (!fieldId) return;

  const row        = document.getElementById(`field-${fieldId}`);
  const displayDiv = row.querySelector(".field-display");
  const editDiv    = row.querySelector(".field-edit");
  const valueSpan  = document.getElementById(`value-${fieldId}`);
  const editInput  = editDiv ? editDiv.querySelector(".edit-input") : null;

  /* --- Copy --- */
  if (btn.classList.contains("btn-copy")) {
    const text = valueSpan ? valueSpan.textContent : "";
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    });
    return;
  }

  /* --- Edit --- */
  if (btn.classList.contains("btn-edit")) {
    if (editInput && valueSpan) {
      editInput.value = valueSpan.textContent;
    }
    displayDiv.classList.add("hidden");
    editDiv.classList.remove("hidden");
    row.classList.add("active-edit");
    return;
  }

  /* --- Save Edit --- */
  if (btn.classList.contains("btn-save-edit")) {
    const newValue = editInput ? editInput.value.trim() : "";

    chrome.storage.local.get("userData", (result) => {
      const userData = result.userData || {};
      userData[fieldId] = newValue;

      chrome.storage.local.set({ userData }, () => {
        if (valueSpan) valueSpan.textContent = newValue;
        editDiv.classList.add("hidden");
        displayDiv.classList.remove("hidden");
        row.classList.remove("active-edit");
      });
    });
    return;
  }

  /* --- Cancel --- */
  if (btn.classList.contains("btn-cancel")) {
    editDiv.classList.add("hidden");
    displayDiv.classList.remove("hidden");
    row.classList.remove("active-edit");
    return;
  }

  /* --- Delete --- */
  if (btn.classList.contains("btn-delete")) {
    chrome.storage.local.get("userData", (result) => {
      const userData = result.userData || {};
      delete userData[fieldId];

      chrome.storage.local.set({ userData }, () => {
        row.remove();

        // If no fields remain, go back to empty state
        const remaining = filledState.querySelectorAll(".field-row:not(.hidden)");
        if (remaining.length === 0) {
          showEmpty();
        }
      });
    });
    return;
  }
});

/* -------------------------------------------------------
   Auto-fill button
   ------------------------------------------------------- */
autofillBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting
      .executeScript({
        target: { tabId: tabs[0].id },
        files: ["fields.js", "content.js"],
      })
      .then((results) => {
        const result = results[0] && results[0].result;
        if (result === null || result === undefined) {
          showFeedback(0, 0);
        } else {
          showFeedback(result.matched, result.skipped);
        }
      })
      .catch(() => {
        showFeedback(0, 0);
      });
  });
});
