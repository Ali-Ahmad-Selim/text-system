import mongoose from 'mongoose';

const permitSchema = new mongoose.Schema({
  Hazirlik: {
    permission: {
      type: String,
      enum: ['granted', 'denied'],
      default: 'denied',
      required: true
    }
  },
  Ibtidai: {
    permission: {
      type: String,
      enum: ['granted', 'denied'],
      default: 'denied',
      required: true
    }
  },
  Ihzari: {
    permission: {
      type: String,
      enum: ['granted', 'denied'],
      default: 'denied',
      required: true
    }
  },
  Hafizlik: {
    permission: {
      type: String,
      enum: ['granted', 'denied'],
      default: 'denied',
      required: true
    }
  }
});

const Permit = mongoose.models.permits || mongoose.model('permits', permitSchema);

export default Permit;
