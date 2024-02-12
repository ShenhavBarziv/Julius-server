import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AddRegister, Login, List, ListReg, DeleteReg, ApproveReg, DeleteUser, GetUserById, UpdateUser } from './mongo/conn';
import { UserType } from './types'; // Importing UserType from types.ts

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5000;

app.use(
  cors({
    origin: 'http://95.216.153.158',
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const disallowedTags: string[] = ['script', 'iframe', 'style'];

function validateInput(user: UserType): boolean {
  for (const [key, value] of Object.entries(user)) {
    for (const tag of disallowedTags) {
      if (
        value === '' ||
        value.length > 50 ||
        value.includes(`<${tag}`) ||
        value.includes(`</${tag}>`)
      ) {
        return false;
      }
    }
  }
  return true;
}

function createSecretToken(id: string): string {
  const token = jwt.sign({ id }, process.env.TOKEN_KEY!, {
    expiresIn: 24 * 60 * 60,
  });
  return token;
}

async function UserVerification(token: string | undefined) {
  if (!token) {
    return { status: false };
  }
  try {
    const data: any = await jwt.verify(token, process.env.TOKEN_KEY!);
    const user = await GetUserById(data.id);
    if (Object.keys(user).length > 0) {
      return { status: true, user: user };
    } else {
      return { status: false };
    }
  } catch (err) {
    return { status: false };
  }
}

app.get('/api', (req: Request, res: Response) => {
  res.send('hiiiiiii');
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (validateInput(req.body)) {
    const data = await Login(email, password);
    if ('user' in data && data.user._id) {
      const token = createSecretToken(data.user._id.toHexString());
      res.cookie('token', token, {
        httpOnly: false,
        sameSite: 'none',
        secure: false,
      });

      res.cookie('email', req.body.email, {
        httpOnly: false,
        sameSite: 'none',
        secure: false,
      });
    }
    res.status(200).json(data);
  } else {
    res.json({ msg: 'One of the inputs is invalid' });
  }
});

app.post('/api/register', async (req: Request, res: Response) => {
  const user: any = req.body;
  if (validateInput(req.body)) {
    const code: number = await AddRegister(user);
    if (code === 201) {
      res.cookie('email', user.email, {
        httpOnly: false,
        sameSite: 'none',
        secure: true,
      });
    }
    res.json({ code });
  } else {
    res.json({ code: 400, msg: 'One of the inputs is invalid' });
  }
});

app.get('/api/list', async (req: Request, res: Response) => {
  const userVerification: any = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status) {
    res.json({
      status: true,
      data: await List(),
      admin: userVerification.user.admin,
    });
  } else {
    res.json({ status: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
