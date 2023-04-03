const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;


// GET /api/health
router.get('/health', async (req, res,) => {
    res.send({
        message: "all is well over here"
      });
});

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

router.use((req, res,) => {
    res.status(404).send(
        { 
        message: "Please enter a valid endpoint",
        health: "/api/health",
        users: "/api/users",
        activities: "/api/activities",
        routines: "/api/routines",
        routine_activities: "/api/routine_activities"
        },
    );
  });

module.exports = router;
