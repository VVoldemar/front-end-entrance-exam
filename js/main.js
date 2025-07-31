import "../scss/style.scss";
import { setupPDFDownload } from "./pdf.js";

// Use global html2pdf from CDN
const html2pdf = window.html2pdf;

// Bruh just write documentation for that damn file

/**
 * CV Toolbar Application
 * Provides editing, reset, and download functionality for CV
 */

class CVToolbar {
  constructor() {
    this.isEditMode = false;
    this.originalContent = {};
    this.editableElements = [];
    this.storageKey = "cv-content-data";
    this.originalStorageKey = "cv-original-content";

    this.init();
  }

  init() {
    this.bindEvents();
    this.identifyEditableElements();
    this.storeOriginalContent();
    this.loadSavedContent();
    this.updateResetButtonState();
  }

  bindEvents() {
    document.getElementById("editBtn").addEventListener("click", (e) => {
      this.createRipple(e);
      this.toggleEditMode();
    });

    document.getElementById("resetBtn").addEventListener("click", (e) => {
      this.createRipple(e);
      this.showResetConfirmModal();
    });

    document.getElementById("downloadBtn").addEventListener("click", (e) => {
      this.createRipple(e);
      //   this.downloadPDF();
    });
  }

  identifyEditableElements() {
    const editableSelectors = [
      ".profile-info__greeting",
      ".profile-info__block-name",
      ".profile-info__block-job",
      ".lang__title",
      ".stat__title-elem",
      ".experience__title",
      ".job__info-title",
      ".job__info-notes",
      ".tool__title",
      ".education__title",
      ".card__main-title",
      ".card__main-content",
      ".card__footer",
      ".interests__title",
      ".chip__content",
      ".contact__text",
      ".contact__email",
      ".experience__card-header-date",
      ".card__header-content",
      ".tag__content",
      ".job__descr-list-item"
    ];

    this.editableElements = [];
    editableSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (!this.editableElements.includes(element)) {
          this.editableElements.push(element);
        }
      });
    });

    console.log(`Found ${this.editableElements.length} editable elements`);
  }

  // when page first loads

  storeOriginalContent() {
    try {
      const existingOriginal = localStorage.getItem(this.originalStorageKey);

      if (!existingOriginal) {
        // Store original content only if it doesn't exist
        const originalData = {};

        this.editableElements.forEach((element, index) => {
          originalData[index] = element.innerHTML;
        });

        localStorage.setItem(
          this.originalStorageKey,
          JSON.stringify(originalData)
        );
        console.log("Original content stored");
      }
      const originalData = JSON.parse(
        localStorage.getItem(this.originalStorageKey)
      );
      this.originalContent = originalData;
    } catch (error) {
      console.error("Error storing original content:", error);
    }
  }

  // from localStorage
  loadSavedContent() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const contentData = JSON.parse(savedData);

        this.editableElements.forEach((element, index) => {
          if (contentData[index] !== undefined) {
            element.innerHTML = contentData[index];
          }
        });

        console.log("Saved content loaded successfully");
      }
    } catch (error) {
      console.error("Error loading saved content:", error);
    }
  }

  saveContentToStorage() {
    try {
      const contentData = {};

      this.editableElements.forEach((element, index) => {
        contentData[index] = element.innerHTML;
      });

      localStorage.setItem(this.storageKey, JSON.stringify(contentData));
      console.log("Content saved to localStorage");
    } catch (error) {
      console.error("Error saving content:", error);
      this.showNotification("Failed to save changes", "error");
    }
  }

  clearSavedContent() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log("Saved content cleared from localStorage");
    } catch (error) {
      console.error("Error clearing saved content:", error);
    }
  }

  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.originalStorageKey);
      console.log("All data cleared from localStorage");
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  }

  showResetConfirmModal() {
    const existingModal = document.querySelector(".modal-overlay");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <span class="modal__header-icon">⚠️</span>
          <h3 class="modal__header-title">Confirm Reset</h3>
        </div>
        <div class="modal__content">
          <p class="modal__content-text">
            Are you sure you want to reset all changes? This action cannot be undone. 
            All your edits will be permanently lost and the CV will return to its original state.
          </p>
        </div>
        <div class="modal__actions">
          <button class="modal__button" id="cancelResetBtn">Cancel</button>
          <button class="modal__button modal__button--primary" id="confirmResetBtn">Reset All Changes</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    this.bindModalEvents(modal);

    // Show modal with animation
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
  }

  bindModalEvents(modal) {
    const cancelBtn = modal.querySelector("#cancelResetBtn");
    const confirmBtn = modal.querySelector("#confirmResetBtn");

    cancelBtn.addEventListener("click", (e) => {
      this.createRipple(e);
      this.hideModal(modal);
    });

    confirmBtn.addEventListener("click", (e) => {
      this.createRipple(e);
      this.hideModal(modal);
      // reset after modal is hidden
      setTimeout(() => {
        this.resetChanges();
      }, 300);
    });

    // close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hideModal(modal);
      }
    });

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        this.hideModal(modal);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }

  hideModal(modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  /**
   * @returns {boolean} true if there are changes
   */
  hasChanges() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      return savedData !== null;
    } catch (error) {
      console.error("Error checking for changes:", error);
      return false;
    }
  }

  updateResetButtonState() {
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.disabled = !this.hasChanges() || this.isEditMode;
    }
  }

  toggleEditMode() {
    const editBtn = document.getElementById("editBtn");

    if (!this.isEditMode) {
      // edit mode
      this.enterEditMode();
      editBtn.innerHTML = '<span class="toolbar__icon">💾</span>Save';
      document.body.classList.add("editing-mode");
    } else {
      // Save and exit edit mode
      this.exitEditMode();
      this.saveContentToStorage();
      editBtn.innerHTML = '<span class="toolbar__icon">✏️</span>Edit';
      document.body.classList.remove("editing-mode");
      this.showNotification("Changes saved successfully!", "success");
    }

    this.isEditMode = !this.isEditMode;
    this.updateResetButtonState();
  }

  enterEditMode() {
    // Don't overwrite original content if it's already stored
    // original content is stored once when the page loads

    this.editableElements.forEach((element, index) => {
      element.contentEditable = true;
      element.dataset.editIndex = index;
      
      // Add paste event listener to handle style cleaning
      const pasteHandler = (e) => this.handlePaste(e);
      element.addEventListener('paste', pasteHandler);
      element._pasteHandler = pasteHandler; // Store reference for cleanup
    });
  }

  exitEditMode() {
    this.editableElements.forEach((element) => {
      element.contentEditable = false;
      delete element.dataset.editIndex;
      
      // Remove paste event listener
      if (element._pasteHandler) {
        element.removeEventListener('paste', element._pasteHandler);
        delete element._pasteHandler;
      }
    });
  }

  /**
   * Handle paste event to clean styles from pasted content
   * @param {ClipboardEvent} event - Paste event
   */
  handlePaste(event) {
    // Prevent default paste behavior
    event.preventDefault();
    
    // Get the pasted text without formatting
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    
    if (pastedText) {
      // Get current selection
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0) {
        // Delete current selection if any
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create text node with plain text (no formatting)
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);
        
        // Move cursor to the end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, just append to the end
        const target = event.target;
        target.appendChild(document.createTextNode(pastedText));
      }
    }
  }

  resetChanges() {
    if (Object.keys(this.originalContent).length === 0) {
      this.showNotification("No original content found", "warning");
      return;
    }

    this.editableElements.forEach((element, index) => {
      if (this.originalContent[index] !== undefined) {
        element.innerHTML = this.originalContent[index];
      }
    });

    this.clearSavedContent();

    this.updateResetButtonState();

    this.showNotification("All changes have been reset", "info");
  }

  downloadPDF() {
    const downloadBtn = document.getElementById("downloadBtn");
    const originalContent = downloadBtn.innerHTML;

    // Show loading state
    downloadBtn.classList.add("toolbar__button--loading");
    downloadBtn.innerHTML = "<span>Processing...</span>";
    downloadBtn.disabled = true;

    try {
      // Get the CV content area
      const element = document.querySelector(".center");
      if (!element) {
        throw new Error("CV content not found");
      }

      // Temporarily hide toolbar and notifications for cleaner PDF
      const toolbar = document.querySelector(".toolbar");
      const notifications = document.querySelectorAll(".notification");
      const modals = document.querySelectorAll(".modal-overlay");

      const elementsToHide = [toolbar, ...notifications, ...modals].filter(
        (el) => el
      );
      elementsToHide.forEach((el) => (el.style.display = "none"));

      // Get exact dimensions of the element
      const width = element.offsetWidth + 2;
      const height = element.offsetHeight + 5;

      // PDF configuration with exact element dimensions
      const opt = {
        margin: [0, 0, 0, 0],
        filename: "CV-Resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 10,
          useCORS: true,
          allowTaint: true,
        },
        jsPDF: {
          unit: "px",
          format: [width, height],
          orientation: "portrait",
        },
      };

      // Generate PDF
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          // Restore hidden elements
          elementsToHide.forEach((el) => (el.style.display = ""));

          // Reset button state
          downloadBtn.classList.remove("toolbar__button--loading");
          downloadBtn.innerHTML = originalContent;
          downloadBtn.disabled = false;

          // Show success notification
          this.showNotification("✅ CV downloaded successfully!", "success");
        })
        .catch((error) => {
          console.error("PDF generation error:", error);

          // Restore hidden elements
          elementsToHide.forEach((el) => (el.style.display = ""));

          // Reset button state
          downloadBtn.classList.remove("toolbar__button--loading");
          downloadBtn.innerHTML = originalContent;
          downloadBtn.disabled = false;

          // Show error notification
          this.showNotification("❌ Failed to generate PDF", "error");
        });
    } catch (error) {
      console.error("PDF download error:", error);

      // Reset button state
      downloadBtn.classList.remove("toolbar__button--loading");
      downloadBtn.innerHTML = originalContent;
      downloadBtn.disabled = false;

      // Show error notification
      this.showNotification("❌ Failed to generate PDF", "error");
    }
  }

  /**
   * Create ripple effect on button click
   * @param {Event} event - Click event
   */
  createRipple(event) {
    const button = event.currentTarget;

    // Remove existing ripple
    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }

    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    button.appendChild(ripple);

    // Position ripple
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);
  }

  /**
   * Show notification message
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info, warning)
   */
  showNotification(message, type = "info") {
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => {
      notification.remove();
    });

    const notification = document.createElement("div");
    notification.classList.add("notification", `notification--${type}`);
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      this.hideNotification(notification);
    }, 4000);

    // click to close
    notification.addEventListener("click", () => {
      this.hideNotification(notification);
    });

    notification.style.cursor = "pointer";
    notification.title = "Click to close";
  }

  /**
   * Hide notification
   * @param {HTMLElement} notification - Notification element
   */
  hideNotification(notification) {
    notification.classList.remove("show");

    // Remove element after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }
}

// Initialize the CV Toolbar when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CVToolbar();
});
