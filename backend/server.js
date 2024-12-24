const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3200;
const cors = require('cors');
app.use(cors());

// Use mongoose.set() to address the deprecation warning
mongoose.set('strictQuery', false);

const uri = process.env.MONGODB_URI || "mongodb+srv://sundarm9345:Sundar472004@foodrecipe.nr26n.mongodb.net/foodrecipe?retryWrites=true&w=majority";

console.log("MongoDB URI:", uri); // Log the connection string for debugging

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON bodies

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Sign-up route without password hashing
app.post('/sign-up', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).send('All fields are required');
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send('Email already exists');
    }

    const newUser = new User({ email: email.toLowerCase(), password });
    await newUser.save();

    res.send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Login route without password hashing
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).send('User not found');
    }

    if (password !== user.password) {
      return res.status(400).send('Incorrect password');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
