import 'dotenv/config';
import express from "express";
const app = express();
import { movies, actors } from "./dataForQuestions.js";
app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log(movies);
    console.log(actors);
});