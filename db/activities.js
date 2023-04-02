const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [activity] } = await client.query(`
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *
    `, [name, description]);

    return activity
  } catch (error) {
    console.log('error creating activities in activities.js', error)
  }
}
 
async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows: activities } = await client.query(`
    SELECT *
    FROM activities;
    `);
    return activities
  } catch (error) {
    console.log('error with getting all activities', error)
  }
}

async function getActivityById(id) {
  try {
    const { rows: [ activity ] } = await client.query(`
      SELECT *
      FROM activities
      WHERE id=${ id }
    `);

    return activity;
  } catch (error) {
    console.log('error getting activity by id', error);
  }
}

async function getActivityByName(name) {
  try{ 
    const { rows: [ activity ] } = await client.query(`
    SELECT *
    FROM activities
    WHERE name = $1
  `, [name]);
  
  return activity;
  } catch (error) {
  console.log('error getting activity by name', error);
  }
}

async function attachActivitiesToRoutines(routines) {
  const routinesById = [...routines];
  const paramList = routines.map ((r, index) => `$${index+1}`).join(', ')
  const routineList = routines.map (routine => routine.id)
  if (!routineList?.length) return []

    try {
      const { rows: activities } = await client.query(`
      SELECT activities.*, 
      routine_activities.duration, 
      routine_activities.count, 
      routine_activities.id AS "routineActivityId", 
      routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${paramList})
      `,routineList)
      for (const routine of routinesById){
        const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
        routine.activities = activitiesToAdd;
      }
      return routinesById;
    } catch(error){
      console.log("error with attachActivitiesToRoutines", error)
    }
}

async function updateActivity({ id, ...fields }) {

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

    try {
      const { rows: [ activity ] } = await client.query(`
        UPDATE activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return activity;
    } catch (error) {
      console.log('error with updating activity', error);
    }
  }  


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
