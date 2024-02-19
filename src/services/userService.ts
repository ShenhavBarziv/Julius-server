import { MongoClient, ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';
import { UserType, UserTypeWithoutAdminAndId, UserTypeWithoutPassword } from '../types';
import dotenv from 'dotenv';
dotenv.config();

const dbName: string = "users";
const registerCollectionName: string = "register";
const userCollectionName: string = "users";

async function Connect() {
  const client = new MongoClient(process.env.URI!, {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    }
  });
  await client.connect();
  const db = client.db(dbName);
  return {
    db,
    closeConnection: async () => {
      await client.close();
    }
  };
}


async function AddRegister(user: UserTypeWithoutAdminAndId): Promise<number> {
  try {
    const { db, closeConnection } = await Connect();
    const registerCollection = db.collection(registerCollectionName);
    const existingUser = await registerCollection.findOne({ email: user.email });
    if ('admin' in user) { throw new Error("admin field is not in the signup page"); }
    if (existingUser) {
      console.log(`User with email ${user.email} already exists in the register collection.`);
      await closeConnection();
      return 409; // Conflict status code
    }
    user.password = await hash(user.password, 10);
    await registerCollection.insertOne(user);
    console.log(`${user.name} inserted successfully.\n`);
    await closeConnection();
    return 201; // Successfully inserted status code
  } catch (err) {
    console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    return 500; // Internal Server Error status code
  }
}

async function getAllUsers(): Promise<UserTypeWithoutPassword[]> {
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(userCollectionName);
    const data = await collection.find({}, { projection: { password: 0 } }).toArray() as UserTypeWithoutPassword[];
    await closeConnection();
    return data;
  } catch (err) {
    console.error(`Error finding users: ${err}`);
    throw new Error("An error occurred while fetching user data");
  }
}

async function DeleteUser(id: string): Promise<{ status: number, msg: string }> {
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(userCollectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      console.log(`User with id ${id} deleted successfully from the user collection.`);
      await closeConnection();
      return { status: 200, msg: `User with id ${id} deleted successfully from the user collection.` };
    } else {
      console.log(`User with id ${id} not found in the user collection.`);
      await closeConnection();
      return { status: 404, msg: `User with id ${id} not found in the user collection.` };
    }
  } catch (err) {
    console.error(`Error deleting user from user collection: ${err}`);
    return { status: 500, msg: `Error deleting user from user collection: ${err}` };
  }
}

async function GetUserById(userId: ObjectId): Promise<UserTypeWithoutPassword | { msg: string }> {
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(userCollectionName);
    const user = (await collection.findOne({ _id: userId }, { projection: { password: 0 } })) as UserTypeWithoutPassword | null;
    await closeConnection();
    if (user) {
      return user;
    } else {
      console.log('User not found');
      return { msg: 'User not found' };
    }
  } catch (err) {
    console.error(`Error finding user by ID: ${err}`);
    return { msg: `Error finding user by ID: ${err}` };
  }
}

async function getUserByEmail(email: string): Promise<UserType | null> {
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(userCollectionName);
    const user = await collection.findOne({ email });
    await closeConnection();
    return user as UserType;
  } catch (err) {
    console.error(`Error finding user by email: ${err}`);
    throw new Error(`Error finding user by email: ${err}`);
  }
}
async function getAllRegisteredUsers(): Promise<UserTypeWithoutPassword[]> {
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(registerCollectionName);
    const data = await collection.find({}, { projection: { password: 0 } }).toArray() as UserTypeWithoutPassword[];
    await closeConnection();
    return data;
  } catch (err) {
    console.error(`Error finding users: ${err}`);
    throw new Error("An error occurred while fetching user data");
  }
}
async function UpdateUser(userData: UserTypeWithoutPassword): Promise<{ status: number, msg: string }> {
  const userId = userData._id;
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(userCollectionName);
    const { name, job, email, position, phoneNumber, hireDate, birthDate, admin } = userData;
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name, job, email, position, phoneNumber, hireDate, birthDate, admin } }
    );

    if (result.modifiedCount === 1) {
      console.log(`User with ID ${userId} updated successfully.`);
      await closeConnection();
      return { status: 200, msg: `User with ID ${userId} updated successfully.` };
    } else {
      console.log(`User with ID ${userId} not found.`);
      await closeConnection();
      return { status: 404, msg: `User with ID ${userId} not found.` };
    }
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    return { status: 500, msg: `Error updating user: ${error}` };
  }
}
async function DeleteReg(id: string): Promise<{ status: number }> {
  try {
    const { db, closeConnection } = await Connect();
    const collection = db.collection(registerCollectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    await closeConnection()
    if (result.deletedCount === 1) {
      console.log(`User with id ${id} deleted successfully from the register collection.`);
      return { status: 200 }; // Success status code
    } else {
      return { status: 404 }; // Not Found status code
    }
  } catch (err) {
    console.error(`Error deleting user from register collection: ${err}`);
    return { status: 500 }; // Internal Server Error status code
  }
}

async function ApproveReg(id: string): Promise<{ status: number }> {
  try {
    const { db, closeConnection } = await Connect();
    const registerCollection = db.collection(registerCollectionName);
    const userCollection = db.collection(userCollectionName);

    // Find the user to be approved in the register collection
    const userToApprove = await registerCollection.findOne({ _id: new ObjectId(id) });
    if (userToApprove) {
      await userCollection.insertOne(userToApprove);
      await registerCollection.deleteOne({ _id: new ObjectId(id) });
      closeConnection()
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

export { AddRegister, getAllUsers, DeleteUser, GetUserById, UpdateUser, getUserByEmail, getAllRegisteredUsers, DeleteReg, ApproveReg };

