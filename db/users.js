const client = require("./client");
const bcrypt = require('bcrypt');


// database functions
 
// user functions
async function createUser({ 
  username, 
  password 
}) {  
const SALT_COUNT = 10;
const hashedPassword = await bcrypt.hash(password, SALT_COUNT)

  try {
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password) 
      VALUES($1, $2) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, hashedPassword]);

    delete user.password;
    return user;
  } catch (error) {
    console.log("WHY IS THIS HERE???", error)
    throw error
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    let passwordsMatch = await bcrypt.compare(password, hashedPassword) 

          if (passwordsMatch) {
            // return the user object (without the password)
            delete user.password;
            return user;
          } else {
            return null;
        }
  } catch (error) {
    console.log('trouble with getUser', error)
  }
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT *
      FROM users
      WHERE id=${ userId }
    `);

    if (!user) {
      return null
    }
    delete user.password;
    return user;
  } catch (error) {
    console.log('error getting user by ID'), error;
  }
}
 
async function getUserByUsername(userName) {
  try{ 
  const { rows: [ user ] } = await client.query(`
  SELECT *
  FROM users
  WHERE username=$1
`, [userName]);

  return user;
  } catch (error) {
  console.log('error getting user by username', error);
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
