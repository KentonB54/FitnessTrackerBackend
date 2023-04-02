const express = require('express');
const router = express.Router();
const { 
    getAllRoutines, 
    createRoutine, 
    updateRoutine 
} = require('../db');

router.use((req, res, next) => {
    console.log("A request is being made to /routines");

    next();
  });

// GET /api/routines
router.get('/', async (req, res) => {
    const routines = await getAllRoutines();

    res.send({
      routines
    });
  });


// POST /api/routines
// router.post('/', async (req, res) => {
//     const { creatorId, isPublic, name, goal } = req.body;
  
//     if (!creatorId || !name || !goal) {
//       res.status(400).send({
//         error: 'Missing required information'
//       });
//       return;
//     }
  
//     const routine = await createRoutine({ 
//         creatorId, 
//         isPublic, 
//         name, 
//         goal 
//     });
  
//     res.send({
//       routine
//     });
//   });


// PATCH /api/routines/:routineId


// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
