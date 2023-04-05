const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");
async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routine] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `, [creatorId, isPublic, name.toLowerCase(), goal]);
    return routine
  } catch (error) {
    console.log('error creating routines', error)
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [ routine ] } = await client.query(`
      SELECT *
      FROM routines
      WHERE id=${ id }
    `);

    if (!routine) {
      return null
    }
    return routine;
  } catch (error) {
    console.log('error getting routine by id', error);
  }
}

async function getAllRoutines() {
  try {
    const { rows: [...routines] } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id;
    `);
    return attachActivitiesToRoutines(routines)
  } catch (error) {
    console.log('error with getting all routines', error)
  } 
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routinesWithoutActivities } = await client.query(`
    SELECT *
    FROM routines
    LEFT JOIN routine_activities
    ON routines.id = routine_activities."routineId"
    WHERE routine_activities."activityId" IS NULL;
    `);
    return routinesWithoutActivities
  } catch (error) {
    console.log('error with getting all routines', error)
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: publicRoutines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    WHERE "isPublic" = true
    `);
    return attachActivitiesToRoutines(publicRoutines)
  } catch (error) {
    console.log('error with getAllPublicRoutines', error)
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routinesByUser } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    WHERE username = $1`, [ username ])
    return attachActivitiesToRoutines(routinesByUser)
  } catch (error) {
    console.log('error with getAllRoutinesByUser', error)
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: publicRoutinesByUser} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    AND "isPublic" = true
    AND username=$1;
    `, [ username ])
    return attachActivitiesToRoutines(publicRoutinesByUser)
  } catch (error) {
    console.log('error with getPublicRoutinesByUser', error)
  }
}
 
async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: publicRoutinesByActivity } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routines."isPublic" = true
    AND routine_activities."activityId"=$1
    `, [ id ]);

    return attachActivitiesToRoutines(publicRoutinesByActivity)
  } catch (error) {
    console.log('error with getPublicRoutinesByActivity', error)
    return []
  }
}

async function updateRoutine({ id, ...fields }) {

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

    try {
      const { rows: [ updateRoutine ] } = await client.query(`
        UPDATE routines
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return updateRoutine;
    } catch (error) {
      console.log('error with updating routine', error);
    }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId" = $1
    RETURNING *
    `, [id]);
    const { rows: [routine] } = await client.query(`
    DELETE FROM routines
    WHERE id=$1
    RETURNING *
    `, [id]);

    return routine
  } catch (error) {
    console.log('error with destroying routine', error)
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
