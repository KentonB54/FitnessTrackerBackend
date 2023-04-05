/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { 
  createUser, 
  getUserByUsername, 
  getUserById, 
  getPublicRoutinesByUser,
  getAllRoutinesByUser
 } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;


// POST /api/users/register
router.post("/register", async (req, res, next) => {
    const {username, password} = req.body;
    try {
        const _user = await getUserByUsername(username);
        if (_user) {
            res.send({
                error: 'error',
                name: 'error',
                message: `User ${username} is already taken.`,
            });
        }  
        if (password.length < 8){
            res.send({
                error: 'error with password',
                message: "Password Too Short!",
                name: 'error with password',
            });
        }
        const user = await createUser({
            username,
            password
        })
        const token = jwt.sign({ 
            id: user.id, 
            username
          }, process.env.JWT_SECRET, {
            expiresIn: '1w'
          });
        res.send({
            message: "thank you for signing up",
            token: token,
            user: {
                id: user.id,
                username: username
            }
        });
    } catch({name, message}) {
        next({ name, message })
    }
})



router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    console.log(req.body)

    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
      const hashedPassword = user.password

      if (hashedPassword) {

        const token = jwt.sign({
          id: user.id,
          username: user.username
        }, process.env.JWT_SECRET)

        token;

        const recoveredData = jwt.verify(token, process.env.JWT_SECRET)
        recoveredData;
        res.send({ 
          message: "you're logged in!", 
          token: token, 
          user: {
            id: user.id,
            username: username
          }});
      } 
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

// GET /api/users/me
router.get("/me", async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).send({
      error: "this is an error for unauthorization",
      message: "You must be logged in to perform this action",
      name: "Log in for access"
    })
  } else {
    const token = authHeader.split(" ")[1]

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      const userId = decoded.id
      const user = await getUserById(userId)

      if (!user) {
        res.send({
          name: "user not logged in error",
          message: "User not Found."
        })
      }

      res.send({
        id: user.id,
        username: user.username
      })
    } catch ({ name, message }) {
      next({ name, message })
    }
  } 
})

//GET /users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  let routines
  
  try {
    const publicRoutines = await getPublicRoutinesByUser({ username });

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      routines = publicRoutines;
    } else {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.username !== username) {
        routines = publicRoutines;
      } else {
        const userRoutines = await getAllRoutinesByUser({ username });
        routines = userRoutines;
      }
    }
    
    res.send(routines);
  } catch ({ name, message }) {
    next({ name, message });
  } 
});
module.exports = router;
