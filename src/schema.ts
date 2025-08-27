import { Schema } from 'ottoman';

const UserSchema = new Schema({
  id: { type: String, auto: 'uuid' },
  name: { type: String, required: true },
  gender: { type: String, required: false, enum: ['M', 'F'] },
  phone: { type: String, required: true },
  email: { type: String, required: false },
  isEmployee: { type: Boolean, required: false },
});

const ReservationSchema = new Schema({
  id: { type: String, auto: 'uuid' },
  user: { type: UserSchema, required: true, ref: 'user' },
  tableSize: { type: Number, required: true },
  expectedArrivalTime: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Requested', 'Approved', 'Cancelled', 'Completed'],
    default: 'Requested',
  },
});

export { UserSchema, ReservationSchema };
