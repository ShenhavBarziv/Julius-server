import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

function createToken(id: ObjectId | string) {
  const tokenKey = process.env.TOKEN_KEY as string;
  if (!tokenKey) {
    throw new Error('TOKEN_KEY environment variable is not defined');
  }

  return jwt.sign({ id }, tokenKey, {
    expiresIn: 24 * 60 * 60, // 24 hours expiration time
  });
}

async function verifyToken(token: string) {
  const tokenKey = process.env.TOKEN_KEY as string;
  if (!tokenKey) {
    throw new Error('TOKEN_KEY environment variable is not defined');
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, tokenKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

export { createToken, verifyToken };
