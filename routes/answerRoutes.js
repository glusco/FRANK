const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// Create an answer
router.post('/:questionId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      author: req.userId,
      question: req.params.questionId
    });

    await answer.save();
    question.answers.push(answer._id);
    await question.save();

    await answer.populate('author', 'username');
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an answer
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    answer.content = content;
    await answer.save();
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });

    await answer.remove();
    res.json({ message: 'Answer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on an answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const hasUpvoted = answer.upvotes.includes(req.userId);
    const hasDownvoted = answer.downvotes.includes(req.userId);

    if (voteType === 'up') {
      if (hasUpvoted) {
        answer.upvotes.pull(req.userId);
      } else {
        answer.upvotes.push(req.userId);
        if (hasDownvoted) {
          answer.downvotes.pull(req.userId);
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        answer.downvotes.pull(req.userId);
      } else {
        answer.downvotes.push(req.userId);
        if (hasUpvoted) {
          answer.upvotes.pull(req.userId);
        }
      }
    }

    await answer.save();
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept an answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const question = await Question.findById(answer.question);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove accepted status from all other answers
    await Answer.updateMany(
      { question: question._id },
      { isAccepted: false }
    );

    answer.isAccepted = true;
    await answer.save();
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 