const express = require("express");
const path = require("path");
const fs = require('fs');
const util = require('util');
const app = express();

// Setting up server port
const PORT = process.env.PORT || 3000;

// Using express to parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

//Setting variables
const writefileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);
let allNotes;


// Setting up routes
app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "./public/notes.html"));
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/api/notes", function (req, res) {
    readFileAsync(path.join(__dirname, "./db/db.json"), "utf8")
        .then(function (data) {
            return res.json(JSON.parse(data));
        });
});

// Handling post function
app.post("/api/notes", function (req, res) {
    const newNote = req.body;
    readFileAsync(path.join(__dirname, "./db/db.json"), "utf8")
        .then(function (data) {
            allNotes = JSON.parse(data);
            if (newNote.id || newNote.id === 0) {
                let currNote = allNotes[newNote.id];
                currNote.title = newNote.title;
                currNote.text = newNote.text;
            } else {
                allNotes.push(newNote);
            }
            writefileAsync(path.join(__dirname, "./db/db.json"), JSON.stringify(allNotes))
                .then(function () {
                    console.log("Your note has been saved to db.json");
                })
        });
    res.json(newNote);
});

// Handling delete function
app.delete("/api/notes/:id", function (req, res) {
    const id = req.params.id;
    readFileAsync(path.join(__dirname, "./db/db.json"), "utf8")
        .then(function (data) {
            allNotes = JSON.parse(data);
            allNotes.splice(id, 1);
            writefileAsync(path.join(__dirname, "./db/db.json"), JSON.stringify(allNotes))
                .then(function () {
                    console.log("Your note has been deleted from db.json");
                });
        });
    res.json(id);
});


// Starting local server
app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
});
