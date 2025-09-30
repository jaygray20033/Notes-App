const express = require("express");
const cors = require("cors");
const notes = require("./notes.js");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API Routes
// Get all notes
app.get("/api/notes", (req, res) => {
  const allNotes = notes.listNotes();
  res.json({ success: true, notes: allNotes });
});

// Get a specific note
app.get("/api/notes/:title", (req, res) => {
  const result = notes.readNote(req.params.title);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

// Add a new note
app.post("/api/notes", (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: "Title and body are required!",
    });
  }

  const result = notes.addNote(title, body);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Update a note
app.put("/api/notes/:title", (req, res) => {
  const oldTitle = req.params.title;
  const { title: newTitle, body: newBody } = req.body;

  if (!newTitle || !newBody) {
    return res.status(400).json({
      success: false,
      message: "Title and body are required!",
    });
  }

  const result = notes.updateNote(oldTitle, newTitle, newBody);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// Delete a note
app.delete("/api/notes/:title", (req, res) => {
  const result = notes.removeNote(req.params.title);
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
