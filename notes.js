const fs = require("fs");

const addNote = (title, body) => {
  const notes = loadNotes();
  const duplicateNote = notes.find((note) => note.title === title);

  if (!duplicateNote) {
    notes.push({ title, body });
    saveNotes(notes);
    return { success: true, message: "New note added!" };
  } else {
    return { success: false, message: "Note title taken!" };
  }
};

const removeNote = (title) => {
  const notes = loadNotes();
  const notesToKeep = notes.filter((note) => note.title !== title);

  if (notes.length > notesToKeep.length) {
    saveNotes(notesToKeep);
    return { success: true, message: "Note removed!" };
  } else {
    return { success: false, message: "No note found!" };
  }
};

const listNotes = () => {
  return loadNotes();
};

const readNote = (title) => {
  const notes = loadNotes();
  const note = notes.find((note) => note.title === title);

  if (note) {
    return { success: true, note };
  } else {
    return { success: false, message: "Note not found!" };
  }
};

const updateNote = (oldTitle, newTitle, newBody) => {
  const notes = loadNotes();
  const noteIndex = notes.findIndex((note) => note.title === oldTitle);

  if (noteIndex === -1) {
    return { success: false, message: "Note not found!" };
  }

  if (newTitle !== oldTitle && notes.find((note) => note.title === newTitle)) {
    return { success: false, message: "Note title taken!" };
  }

  notes[noteIndex] = { title: newTitle, body: newBody };
  saveNotes(notes);

  return { success: true, message: "Note updated!", note: notes[noteIndex] };
};

const saveNotes = (notes) => {
  fs.writeFileSync("notes.json", JSON.stringify(notes));
};

const loadNotes = () => {
  try {
    const dataBuffer = fs.readFileSync("notes.json");
    return JSON.parse(dataBuffer.toString());
  } catch (e) {
    return [];
  }
};

module.exports = {
  addNote,
  removeNote,
  listNotes,
  readNote,
  updateNote, //
};
