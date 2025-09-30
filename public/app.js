// API Base URL
const API_URL = "http://localhost:3000/api/notes";

// DOM
const newNoteBtn = document.getElementById("newNoteBtn");
const notesList = document.getElementById("notesList");
const welcomeScreen = document.getElementById("welcomeScreen");
const noteEditor = document.getElementById("noteEditor");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");

let notes = [];
let currentNote = null;
let originalTitle = null;

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  newNoteBtn.addEventListener("click", createNewNote);
  saveBtn.addEventListener("click", saveNote);
  deleteBtn.addEventListener("click", deleteNote);
  searchInput.addEventListener("input", handleSearch);
}

// Load all notes
async function loadNotes() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.success) {
      notes = data.notes;
      renderNotesList();
    }
  } catch (error) {
    showToast("Không thể tải danh sách ghi chú", "error");
    console.error("Error loading notes:", error);
  }
}

// Render notes list
function renderNotesList(filteredNotes = notes) {
  if (filteredNotes.length === 0) {
    notesList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>Chưa có ghi chú nào</p>
                <p class="empty-subtitle">Nhấn "Tạo ghi chú mới" để bắt đầu</p>
            </div>
        `;
    return;
  }

  notesList.innerHTML = filteredNotes
    .map(
      (note) => `
        <div class="note-item ${
          currentNote && currentNote.title === note.title ? "active" : ""
        }" 
             data-title="${note.title}">
            <div class="note-item-title">${note.title}</div>
            <div class="note-item-preview">${note.body.substring(0, 60)}${
        note.body.length > 60 ? "..." : ""
      }</div>
        </div>
    `
    )
    .join("");

  // Add click listeners to note items
  document.querySelectorAll(".note-item").forEach((item) => {
    item.addEventListener("click", () => {
      const title = item.dataset.title;
      const note = notes.find((n) => n.title === title);
      if (note) {
        openNote(note);
      }
    });
  });
}

// Create new note
function createNewNote() {
  currentNote = { title: "", body: "" };
  originalTitle = null;
  noteTitle.value = "";
  noteBody.value = "";
  welcomeScreen.style.display = "none";
  noteEditor.style.display = "flex";
  noteTitle.focus();

  // Remove active class from all items
  document.querySelectorAll(".note-item").forEach((item) => {
    item.classList.remove("active");
  });
}

// Open existing note
function openNote(note) {
  currentNote = { ...note };
  originalTitle = note.title;
  noteTitle.value = note.title;
  noteBody.value = note.body;
  welcomeScreen.style.display = "none";
  noteEditor.style.display = "flex";

  // Update active state
  document.querySelectorAll(".note-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.title === note.title) {
      item.classList.add("active");
    }
  });
}

// Save note
async function saveNote() {
  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();

  if (!title || !body) {
    showToast("Vui lòng nhập tiêu đề và nội dung", "error");
    return;
  }

  try {
    // If editing existing note with different title, delete old one first
    if (originalTitle && originalTitle !== title) {
      await fetch(`${API_URL}/${encodeURIComponent(originalTitle)}`, {
        method: "DELETE",
      });
    }

    // Add new note
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    });

    const data = await response.json();

    if (data.success) {
      showToast("Đã lưu ghi chú thành công", "success");
      originalTitle = title;
      await loadNotes();

      // Update current note and reopen it
      const savedNote = notes.find((n) => n.title === title);
      if (savedNote) {
        openNote(savedNote);
      }
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Không thể lưu ghi chú", "error");
    console.error("Error saving note:", error);
  }
}

async function saveNote() {
  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();

  if (!title || !body) {
    showToast("Vui lòng nhập tiêu đề và nội dung", "error");
    return;
  }

  try {
    let response;
    if (originalTitle) {
      response = await fetch(
        `${API_URL}/${encodeURIComponent(originalTitle)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        }
      );
    } else {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
    }

    const data = await response.json();

    if (data.success) {
      showToast(
        originalTitle ? "Đã cập nhật ghi chú" : "Đã lưu ghi chú mới",
        "success"
      );
      originalTitle = title;
      await loadNotes();
      openNote({ title, body });
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Lỗi khi lưu ghi chú", "error");
    console.error("Error saving note:", error);
  }
}

// Delete note
async function deleteNote() {
  if (!originalTitle) {
    showToast("Không có ghi chú nào để xóa", "error");
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(originalTitle)}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (data.success) {
      showToast("Đã xóa ghi chú", "success");
      currentNote = null;
      originalTitle = null;
      noteEditor.style.display = "none";
      welcomeScreen.style.display = "flex";
      await loadNotes();
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Không thể xóa ghi chú", "error");
    console.error("Error deleting note:", error);
  }
}

// Search notes
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();

  if (!searchTerm) {
    renderNotesList();
    return;
  }

  const filtered = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.body.toLowerCase().includes(searchTerm)
  );

  renderNotesList(filtered);
}

// Show toast notification
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
