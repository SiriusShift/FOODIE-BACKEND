import express from "express";
import pg from "pg";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "FOODIE",
    password: "123456",
    port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors());

app.get('/', (req,res) => {
  return res.send("Hello from server");
});

app.post('/register',  (req, res) => {
  console.log(req.body);
  return res.json(`This is register page`);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
