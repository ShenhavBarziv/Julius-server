const { MongoClient, ObjectId, ServerApiVersion  } = require('mongodb');
const { USER_DATA_KEYS } = require('./constant');
require('dotenv').config();
const { compare, hash } = require('bcryptjs');
const dbName = "users";
const registerCollectionName = "register";
const userCollectionName = "users";

async function Connect() {
  const client = new MongoClient(process.env.URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  await client.connect();
  return client.db(dbName);
}



async function AddRegister(user) {
  try {
    const db = await Connect();
    const registerCollection = db.collection(registerCollectionName);
    const existingUser = await registerCollection.findOne({ email: user.email });

    if (existingUser) {
      console.log(`User with email ${user.email} already exists in the register collection.`);
      return 409; // Conflict status code
    }
    user.admin = false;
    const collection = db.collection(registerCollectionName);
    user.password = await hash(user.password, 10)
    await collection.insertOne(user);
    console.log(`${user.name} inserted successfully.\n`);
    return 201; // Successfully inserted status code
  } catch (err) {
    console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    return 500; // Internal Server Error status code
  }
}

async function Login(email, password) {
  try {
    const db = await Connect();
    let collection = db.collection(userCollectionName);
    
    let user = await collection.findOne({ email });

    if (user) {
      const passwordMatch = await compare(password, user.password);
      if (passwordMatch) {
        return { user, msg: "Connected successfully" };
      } else {
        return { msg: "Email or password are incorrect" };
      }
    }

    // No user found in the first collection, checking the second collection
    collection = db.collection(registerCollectionName);
    user = await collection.findOne({ email });

    if (user) {
      const passwordMatch = await compare(password, user.password);

      if (passwordMatch) {
        return { msg: "Your user is not approved. Please contact your supervisor" };
      }
    }

    // No user found in the second collection either
    return { msg: "Email or password are incorrect" };
  } catch (err) {
    console.error("Error during login:", err);
    return { msg: "An error occurred during login" };
  }
}

async function List() {
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const data = await collection.find().toArray();
    if(!data){return {};}
    const filteredData = data.map(({ _id,name, job, email, position, phoneNumber, hireDate, birthDate, admin }) => ({
      _id,
      name,
      job,
      email,
      position,
      phoneNumber,
      hireDate,
      birthDate,
      admin
    }));
    return filteredData;
  } catch (err) {
    console.error(`Error finding users: ${err}`);
    throw err;
  }
}
/*
async function GetUserByEmail(email) {
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const user = await collection.findOne({ email });
    const keysToKeep = ['email', 'name', 'job', 'birthDate', 'phoneNumber', 'position', 'hireDate'];
    const ans = Object.fromEntries(
      Object.entries(user).filter(([key]) => keysToKeep.includes(key))
    );
    return ans;
  } catch (err) {
    console.error(`Error finding user by email: ${err}`);
    throw err;
  }
}
*/
async function ListReg() {
  try {
    const db = await Connect();
    const collection = db.collection(registerCollectionName);
    const data = await collection.find().toArray();
    if(!data){return {};}
    const filteredData = data.map(({ _id,name, job, email, position, phoneNumber, hireDate, birthDate }) => ({
      _id,
      name,
      job,
      email,
      position,
      phoneNumber,
      hireDate,
      birthDate
    }));
    return filteredData;
  } catch (err) {
    console.error(`Error finding users: ${err}`);
    throw err;
  }
}
async function DeleteReg(id) {
  try {
    const db = await Connect();
    const collection = db.collection(registerCollectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      console.log(`User with id ${id} deleted successfully from the register collection.`);
      return {status:200}; // Success status code
    } else {
      return {status:404}; // Not Found status code
    }
  } catch (err) {
    console.error(`Error deleting user from register collection: ${err}`);
    return {status:500};
  }
}

async function ApproveReg(id) {
  try {
    const db = await Connect();
    const registerCollection = db.collection(registerCollectionName);
    const userCollection = db.collection(userCollectionName);

    // Find the user to be approved in the register collection
    const userToApprove = await registerCollection.findOne({ _id: new ObjectId(id) });

    if (userToApprove) {
      // Insert the user into the user collection
      await userCollection.insertOne(userToApprove);
      // Delete the user from the register collection
      await registerCollection.deleteOne({ _id: new ObjectId(id) });

      console.log(`User with id ${id} approved and moved to the users collection.`);
      return { status: 200 }; // Success status code
    } else {
      console.log(`User with id ${id} not found in the register collection.`);
      return { status: 404 }; // Not Found status code
    }
  } catch (err) {
    console.error(`Error approving user in register collection: ${err}`);
    return { status: 500 }; // Internal Server Error status code
  }
}
async function DeleteUser(id) {
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      console.log(`User with id ${id} deleted successfully from the user collection.`);
      return {status:200};
    } else {
      console.log(`User with id ${id} not found in the user collection.`);
      return {status:404};
    }
  } catch (err) {
    console.error(`Error deleting user from user collection: ${err}`);
    return {status:500};
  }
}
async function GetUserById(userId)
{
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (user) {
      const keysToKeep = ['_id','email', 'name', 'job', 'birthDate', 'phoneNumber', 'position', 'hireDate', 'admin'];
    const ans = Object.fromEntries(
      Object.entries(user).filter(([key]) => keysToKeep.includes(key))
    );
      return ans;
    } else {
      console.log('User not found');
      return {};
    }
  } catch (err) {
    console.error(`Error finding user by ID: ${err}`);
  }
}
async function UpdateUser(userData) {
  const userId = userData._id;
  try {
    client = new MongoClient(process.env.URI);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(userCollectionName);
    const { name, job, email, position, phoneNumber, hireDate, birthDate } = userData;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name, job, email, position, phoneNumber, hireDate, birthDate } }    );

    if (result.modifiedCount === 1) {
      console.log(`User with ID ${userId} updated successfully.`);
      return { code: 200, msg: 'User updated successfully' };
    } else {
      console.log(`User with ID ${userId} not found.`);
      return { code: 404, msg: 'User not found' };
    }
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    return { code: 500, msg: 'Error' };
  } finally {
    await client.close();
  }
}

module.exports = { AddRegister, Login, List, ListReg, DeleteReg, ApproveReg, DeleteUser, GetUserById, UpdateUser };
