import express from 'express';
const app = express();
import cors from 'cors';
import path from 'path';
import connectDB from './db/connectDB.js';
import router from './router/web.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
app.set('views','./views');
app.set('view engine','ejs');
app.use(express.static(path.join(process.cwd(),'public')));

const DATABASE_URL = process.env.DATABASE_URL ;
connectDB(DATABASE_URL);

const corsOptions = {
    origin : 'http://localhost:3000',
    methods : "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials : true,
};
app.use(cors(corsOptions));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.json());
app.use('/',router);


const port = process.env.PORT;

app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
});