import mongoose from "mongoose";
const Emotions = mongoose.Schema({
    HAPPY: {
        type: Number,
        required: true
    },
    SAD: {
        type: Number,
        required: true
    },
    ANGRY: {
        type: Number,
        required: true
    },
    CALM: {
        type: Number,
        required: true
    },
    DISGUSTED: {
        type: Number,
        required: true
    },
    FEAR: {
        type: Number,
        required: true
    },
    SURPRISED: {
        type: Number,
        required: true
    },
    CONFUSED: {
        type: Number,
        required: true
    },
});
export default mongoose.model('emotions', Emotions);