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
      }
    }
  ]
});

const Test = mongoose.models.tests || mongoose.model('tests', testSchema);

export default Test;
