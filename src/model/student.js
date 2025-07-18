import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  paperTitle: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
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
  group: {
    type: String,
    required: true,
    enum: ['Hazirlik', 'Ibtidai', 'Ihzari', 'Hafizlik'],
    trim: true
  },
  history: {
    type: [historySchema],
    default: [],
  },
});

const Student = mongoose.models.students || mongoose.model('students', studentSchema);

export default Student;
