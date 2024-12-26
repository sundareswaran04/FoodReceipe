const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3200;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb+srv://sundarm9345:Sundar472004@foodrecipe.nr26n.mongodb.net/foodrecipe?retryWrites=true&w=majority";

mongoose.set('strictQuery', false);

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Static Files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, './backend')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..frontend/login-page.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login-page.html'));
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// User Registration Route
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

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving it

    const newUser = new User({ email: email.toLowerCase(), password: hashedPassword });
    await newUser.save();

    res.send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// User Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare hashed passwords
    if (!isMatch) {
      return res.status(400).send('Incorrect password');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
