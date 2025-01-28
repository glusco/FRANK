const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// Create a question
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const question = new Question({
      title,
      content,
      tags,
      author: req.userId
    });
    
    await question.save();
    await question.populate('author', 'username');
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all questions (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments();

    res.json({
      questions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuestions: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username' }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await question.remove();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on a question
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const hasUpvoted = question.upvotes.includes(req.userId);
    const hasDownvoted = question.downvotes.includes(req.userId);

    if (voteType === 'up') {
      if (hasUpvoted) {
        question.upvotes.pull(req.userId);
      } else {
        question.upvotes.push(req.userId);
        if (hasDownvoted) {
          question.downvotes.pull(req.userId);
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        question.downvotes.pull(req.userId);
      } else {
        question.downvotes.push(req.userId);
        if (hasUpvoted) {
          question.upvotes.pull(req.userId);
        }
      }
    }

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 