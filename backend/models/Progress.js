const mongoose = require("mongoose");

// Define Skill Modules and Skill Games
const SkillModule = {
    ROAD_CROSSING: 'road-crossing',
    PUBLIC_TRANSPORT:'public-transport',
    SHOPPING:'shopping',
};

const SkillGame = {
    ROAD_CROSSING_GAME:'road-crossing-game',
    PUBLIC_TRANSPORT_GAME:'public-transport-game',
    SHOPPING_GAME:'shopping-game',
};


// Progress Schema to store user progress for each skill module and game module
const ProgressSchema = new mongoose.Schema({
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true,
    },
    progress:{
        roadCrossing:{
            type:Number,
            default:0,
        },
        publicTransport:{
            type:Number,
            default:0,
        },
        shopping: {
            type:Number,
            default:0,
        },
    },
    skillGames:{
        roadCrossingGame:{
            type:Number,
            default:0,
        },
        publicTransportGame:{
            type:Number,
            default:0,
        },
        shoppingGame:{
            type:Number,
            default:0,
        },
    },
    overallProgress:{
        type:Number,
        default:0,
    }
});

const Progress = mongoose.model("Progress",ProgressSchema);
module.exports = Progress;