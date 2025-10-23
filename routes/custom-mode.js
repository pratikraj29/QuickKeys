// Custom Mode Routes for QuickKeys
const express = require('express');
const router = express.Router();
const { db, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } = require('../firebase-config');

// Save Custom Challenge Route
router.post('/save-challenge', async (req, res) => {
  try {
    const { userId, challengeData } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    if (!challengeData || !challengeData.text || !challengeData.timer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challenge text and timer are required' 
      });
    }

    // Validate text length
    if (challengeData.text.length < 20) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challenge text must be at least 20 characters long' 
      });
    }

    // Validate timer
    const timer = parseInt(challengeData.timer);
    if (isNaN(timer) || timer < 10 || timer > 3600) {
      return res.status(400).json({ 
        success: false, 
        error: 'Timer must be between 10 and 3600 seconds' 
      });
    }

    // Create challenge document
    const challengeId = Date.now().toString();
    const challenge = {
      id: challengeId,
      userId: userId,
      name: challengeData.name || `Custom Challenge ${new Date().toLocaleDateString()}`,
      text: challengeData.text.trim(),
      timer: timer,
      difficulty: challengeData.difficulty || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: challengeData.text.trim().split(/\s+/).length,
      characterCount: challengeData.text.trim().length,
      isActive: true
    };

    // Save to Firestore
    const challengeRef = doc(db, 'customChallenges', challengeId);
    await setDoc(challengeRef, challenge);

    // Also update user's current custom challenge
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      currentCustomChallenge: challengeId,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    console.log('Custom challenge saved:', challengeId);
    res.json({
      success: true,
      challengeId: challengeId,
      message: 'Custom challenge saved successfully!'
    });

  } catch (error) {
    console.error('Error saving custom challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save custom challenge: ' + error.message
    });
  }
});

// Get User's Custom Challenges Route
router.get('/challenges/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit: limitParam = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    // Query user's challenges
    const challengesRef = collection(db, 'customChallenges');
    const q = query(
      challengesRef,
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(parseInt(limitParam))
    );

    const querySnapshot = await getDocs(q);
    const challenges = [];
    
    querySnapshot.forEach((doc) => {
      challenges.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      challenges: challenges,
      count: challenges.length
    });

  } catch (error) {
    console.error('Error fetching custom challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch custom challenges: ' + error.message
    });
  }
});

// Get Specific Custom Challenge Route
router.get('/challenge/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;

    if (!challengeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challenge ID is required' 
      });
    }

    // Get challenge document
    const challengeRef = doc(db, 'customChallenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (!challengeDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Custom challenge not found'
      });
    }

    const challengeData = challengeDoc.data();
    
    res.json({
      success: true,
      challenge: {
        id: challengeDoc.id,
        ...challengeData
      }
    });

  } catch (error) {
    console.error('Error fetching custom challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch custom challenge: ' + error.message
    });
  }
});

// Get User's Current Custom Challenge Route
router.get('/current/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || !userDoc.data().currentCustomChallenge) {
      return res.json({
        success: true,
        challenge: null,
        message: 'No current custom challenge found'
      });
    }

    const currentChallengeId = userDoc.data().currentCustomChallenge;

    // Get the current challenge
    const challengeRef = doc(db, 'customChallenges', currentChallengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (!challengeDoc.exists()) {
      return res.json({
        success: true,
        challenge: null,
        message: 'Current custom challenge not found'
      });
    }

    const challengeData = challengeDoc.data();
    
    res.json({
      success: true,
      challenge: {
        id: challengeDoc.id,
        ...challengeData
      }
    });

  } catch (error) {
    console.error('Error fetching current custom challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current custom challenge: ' + error.message
    });
  }
});

// Delete Custom Challenge Route
router.delete('/challenge/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body;

    if (!challengeId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challenge ID and User ID are required' 
      });
    }

    // Get challenge to verify ownership
    const challengeRef = doc(db, 'customChallenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (!challengeDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Custom challenge not found'
      });
    }

    const challengeData = challengeDoc.data();
    
    // Verify ownership
    if (challengeData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own challenges'
      });
    }

    // Soft delete (mark as inactive)
    await setDoc(challengeRef, {
      isActive: false,
      deletedAt: new Date().toISOString()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Custom challenge deleted successfully!'
    });

  } catch (error) {
    console.error('Error deleting custom challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete custom challenge: ' + error.message
    });
  }
});

// Save Game Result Route
router.post('/save-result', async (req, res) => {
  try {
    const { userId, challengeId, gameResult } = req.body;

    if (!userId || !challengeId || !gameResult) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID, Challenge ID, and game result are required' 
      });
    }

    // Create result document
    const resultId = Date.now().toString();
    const result = {
      id: resultId,
      userId: userId,
      challengeId: challengeId,
      wpm: gameResult.wpm || 0,
      accuracy: gameResult.accuracy || 0,
      errors: gameResult.errors || 0,
      timeElapsed: gameResult.timeElapsed || 0,
      completionStatus: gameResult.completionStatus || 'completed',
      difficulty: gameResult.difficulty || 'medium',
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const resultRef = doc(db, 'gameResults', resultId);
    await setDoc(resultRef, result);

    // Update user's best scores if this is better
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updates = {};
      
      if (!userData.bestCustomWPM || gameResult.wpm > userData.bestCustomWPM) {
        updates.bestCustomWPM = gameResult.wpm;
      }
      
      if (!userData.bestCustomAccuracy || gameResult.accuracy > userData.bestCustomAccuracy) {
        updates.bestCustomAccuracy = gameResult.accuracy;
      }
      
      if (Object.keys(updates).length > 0) {
        updates.lastUpdated = new Date().toISOString();
        await setDoc(userRef, updates, { merge: true });
      }
    }

    res.json({
      success: true,
      resultId: resultId,
      message: 'Game result saved successfully!'
    });

  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save game result: ' + error.message
    });
  }
});

module.exports = router;