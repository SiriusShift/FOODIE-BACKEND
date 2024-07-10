import express from "express";
import pg from "pg";
import cors from "cors";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "FOODIE",
    password: "123456",
    port: 5432,
});

app.use(cors());

app.get('/', (req,res) => {
  return res.send("Hello from server");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
