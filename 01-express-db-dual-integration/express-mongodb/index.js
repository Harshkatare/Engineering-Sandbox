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
  } catch (error) {
    console.error("[MongoDB Insert Error]:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// record a new login event (using next for centralized errors)
app.post("/logs", async (req, res, next) => {
  const { user_id, device_type, ip_address } = req.body;

  try {
    // in mongoDB, locate the user document and $push the new log into the array
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $push: {
          login_history: {device_type, ip_address}
        }
      },
      // returns the updated doc after mutation
      { 
        new: true, 
        runValidators: true
      }
    );

    if(!updatedUser){
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    // return the newly appended log(last element in the array)
    const newLog = updatedUser.login_history[updatedUser.login_history.length - 1];
    res.status(201).json({
      success: true,
      data: newLog
    });
  } catch (error) {
      //automatically forward validation for casting errors to the global interceptor
      next(error);
  }
});

// Generate the report (using next for centralized errors)
app.get("/users/:id/report", async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// performance test: Filter by embedded log device type using the index
app.get("/perf/mongodb", async (req, res) => {
  const { device } = req.query; //example: /perf/mongodb?device=Mobile (android/chrome)

  try {
    // .explain("executionStats") extracts the deep diagnostic engine stats
    const stats = await User.find({ "login_history.device_type": device }).explain("executionStats");

    res.status(200).json({
      success: true,
      summary: {
        execution_stages: stats.executionStats.executionStages,
        total_docs_examined: stats.executionStats.totalDocsExamined,
        total_keys_examined: stats.executionStats.totalKeysExamined
      }
    });
  } catch (error) {
    console.error("[MongoDB perf Error]:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.error(`🚨 [Global Error Interceptor]: ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    engine: "MongoDB",
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Sandbox API server running on http://localhost:${PORT}`);
});
