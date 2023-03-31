const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: routine } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `, [creatorId, isPublic, name.toLowerCase(), goal]);
    return routine
  } catch (error) {
    console.error('error creating routines', error)
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [ routine ] } = await client.query(`
      SELECT id
      FROM routines
      WHERE id=${ id }
    `);

    if (!routine) {
      return null
    }
    return routine;
  } catch (error) {
    console.error('error getting routine by id', error);
  }
}

async function getAllRoutines() {
  try {
    const { rows: [...routines] } = await client.query(`
    SELECT *
    FROM routines;
    `);
    return routines
  } catch (error) {
    console.error('error with getting all routines', error)
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
    console.error('error with getting all routines', error)
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: [ publicRoutines ] } = await client.query(`
    SELECT *
    FROM routines
    WHERE "isPublic" = true
    `);
    return publicRoutines
  } catch (error) {
    console.error('error with getAllPublicRoutines', error)
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: [ routinesByUser ] } = await client.query(`
    SELECT *
    FROM routines
    WHERE "creatorId" = (
      SELECT id
      FROM users
      WHERE username = $1
      )
    )`, [ username ])
    return routinesByUser
  } catch (error) {
    console.error('error with getAllRoutinesByUser', error)
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: [ publicRoutinesByUser ]} = await client.query(`
    SELECT *
    FROM routines
    WHERE "creatorId" = (
      SELECT id
      FROM users
      WHERE username = $1
      )
    AND "isPublic" = true;
    `, [ username ])
    return publicRoutinesByUser
  } catch (error) {
    console.error('error with getPublicRoutinesByUser', error)
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: [ publicRoutinesByActivity ]} = await client.query(`
    SELECT *
    FROM routines
    JOIN routine_activities
    ON routines.id = routine_activities."routineId"
    WHERE routines."isPublic" = true
    AND routine_activities."activitiyId" = $1
    `, [ id ]);

    return publicRoutinesByActivity
  } catch (error) {
    console.error('error with getPublicRoutinesByActivity', error)
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
      console.error('error with updating routine', error);
    }
}

async function destroyRoutine(id) {
  try {
    const { rows: destroyRoutine } = await client.query(`
    DELETE FROM routines
    WHERE id=$1
    `, [ id ]);

    return destroyRoutine
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
