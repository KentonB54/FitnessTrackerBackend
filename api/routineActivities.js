const express = require('express');
const { 
    updateRoutineActivity,
    destroyRoutineActivity,
    getRoutineById,
    getUserById } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const router = express.Router();

//PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const { routineActivityId } = req.params;
    const { ...fields } = req.body;
    
    const routine = await getRoutineById(routineActivityId);
    
    try {
      if (!authHeader) {
        res.send({
          error: "Authentication error",
          message: "You must be logged in to perform this action",
          name: "name error"
        });
      } else {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        const user = await getUserById(userId);
        
        if (routine.creatorId !== user.id) {
          res.status(403).send({
            error: "Update error",
            message: `User ${user.username} is not allowed to update ${routine.name}`,
            name: "cannot update someone else's routine"
          });
        } else {
          const newRoutineActivity = await updateRoutineActivity({ id: routineActivityId, ...fields });
          res.send(newRoutineActivity);
        }
      }
    } catch ({ name, description }) {
      next({ name, description });
    }
  });

//DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const { routineActivityId } = req.params;

    const routine = await getRoutineById(routineActivityId);
    
    try {
      if (!authHeader) {
        res.send({
          error: "Authentication error",
          message: "You must be logged in to perform this action",
          name: "name error"
        });
      } else {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        const user = await getUserById(userId);
        
        if (routine.creatorId !== user.id) {
          res.status(403).send({
            error: "Update error",
            message: `User ${user.username} is not allowed to delete ${routine.name}`,
            name: "cannot update someone else's routine"
          });
        } 
        const destroy = await destroyRoutineActivity(routineActivityId)
        res.send(destroy)

      }
    } catch ({ name, description }) {
      next({ name, description });
    }
  });

module.exports = router;
