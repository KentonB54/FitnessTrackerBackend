/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { createUser, getUserByUsername, getUser } = require('../db');
const bcrypt = require("bcrypt");
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


// GET /api/users/:username/routines

module.exports = router;
