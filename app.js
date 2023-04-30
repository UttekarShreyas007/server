const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('./config');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');  
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000/",
    credentials: true,
  })
);
// Connect to MongoDB
mongoose.connect(config.mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

  const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: "sessions",
  });

  app.use(
    session({
      secret: "iuZeL0LrnkO5K$edr3RWD!S!q",
      resave: false,
      saveUninitialized: false,
      store: store, 
      cookie: {
        maxAge: 3600000, //3600000ms = 1hr
        sameSite: false,
      },
    })
  );
  
 
  app.use(bodyParser.json());
  app.use(morgan('dev'));
  app.use(cookieParser());
  
// Use middleware
// Authorization middleware
app.use(authMiddleware);

// Error handling middleware
app.use(errorHandler);



// Use routes
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);




// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
