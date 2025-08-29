import { Schema } from 'ottoman';

const UserSchema = new Schema({
  id: { type: String, auto: 'uuid' },
  name: { type: String, required: true },
  gender: { type: String, required: false, enum: ['M', 'F'] },
  phone: { type: String, required: true },
  email: { type: String, required: false },
  isEmployee: { type: Boolean, required: false },
  created: { type: String, required: true },
  updated: { type: String, required: true },
});

const ReservationSchema = new Schema({
  id: { type: String, auto: 'uuid' },
  user: { type: UserSchema, required: true, ref: 'user' },
  tableSize: { type: Number, required: true },
  expectedArrivalTime: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Requested', 'Approved', 'Cancelled', 'Completed'],
    default: 'Requested',
  },
  created: { type: String, required: true },
  updated: { type: String, required: true },
});

const CodeSchema = new Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
});

export { CodeSchema, UserSchema, ReservationSchema };
