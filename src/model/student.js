
import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
  marks: {
    type: Number,
    default: null,
  },
}, { _id: false }); // _id: false prevents auto-id generation for each history item

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
  },
  history: {
    type: [historySchema],
    default: [],
  },
});

const Student= mongoose.models.students || mongoose.model('students', studentSchema);

export default Student;
