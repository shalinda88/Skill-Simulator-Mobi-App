const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoutes');
const progressRoute = require('./routes/progressRoutes');
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users",userRoute);
app.use("/api/progress",progressRoute)

const PORT = process.env.PORT||5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));