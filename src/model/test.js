import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      answers: {
        type: [String],
        required: true,
        validate: [arrayLimit, 'Must have exactly 4 answers']
      }
    }
  ]
});

function arrayLimit(val) {
  return val.length === 4;
}

const Test = mongoose.models.tests || mongoose.model('tests', testSchema);

export default Test;
