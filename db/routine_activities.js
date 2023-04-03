const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) { 
  try {
    const { rows: [routine_activity] } = await client.query(`
    INSERT INTO routine_activities ("routineId", "activityId", count, duration)
    VALUES($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *
    `, [routineId, activityId, count, duration])

    return routine_activity
  } catch (error) {
    console.log('error with addActivityToRoutine', error)
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [ routineActivity ] } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE id=${ id }
    `);
    return routineActivity;
  } catch (error) {
    console.log('error getting routineActivity by id', error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivitiesByRoutine} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"= $1
    `, [ id ]);

    return routineActivitiesByRoutine
  } catch (error) {
    console.log('error with getRoutineActivitiesByRoutine', error)
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

    try {
      const { rows: [ updateRoutineActivities ] } = await client.query(`
        UPDATE routine_activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return updateRoutineActivities;
    } catch (error) {
      console.log('error with updating routine_activities', error);
    }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [destroyRoutineActivity] } = await client.query(`
    DELETE FROM routine_activities
    WHERE id=$1
    RETURNING *;
    `, [ id ]);

    return destroyRoutineActivity
  } catch (error) {
    console.log('error with destroying routine_activity', error)
  }
}
 
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [canEditRoutineActivity] } = await client.query(`
    SELECT *
    FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id
    WHERE routine_activities.id = $1 
    AND "creatorId" = $2;
    `, [ routineActivityId, userId ]);

    return canEditRoutineActivity 
  } catch (error) {
    console.log('error with canEditRoutineActivity', error)
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
