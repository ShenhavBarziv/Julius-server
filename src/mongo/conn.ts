import { MongoClient, ObjectId } from 'mongodb';
import { compare, hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { USER_DATA_KEYS } from './constant';
import dotenv from 'dotenv';
import {
  UserType,
  UserTypeWithoutAdminAndId,
  UserTypeWithoutPassword,
  UserTypeWithoutAdminAndPassword,
} from '../types';

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
  return client.db(dbName);
}
async function AddRegister(user: UserTypeWithoutAdminAndId): Promise<number> {
  try {
    const db = await Connect();
    const registerCollection = db.collection(registerCollectionName);
    const existingUser = await registerCollection.findOne({ email: user.email });
    if ('admin' in user) { throw new Error("admin field is not in the signup page"); }
    if (existingUser) {
      console.log(`User with email ${user.email} already exists in the register collection.`);
      return 409; // Conflict status code
    }
    user.password = await hash(user.password, 10);
    await registerCollection.insertOne(user);
    console.log(`${user.name} inserted successfully.\n`);
    return 201; // Successfully inserted status code
  } catch (err) {
    console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    return 500; // Internal Server Error status code
  }
}

async function Login(email: string, password: string): Promise<{ user: UserTypeWithoutPassword; msg: string } | { msg: string }> {
  try {
    const db = await Connect();
    let collection = db.collection(userCollectionName);

    let user = (await collection.findOne({ email })) as UserType | null;
    if (user) {
      const passwordMatch = await compare(password, user.password);
      if (passwordMatch) {
        const { password, ...userDataWithoutPassword } = user;
        return { user: userDataWithoutPassword, msg: "Connected successfully" } as { user: UserTypeWithoutPassword, msg: string };
      } else {
        return { msg: "Email or password are incorrect" };
      }
    }

    // No user found in the first collection, checking the second collection
    collection = db.collection(registerCollectionName);
    user = (await collection.findOne({ email })) as UserType | null;

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

async function List(): Promise<UserTypeWithoutPassword[] | []> {
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const data = (await collection.find().toArray()) as UserType[] | [];
    if (!data || data.length === 0) { return []; }

    const filteredData: UserTypeWithoutPassword[] = data.map(({ _id, name, job, email, position, phoneNumber, hireDate, birthDate, admin }) => ({
      _id,
      name,
      job,
      email,
      position,
      phoneNumber,
      hireDate,
      birthDate,
      admin
    })) as UserTypeWithoutPassword[];
    return filteredData;
  } catch (err) {
    console.error(`Error finding users: ${err}`);
    throw new Error("An error occurred while fetching user data");
  }
}

async function ListReg(): Promise<UserTypeWithoutAdminAndPassword[] | { msg: string }> {
  try {
    const db = await Connect();
    const collection = db.collection(registerCollectionName);
    const data = (await collection.find().toArray()) as UserType[] | [];
    if (!data) { return []; }
    const filteredData: UserTypeWithoutAdminAndPassword[] = data.map(({ _id, name, job, email, position, phoneNumber, hireDate, birthDate, admin }) => ({
      _id,
      name,
      job,
      email,
      position,
      phoneNumber,
      hireDate,
      birthDate,
    })) as UserTypeWithoutAdminAndPassword[];
    return filteredData;
  } catch (err) {
    console.error(`Error finding users: ${err}`);
    return { msg: "An error occurred while fetching user data" };
  }
}

async function DeleteReg(id: string): Promise<{ status: number, msg: string }> {
  try {
    const db = await Connect();
    const collection = db.collection(registerCollectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      console.log(`User with id ${id} deleted successfully from the register collection.`);
      return { status: 200, msg: `User with id ${id} deleted successfully from the register collection.` };
    } else {
      return { status: 404, msg: `User with id ${id} not found in the register collection.` };
    }
  } catch (err) {
    console.error(`Error deleting user from register collection: ${err}`);
    return { status: 500, msg: `Error deleting user from register collection: ${err}` };
  }
}

async function ApproveReg(id: string): Promise<{ status: number, msg: string }> {
  try {
    const db = await Connect();
    const registerCollection = db.collection(registerCollectionName);
    const userCollection = db.collection(userCollectionName);

    const userToApprove = await registerCollection.findOne({ _id: new ObjectId(id) });

    if (userToApprove) {
      await userCollection.insertOne(userToApprove);
      await registerCollection.deleteOne({ _id: new ObjectId(id) });

      console.log(`User with id ${id} approved and moved to the users collection.`);
      return { status: 200, msg: `User with id ${id} approved and moved to the users collection.` };
    } else {
      console.log(`User with id ${id} not found in the register collection.`);
      return { status: 404, msg: `User with id ${id} not found in the register collection.` };
    }
  } catch (err) {
    console.error(`Error approving user in register collection: ${err}`);
    return { status: 500, msg: `Error approving user in register collection: ${err}` };
  }
}

async function DeleteUser(id: string): Promise<{ status: number, msg: string }> {
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      console.log(`User with id ${id} deleted successfully from the user collection.`);
      return { status: 200, msg: `User with id ${id} deleted successfully from the user collection.` };
    } else {
      console.log(`User with id ${id} not found in the user collection.`);
      return { status: 404, msg: `User with id ${id} not found in the user collection.` };
    }
  } catch (err) {
    console.error(`Error deleting user from user collection: ${err}`);
    return { status: 500, msg: `Error deleting user from user collection: ${err}` };
  }
}

async function GetUserById(userId: ObjectId): Promise<UserTypeWithoutPassword | { msg: string }> {
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const user = (await collection.findOne({ _id: new ObjectId(userId) })) as UserType | null;
    if (user) {
      const { password, ...userDataWithoutPassword } = user;
      return userDataWithoutPassword as UserTypeWithoutPassword;
    } else {
      console.log('User not found');
      return { msg: 'User not found' };
    }
  } catch (err) {
    console.error(`Error finding user by ID: ${err}`);
    return { msg: `Error finding user by ID: ${err}` };
  }
}

async function UpdateUser(userData: UserType): Promise<{ status: number, msg: string }> {
  const userId = userData._id;
  try {
    const db = await Connect();
    const collection = db.collection(userCollectionName);
    const { name, job, email, position, phoneNumber, hireDate, birthDate } = userData;

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name, job, email, position, phoneNumber, hireDate, birthDate } }
    );

    if (result.modifiedCount === 1) {
      console.log(`User with ID ${userId} updated successfully.`);
      return { status: 200, msg: `User with ID ${userId} updated successfully.` };
    } else {
      console.log(`User with ID ${userId} not found.`);
      return { status: 404, msg: `User with ID ${userId} not found.` };
    }
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    return { status: 500, msg: `Error updating user: ${error}` };
  }
}


export { AddRegister, Login, List, ListReg, DeleteReg, ApproveReg, DeleteUser, GetUserById, UpdateUser };

