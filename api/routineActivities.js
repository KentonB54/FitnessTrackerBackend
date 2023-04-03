const express = require('express');
const { 
    getRoutineActivityById, 
    updateRoutineActivity,
    canEditRoutineActivity } = require('../db');
const router = express.Router();

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", async (req, res, next) => {
    const { routineActivityId, userId } = req.params
    const { ...fields } = req.body

    const userCanEdit = await canEditRoutineActivity(routineActivityId, userId)
    console.log('here is my params', req.params)
    console.log('here is my body', req.body)
    const newRoutineActivity = await updateRoutineActivity({id :routineActivityId, ...fields})
        try {
            if (!userCanEdit) {
                res.send({error: 'error'})
            } else {

            res.send(newRoutineActivity)
            }
            
        } catch ({name, message}) {
            next({name, message})
        }
})
// DELETE /api/routine_activities/:routineActivityId

module.exports = router;
