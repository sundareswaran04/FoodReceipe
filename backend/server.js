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
app.use(cors()); // Allow specific origins
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection
const uri ="mongodb+srv://new-user-01:test123@foodrecipe.nr26n.mongodb.net/?retryWrites=true&w=majority&appName=FoodRecipe";

mongoose.set('strictQuery', false);
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000, 
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('Error connecting to MongoDB:', err));


app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login-page.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login-page.html'));
});



const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email format validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6 
  }
});

const commentSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true,
    match: /^[^\s@]+\@[^\s@]+\.[^\s@]+$/ // Email format validation
  },
  name:{
    type: String,
    required: true
  },
  comment:{
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  recipeId:{
    type: String,
    required: true
  }
});
const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);

app.post('/sign-up', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Input validation
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ email: email.toLowerCase(), password: hashedPassword });

    await newUser.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});





app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.post('/comment-post', async (req, res) => {
  const { email, name, comment, rating, recipeId } = req.body;

  if (!email || !name || !comment || !rating || !recipeId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newComment = new Comment({
      email: email.toLowerCase(),
      name: name,
      comment: comment,
      rating: rating,
      recipeId: recipeId
    });
    await newComment.save();
    res.json({ message: 'Comment posted successfully' });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Error posting comment' });
  }
});

app.get('/comment-section', async (req, res) => {
  const Id  = req.query.Id;

  if (!Id) {
  
    return res.status(400).json({ error: `Recipe ID is required${Id}` });
  }

  try {
    const comments = await Comment.find({ recipeId: Id });
    if (comments.length === 0) {
      return res.json([]); 
    }
    res.json(comments); 
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
