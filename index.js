require ('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4444;

// Database Connection
mongoose.connect(process.env.DB_CONNECTION);
const dbConn = mongoose.connection;
dbConn.on("error", (error) => console.log(error));
dbConn.once("open", () => console.log("Connected to MongoDB successfully!"));

// Set template engine
app.set("view engine", "ejs");

// Routing prefix
app.use("", require('./routes/routing'));

// app.get('/', (req, resp) => {
//     resp.send('Hello World!');
// });

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})