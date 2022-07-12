require('dotenv').config();
require('express-async-errors');

// extra security package
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const express = require('express');
const app = express();

// connect to the database
const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

app.get('/', (req, res) => {
  res.send('jobs api')
})
// routes 
const authRouter = require('./routes/authRouter')
const jobsRouter = require('./routes/jobsRouter')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 100,  // 15 minutes,
    max: 100                  // limit each ip to 100 requests per windowMs 
  })
)
app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())




// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.SERVER_PORT || 3000;

const start = async () => {
  try {
    // connect to the database
    await connectDB(process.env.MONGO_URI)
      .then(() => console.log('*** DB CONNECTED ***'))
      .catch((error) => console.log(`Cannot connect to db, error: ${error}`))

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
