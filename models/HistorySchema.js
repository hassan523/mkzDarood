import mongoose from "mongoose";
const { Schema } = mongoose;

const historyItemSchema = new mongoose.Schema(
   {
      count: {
         type: Number,
         required: true,
      },

      readDate: {
         type: Date,
         default: Date.now,
      },
   },
   { timestamps: true },
);

const HistorySchema = new Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "users",
         required: true,
         unique: true,
      },
      histories: [historyItemSchema],
      totalDarood: { type: Number, required: true },
   },
   { timestamps: true },
);

const HistoryModel = mongoose.model("history", HistorySchema);

export default HistoryModel;
