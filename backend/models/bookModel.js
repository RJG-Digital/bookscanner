import mongoose from 'mongoose';
const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: ''
    },
    points: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    quizNumber: {
        type: Number,
        required: true
    },
    quizTypes: {
        type: [String],
        required: true
    },
    wordCount: {
        type: Number,
        required: true
    },
    interestLevel: {
        type: String,
        required: true
    },
    fictionNonFiction: {
        type: String,
        required: true
    },
    topics: {
        type: [String],
        required: true
    },
    series: {
        type: [String],
        required: true
    },
    languageCode: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    isbns: {
        type: [String],
        required: true
    },
    barcodes: {
        type: [String],
        required: true,
        default: []
    },
}, {
    timestamps: true
});
const Book = mongoose.model('Book', bookSchema);
export default Book;