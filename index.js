import express from "express";
import pg from "pg";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors());

app.use(session({
  secret: 'TOPSECRETWORD',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // = 7 days
    secure: false,
    httpOnly: true,
  }
}))

app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate('session'));

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
const isLoggedIn = (req, res, next) => {
  console.log(req.session);
  if (!req.isAuthenticated()) {
    console.log(req.isAuthenticated());
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

app.post('/register', async (req, res) => {
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
          res.send("User created successfully");
        }
      })
    }
  }catch(err){
    console.log(err);
  }
});

const matchPassword = async (password, hashPassword) => {
  const match = await bcrypt.compare(password, hashPassword);
  return match
};
const emailExists = async (email) => {
  const data = await db.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
 
  if (data.rowCount == 0) return false; 
  return data.rows[0];
};

passport.use(
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, cb) {
      try {
        const user = await emailExists(email);
        if (!user) return cb(null, false);
        const isMatch = await matchPassword(password, user.password);
        if (!isMatch) return cb(null, false);
        return cb(null, user);
      } catch (error) {
        return cb(error, false);
      }
    }
  )
);

// passport.use('local', new Strategy({
//   usernameField: 'email',
//   passwordField: 'password',
//   },async function verify(email, password, cb) {
//   console.log(email, password);
//   try {
//     const result = await db.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);
//     if (result.rows.length > 0) {
//       const user = result.rows[0];
//       const storedHashedPassword = user.password;

//       bcrypt.compare(password, storedHashedPassword, (err, result) => {
//         if (err) {
//           console.error("Error comparing passwords:", err);
//         }else{
//           if (result) {
//             res.status(200).send("Login successful");
//           } else {
//             res.status(401).send("Incorrect password or email");
//           }
//         }
//       })
//     } else {
//       res.status(401).send("User not found");
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }));


app.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
  res.send("Login successful");
});


app.get('/home', isLoggedIn, (req, res) => {
  return res.send("Hello from home");
})

passport.serializeUser(function (user, cb) {
  console.log('Serialize user', user);
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  console.log('Deserialize user', user);
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
