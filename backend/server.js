const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = require('./config/database');

const User = require('./models/User');
const Track = require('./models/Track');
const Level = require('./models/Level');
const DailyChallenge = require('./models/DailyChallenge');
const Submission = require('./models/Submission');
const FeedPost = require('./models/FeedPost');
const Follow = require('./models/Follow');
const Mission = require('./models/Mission');
const MockTest = require('./models/MockTest');

const app = express();
app.use(cors());
app.use(express.json());

const mocktestRoute = require('./routes/ai/mocktest-route');
const chatRoute     = require('./routes/ai/chat-route');
const missionRoute  = require('./routes/ai/mission-route');

app.use('/api/ai', mocktestRoute);
app.use('/api/ai', chatRoute);
app.use('/api/ai', missionRoute);

const JWT_SECRET = process.env.JWT_SECRET || 'skillquest_secret_key';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hashedPassword, username,
      display_name: username, xp: 0, level_tier: 'Rookie',
      activity_log: [], badges: [], completed_levels: []
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server registration error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server login error' });
  }
});

app.get(['/api/auth/me', '/api/users/me'], authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch(['/api/auth/me', '/api/users/me'], authenticateToken, async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

app.delete('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.user.id } });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account" });
  }
});

app.post('/api/debug/reset-xp', authenticateToken, async (req, res) => {
  try {
    await User.update({
      xp: 0, level_tier: 'Rookie', activity_log: [], streak_days: 0
    }, { where: { id: req.user.id } });
    res.json({ message: "XP and streak reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
});

app.get('/api/tracks', async (req, res) => {
  try {
    const tracks = await Track.findAll({ order: [['order', 'ASC']] });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tracks' });
  }
});

app.get('/api/levels', async (req, res) => {
  try {
    const where = req.query.track_slug ? { track_slug: req.query.track_slug } : {};
    const levels = await Level.findAll({ where, order: [['order', 'ASC']] });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching levels' });
  }
});

app.get('/api/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByPk(req.params.id);
    res.json(level);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching level' });
  }
});

app.get('/api/daily', async (req, res) => {
  try {
    const challenges = await DailyChallenge.findAll({ where: req.query });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching daily challenges' });
  }
});

app.get('/api/daily/archive', async (req, res) => {
  try {
    const archive = await DailyChallenge.findAll({ order: [['date', 'DESC']], limit: 30 });
    res.json(archive);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching archive' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const subs = await Submission.findAll({ where: req.query, order: [['createdAt', 'DESC']] });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

app.post('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const sub = await Submission.create({ ...req.body, user_email: req.user.email });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Error saving submission' });
  }
});

app.get('/api/users/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const users = await User.findAll({ order: [['xp', 'DESC']], limit });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

app.get('/api/feed', async (req, res) => {
  try {
    const posts = await FeedPost.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

app.post('/api/feed', authenticateToken, async (req, res) => {
  try {
    const post = await FeedPost.create({ ...req.body, user_email: req.user.email });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error creating feed post' });
  }
});

app.get('/api/follows', authenticateToken, async (req, res) => {
  try {
    const follows = await Follow.findAll({ where: { follower_email: req.user.email } });
    res.json(follows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching follows' });
  }
});

app.post('/api/follows', authenticateToken, async (req, res) => {
  try {
    const follow = await Follow.create({ ...req.body, follower_email: req.user.email });
    res.json(follow);
  } catch (err) {
    res.status(500).json({ message: 'Error following user' });
  }
});

app.delete('/api/follows/:id', authenticateToken, async (req, res) => {
  try {
    await Follow.destroy({ where: { id: req.params.id, follower_email: req.user.email } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

app.get('/api/missions', authenticateToken, async (req, res) => {
  try {
    const missions = await Mission.findAll({
      where: { user_email: req.user.email, week_start: req.query.week_start }
    });
    res.json(missions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching missions' });
  }
});

app.patch('/api/missions/:id', authenticateToken, async (req, res) => {
  try {
    await Mission.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error updating mission' });
  }
});

app.post('/api/mocktests', authenticateToken, async (req, res) => {
  try {
    const test = await MockTest.create({ ...req.body, user_email: req.user.email });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: 'Error saving mock test' });
  }
});

const PORT = process.env.PORT;

sequelize.sync({ alter: true }).then(() => {
  console.log(' Database Success...connection established and tables synced.');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error(' Database sync failed:', err);
});