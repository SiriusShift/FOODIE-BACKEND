import express from "express";
import pg from "pg";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
// import session from "express-session";
import passport from "passport";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors());

// app.use(session({
//   secret: 'TOPSECRETWORD',
//   resave: false,
//   saveUninitialized: true,
// }))

app.use(passport.initialize());
// app.use(passport.session());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "FOODIE",
  password: "123456",
  port: 5432,
});
db.connect();

app.get('/', (req,res) => {
  return res.send("Hello from server");
});

app.post('/register',  async (req, res) => {
  const newUser = req.body.register;
  const email = newUser.email;
  const password = newUser.password;
  const remember = newUser.remember;
  try{
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkResult.rows.length > 0) {
      res.status(409).send("Email already exists, try again");
    }else{    
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if(err){
          console.log(err);
        }else{
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hash]
          );
          console.log(result);
          res.send("User created successfully");
        }
      })
    }
  }catch(err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
