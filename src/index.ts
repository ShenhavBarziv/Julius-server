import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoute from './routes/authRoute'
import userRoutes from './routes/userRoutes';
import adminRoute from './routes/adminRoute'
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

app.use('/api/auth', authRoute);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});