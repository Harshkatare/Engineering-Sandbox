const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("./User");

const app = express();
const PORT = process.env.PORT || 3001; // Running on 3001,so it never collides with Postgres(3000)

app.use(express.json());

// initialize the persistent DB connection loop
connectDB();

app.get("/health", (req, res) => {
  // readyState codes: 0 = disconnected,1 = connected,2 = connecting, 3 = disconnecting
  const dbStatus = mongoose.connection.readyState;

  if (dbStatus === 1) {
    return res.status(200).json({
      status: "healthy",
      database: "connected",
      engine: "MongoDB / Mongoose ODM",
      message: "Express and MongoDB are communicating perfectly!",
    });
  } else {
    return res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      readyState_code: dbStatus,
    });
  }
});

//post /users --creating a new user in MongoDB
app.post("/users", async (req, res) => {
  try {
    //In mongoose/NoSQL, we don't write query languages like SQL
    //simply create a model instance with the raw JS object and call .save()
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    res.status(200).json({
      success: true,
      engine: "MongoDB / Mongoose",
      data: savedUser,
    });
  } catch {
    console.error("[MongoDB Insert Error]:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Sandbox API server running on http://localhost:${PORT}`);
});
