const express = require('express');
const { 
    getAllActivities, 
    createActivity,
    getPublicRoutinesByActivity,
    getActivityByName,
    getActivityById,
    updateActivity, 
} = require('../db');
const router = express.Router();

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
    const { activityId } = req.params

    try {
    const routines = await getPublicRoutinesByActivity({id: activityId})
         if (!routines.length) {
            res.status(404).send({
                message: `Activity ${activityId} not found`,
                name: 'Not Found',
                error: 'Activity not found',
            });
        } else {
            res.send(
                routines
            )
        }
    } catch ({error}) {
        next({error})
    }
})


// GET /api/activities
router.get('/', async (req, res) => {
    const activities = await getAllActivities();

    res.send(
      activities
    );
  });


// POST /api/activities
router.post("/", async (req, res, next) => {
    
    const {name, description} = req.body
    const authHeader = req.headers.authorization
    try {
    const activity = await getActivityByName(name)

     if (!authHeader) {
        res.status(403).send({message:"login to use this action"})
     } else if (activity) {
        res.send({
            error: "Activity name already used",
            message: `An activity with name ${activity.name} already exists`,
            name: "Activity name already used"
        })
    } else {
        await createActivity({name, description})
        res.send({
            description: description,
            name: name,
        })
    }
    } catch({name, description}) {
        next({name, description})
    }
})


//PATCH /api/activities/:activityId
router.patch("/:activityId", async (req, res, next) => {
    const { activityId } = req.params
    const { name, ...fields} = req.body

    try {
        const verifyActivity = await getActivityById(activityId);
        const activityName = await getActivityByName(name)
        const authHeader = req.headers.authorization

        if (!authHeader) {
            res.send({message:"login to use this action"})
         } else if (!verifyActivity) {
            res.status(404).send({ 
                error: "anyString error blah blah",
                message: `Activity ${activityId} not found`,
                name: "any strrang" });
        } else if (activityName && activityId !== activityName.id) {
            res.status(404).send({ 
                error: "anyString error blah blah",
                message: `An activity with name ${activityName.name} already exists`,
                name: "any strrang" });
        } else {
            const updateFields = { ...fields };
            if (name) {
                updateFields.name = name;
            }
                const updatedActivity = await updateActivity({ id: activityId, ...updateFields });
                res.send( updatedActivity );
            }

    } catch ({name, message}) {
        next({name, message})
    }
    
})



module.exports = router;
