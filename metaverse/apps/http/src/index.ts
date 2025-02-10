import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { adminRouter } from './router/admin.router';
import { spaceRouter } from './router/space.router';
import { userRouter } from './router/user.router';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('combined'));
app.use(json());
app.use(urlencoded({ extended: true }));


const corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later',
// });
// app.use(limiter);

app.use('/api',adminRouter)
app.use('/api',userRouter)
app.use('/api',spaceRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
