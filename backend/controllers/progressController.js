const Progress = require('../models/Progress');

// Progress Controller
const progressController = {
    // Get Progress for all skills and games for a user
    getFullProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            const progress = await Progress.findOne({ userId });

            if (!progress) {
                // Create new progress record if none exists
                const newProgress = new Progress({ userId });
                await newProgress.save();
                return res.status(200).json({
                    success: true,
                    progress: newProgress
                });
            }

            return res.status(200).json({ success: true, progress });
        } catch (error) {
            console.error('Error fetching progress: ', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch progress',
                error: error.message
            });
        }
    },

    // Get Progress for a specific skill module
    getSkillModuleProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            const { moduleType } = req.params;

            const progress = await Progress.findOne({ userId });
            if (!progress) {
                return res.status(404).json({
                    success: false,
                    message: 'Progress not found'
                });
            }

            let moduleProgress;
            switch (moduleType) {
                case 'road-crossing':
                    moduleProgress = progress.progress.roadCrossing;
                    break;
                case 'public-transport':
                    moduleProgress = progress.progress.publicTransport;
                    break;
                case 'shopping':
                    moduleProgress = progress.progress.shopping;
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid module type'
                    });
            }

            return res.status(200).json({
                success: true,
                moduleType,
                progress: moduleProgress
            });
        } catch (error) {
            console.error('Error fetching module progress:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch module progress',
                error: error.message
            });
        }
    },

    // Get Progress for a specific skill game
    getSkillGameProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            const { gameType } = req.params;

            const progress = await Progress.findOne({ userId });
            if (!progress) {
                return res.status(404).json({
                    success: false,
                    message: 'Progress not found for this user'
                });
            }

            let gameProgress;
            switch (gameType) {
                case 'road-crossing-game':
                    gameProgress = progress.skillGames.roadCrossingGame;  // Corrected here
                    break;
                case 'public-transport-game':
                    gameProgress = progress.skillGames.publicTransportGame;  // Corrected here
                    break;
                case 'shopping-game':
                    gameProgress = progress.skillGames.shoppingGame;  // Corrected here
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid game type'
                    });
            }

            return res.status(200).json({
                success: true,
                gameType,
                progress: gameProgress
            });
        } catch (error) {
            console.error('Error fetching game progress:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch game progress',
                error: error.message
            });
        }
    },

    // Update progress for a specific skill module
    updateSkillModuleProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            const { moduleType } = req.params;
            const { progressValue } = req.body;

            if (progressValue === undefined || progressValue < 0 || progressValue > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid progress value. Value must be between 0 and 100.'
                });
            }

            let updateQuery = {};

            switch (moduleType) {
                case 'road-crossing':
                    updateQuery = { 'progress.roadCrossing': progressValue };
                    break;
                case 'public-transport':
                    updateQuery = { 'progress.publicTransport': progressValue };
                    break;
                case 'shopping':
                    updateQuery = { 'progress.shopping': progressValue };
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid module type'
                    });
            }

            const updatedProgress = await Progress.findOneAndUpdate(
                { userId },
                { $set: updateQuery },
                { new: true, upsert: true }
            );

            return res.status(200).json({
                success: true,
                updatedProgress
            });
        } catch (error) {
            console.error('Error updating module progress:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update module progress',
                error: error.message
            });
        }
    },

    // Update progress for a specific skill game
    updateSkillGameProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            const { gameType } = req.params;
            const { progressValue } = req.body;

            if (progressValue === undefined || progressValue < 0 || progressValue > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid progress value. Value must be between 0 and 100.'
                });
            }

            let updateQuery = {};

            switch (gameType) {
                case 'road-crossing-game':
                    updateQuery = { 'skillGames.roadCrossingGame': progressValue };
                    break;
                case 'public-transport-game':
                    updateQuery = { 'skillGames.publicTransportGame': progressValue };
                    break;
                case 'shopping-game':
                    updateQuery = { 'skillGames.shoppingGame': progressValue };
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid game type'
                    });
            }

            const updatedProgress = await Progress.findOneAndUpdate(
                { userId },
                { $set: updateQuery },
                { new: true, upsert: true }
            );

            return res.status(200).json({
                success: true,
                updatedProgress
            });
        } catch (error) {
            console.error('Error updating game progress:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update game progress',
                error: error.message
            });
        }
    },

    // Get all game progress
    getAllGameProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            let progress = await Progress.findOne({ userId });

            // If no progress exists, create a new one with default values
            if (!progress) {
                progress = new Progress({
                    userId,
                    skillGames: {
                        roadCrossingGame: 0,
                        publicTransportGame: 0,
                        shoppingGame: 0
                    }
                });
                await progress.save();
            }

            // Return only the skill game progress
            const gameProgress = {
                roadCrossingGame: progress.skillGames.roadCrossingGame,
                publicTransportGame: progress.skillGames.publicTransportGame,
                shoppingGame: progress.skillGames.shoppingGame
            };

            return res.status(200).json({
                success: true,
                gameProgress
            });
        } catch (error) {
            console.error('Error fetching all game progress:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch game progress',
                error: error.message
            });
        }
    },

    // Get all module progress
    getAllModuleProgress: async (req, res) => {
        try {
            const userId = req.user._id;

            // Try to find existing progress
            let progress = await Progress.findOne({ userId });

            // If no progress exists, create a new one with default values
            if (!progress) {
                progress = new Progress({
                    userId,
                    progress: {
                        roadCrossing: 0,
                        publicTransport: 0,
                        shopping: 0
                    }
                });
                await progress.save();
            }

            // Return only the skill module progress
            const moduleProgress = {
                roadCrossing: progress.progress.roadCrossing,
                publicTransport: progress.progress.publicTransport,
                shopping: progress.progress.shopping
            };

            return res.status(200).json(moduleProgress);
        } catch (error) {
            console.error('Error fetching all module progress:', error);
            return res.status(500).json({
                message: 'Failed to fetch module progress',
                error: error.message
            });
        }
    },

    // get prgress based on student id
    getStudentProgress: async (req,res) => {
        try {
            const {studentId} = req.params;
            let progress = await Progress.findOne({userId: studentId});
            if (!progress){
                progress = new Progress({
                    userId: studentId,
                    progress:{
                        roadCrossing: 0,
                        publicTransport: 0,
                        shopping: 0,
                    },
                    skillGames:{
                        roadCrossingGame: 0,
                        publicTransportGame: 0,
                        shoppingGame: 0
                    },
                    overallProgress:0
                });
                await progress.save();
            }
            return res.status(200).json(progress);
        }catch (error){
            console.error('Error fetching student progress:',error);
            res.status(500).json({message:'Error fetching student progress',error:error.message});
        }
    }
};

module.exports = progressController;