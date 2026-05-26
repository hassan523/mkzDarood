import mongoose from "mongoose";
import { type } from "os";
const { Schema } = mongoose;

const BiometricSchema = new Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },

      publicKey: {
         type: String,
         required: true,
      },

      deviceId: {
         type: String,
         required: true,
      },

      enabled: {
         type: Boolean,
         default: true,
      },

      lastUsedAt: {
         type: Date,
         default: null,
      },
      nonce: {
         value: {
            type: String,
            default: null,
         },
         expiry: {
            type: Date,
            default: null,
         },
      },
   },
   { timestamps: true },
);

const BiometricModel = mongoose.model("biometric", BiometricSchema);

export default BiometricModel;
