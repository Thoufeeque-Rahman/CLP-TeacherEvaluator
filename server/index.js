const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // <-- Move this up!
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://daily-viva-tracker.onrender.com", // Replace with your React app's URL
    // origin: "http://localhost:5173", // Replace with your React app's URL
    credentials: true,
  })
);
app.use(express.json());

// Define routes
app.get("/api/test", (req, res) => {
  res.send("API is running...");
});

// Import routes
const studentRoutes = require("./routes/students");
const teachersRoutes = require("./routes/teachers");
const roundsRoutes = require("./routes/rounds");


// Use routes
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/rounds", roundsRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB 
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// // Session setup
// app.use( 
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );

// Then static files
app.use(express.static(path.join(__dirname, '../client/dist')));

const staticPath = path.join(__dirname, '../client/dist/index.html');
console.log('Serving static files from:', staticPath);

// THEN catch-all route
app.get(/^(?!\/?api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
