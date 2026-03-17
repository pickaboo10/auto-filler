/**
 * content.js — AutoFill Extension content script.
 *
 * Injected into the active tab by popup.js via chrome.scripting.executeScript.
 * fields.js is injected first, so FIELDS_CONFIG is available as a global.
 *
 * Returns a Promise that resolves with { matched, skipped }.
 */

/* eslint-disable no-undef */
// FIELDS_CONFIG is available globally from fields.js (injected before this file)

new Promise((resolve) => {
  chrome.storage.local.get("userData", (data) => {
    const userData = data && data.userData;

    // Nothing saved — bail immediately
    if (!userData || Object.keys(userData).length === 0) {
      resolve({ matched: 0, skipped: 0 });
      return;
    }

    let matched = 0;
    let skipped = 0;

    // Collect all fillable elements on the page
    const elements = document.querySelectorAll("input, textarea, select");

    elements.forEach((el) => {
      let fieldMatch = null;

      // Attributes to check (case-insensitive)
      const elName        = (el.getAttribute("name") || "").toLowerCase();
      const elId          = (el.id || "").toLowerCase();
      const elAutocomplete = (el.getAttribute("autocomplete") || "").toLowerCase();
      const elPlaceholder = (el.getAttribute("placeholder") || "").toLowerCase();

      // Try to match element against FIELDS_CONFIG by attribute variants
      for (const field of FIELDS_CONFIG) {
        // Skip fields the user hasn't filled in
        if (!userData[field.id] || userData[field.id].trim() === "") continue;

        const found = field.variants.some((variant) => {
          const v = variant.toLowerCase();
          return (
            elName === v ||
            elId === v ||
            elAutocomplete === v ||
            elPlaceholder.toLowerCase() === v ||
            // partial / contains matching
            elName.includes(v) ||
            elId.includes(v) ||
            elAutocomplete.includes(v) ||
            elPlaceholder.includes(v)
          );
        });

        if (found) {
          fieldMatch = field;
          break;
        }
      }

      // Fallback: scan associated <label> text
      if (!fieldMatch) {
        let labelText = "";

        // Check for a label linked via "for" attribute
        if (el.id) {
          const linkedLabel = document.querySelector(`label[for="${el.id}"]`);
          if (linkedLabel) {
            labelText = linkedLabel.textContent.trim().toLowerCase();
          }
        }

        // Check for a parent <label> wrapping the element
        if (!labelText) {
          const parentLabel = el.closest("label");
          if (parentLabel) {
            labelText = parentLabel.textContent.trim().toLowerCase();
          }
        }

        if (labelText) {
          for (const field of FIELDS_CONFIG) {
            if (!userData[field.id] || userData[field.id].trim() === "") continue;

            const labelMatch = field.variants.some((variant) => {
              return labelText.includes(variant.toLowerCase());
            });

            if (labelMatch) {
              fieldMatch = field;
              break;
            }
          }
        }
      }

      // If we found a matching config entry, fill the element
      if (fieldMatch) {
        const value = userData[fieldMatch.id];
        setElementValue(el, value);
        matched++;
      } else {
        skipped++;
      }
    });

    resolve({ matched, skipped });
  });

  /* -----------------------------------------------------------
     Setter helpers — use native property descriptors so that
     React / Angular / Vue change-detection picks up the update.
     ----------------------------------------------------------- */

  function setElementValue(el, value) {
    const tag  = el.tagName.toLowerCase();
    const type = (el.getAttribute("type") || "").toLowerCase();

    if (tag === "select") {
      setSelectValue(el, value);
    } else if (tag === "textarea") {
      setTextareaValue(el, value);
    } else if (type === "checkbox" || type === "radio") {
      setCheckableValue(el);
    } else {
      setInputValue(el, value);
    }
  }

  function setInputValue(el, value) {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setTextareaValue(el, value) {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setSelectValue(el, value) {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      "value"
    ).set;
    setter.call(el, value);
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setCheckableValue(el) {
    el.checked = true;
    el.dispatchEvent(new Event("click", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
});
