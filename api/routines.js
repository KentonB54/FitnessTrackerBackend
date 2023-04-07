const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { 
    createRoutine, 
    updateRoutine,
    getAllPublicRoutines,
    getRoutineById,
    getUserById,
    destroyRoutine,
    addActivityToRoutine,
    getActivityByRoutineAndActivityIds
} = require('../db');

// GET /api/routines
router.get('/', async (req, res) => {
    const routines = await getAllPublicRoutines();
    res.send(
      routines
    );
  });


// POST /api/routines
router.post("/", async (req, res, next) => {
  const {name, goal, isPublic, creatorId} = req.body
  const authHeader = req.headers.authorization

  try {
if (!authHeader) {
  res.send({
    error: "Authenticated error",
    message:"You must be logged in to perform this action",
    name: "name error"
  }) } else {
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const userId = decoded.id
    const user = await getUserById(userId)

      await createRoutine({id: creatorId, isPublic, name, goal})
      res.send({
        creatorId: user.id, 
        isPublic: isPublic, 
        name: name, 
        goal: goal
      })
  }
  } catch({name, description}) {
      next({name, description})
  }
})

// PATCH /api/routines/:routineId
router.patch("/:routineId", async (req, res, next) => {
  const authHeader = req.headers.authorization
  const {routineId} = req.params
  const { isPublic, name, goal} = req.body
  try {
    if (!authHeader) {
      res.send({
        error: "Authenticated error",
        message:"You must be logged in to perform this action",
        name: "name error"
      })
    } 
    else {
      const routine = await getRoutineById(routineId)
      const token = authHeader.split(" ")[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      const userId = decoded.id
      const user = await getUserById(userId)
        if (routine.creatorId !== user.id) {
          res.status(403).send({
            error: 'update error',
            message: `User ${user.username} is not allowed to update ${routine.name}`,
            name: 'can not update someone elses routine'
          });
        } 
      await updateRoutine({ id: routineId, isPublic, name, goal })
        res.send({
          isPublic: isPublic,
          name: name,
          goal: goal
        })
     }
  } catch ({name, description}) {
    next({name, description})
  }
})


// DELETE /api/routines/:routineId
router.delete("/:routineId", async (req, res, next) => {
  const authHeader = req.headers.authorization
  const {routineId} = req.params
  try {

    if (!authHeader) {
      res.status(401).send({
        error: "Authenticated error",
        message:"You must be logged in to perform this action",
        name: "name error"
      })
    } else {
      const routine = await getRoutineById(routineId)
      const token = authHeader.split(" ")[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      const userId = decoded.id
      const user = await getUserById(userId)
        if (routine.creatorId !== user.id) {
          res.status(403).send({
            error: 'update error',
            message: `User ${user.username} is not allowed to delete ${routine.name}`,
            name: 'can not update someone elses routine'
          });
        } else {
          const deleteRoutine = await destroyRoutine(routineId)
          res.send( deleteRoutine )
        }
    } 
  } catch ({name, description}) {
    next({name, description})
  }
})


// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
  const { routineId, activityId, count, duration } = req.body
  
  try {
    const existingActivity = await getActivityByRoutineAndActivityIds(routineId, activityId)
    
    if (existingActivity.length > 0) {
      const oldRoutineId = existingActivity[0].routineId 
      const oldActivityId = existingActivity[0].activityId

      if (oldRoutineId === routineId && oldActivityId === activityId) {
        return res.send({ 
          error: "This activity already exists in the routine",
          message: `Activity ID ${oldActivityId} already exists in Routine ID ${oldRoutineId}`,
          name: "any string"
        })
      }
    } else {
      await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      })

      res.send({
        routineId: routineId,
        activityId: activityId,
        count: count,
        duration: duration,
      })
    }
  } catch ({name, message}) {
    next({name, message})
  }
})
module.exports = router;
