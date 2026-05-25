import mongoose from "mongoose";
import BiometricModel from "../models/BioMetricSchema.js";
import UserModel from "../models/UserSchema.js";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/TokenGenerator.js";
import { formatPublicKey } from "../utils/formatPublicKey.js";

// ENDPOINT: /api/biometric/register-biometric/:userId
const handleCreateBiometric = async (req, res, next) => {
   try {
      const userId = req.params.userId;
      const { publicKey, deviceId } = req.body;
      const findUser = await UserModel.findById(userId);

      if (!findUser) {
         return res.status(404).json({ message: "User not found" });
      }

      if (!publicKey) {
         return res.status(404).json({ message: "Invalid Public key" });
      }

      const findBioMetric = await BiometricModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (findBioMetric) {
         return res.status(409).json({ message: "Biometric already registered" });
      }

      const biometric = new BiometricModel({
         userId,
         publicKey,
         deviceId,
         enabled: true,
         lastUsedAt: new Date(),
      });
      await biometric.save();

      return res.status(200).json({ message: "Biometric Verification Save successfully", enabled: true });
   } catch (error) {
      next(error);
   }
};

// ENDPOINT: /api/biometric/create-nonce
const handleCreateNonce = async (req, res, next) => {
   try {
      const { deviceId } = req.body;

      const findBioMetric = await BiometricModel.findOne({ deviceId: deviceId });

      if (!findBioMetric) {
         return res.status(409).json({ message: "Biometric not found" });
      }

      const nonce = crypto.randomBytes(32).toString("hex");
      const nonceExpiry = new Date(Date.now() + 60 * 1000);

      findBioMetric.nonce.value = nonce;
      findBioMetric.nonce.expiry = nonceExpiry;

      await findBioMetric.save();

      return res.status(200).json({
         message: "Challenge generated",
         nonce,
         expiresIn: 60,
      });
   } catch (error) {
      next(error);
   }
};

// ENDPOINT: /api/biometric/verify-user
const handleVerifyNonce = async (req, res, next) => {
   try {
      const { storedDeviceID, nonce, signature, deviceId } = req.body;

      const findBioMetric = await BiometricModel.findOne({ deviceId: storedDeviceID });

      if (!findBioMetric) {
         return res.status(409).json({ message: "Biometric not found" });
      }

      if (findBioMetric.nonce.value !== nonce) {
         return res.status(401).json({ message: "Invalid challenge" });
      }

      if (!findBioMetric.nonce.expiry || findBioMetric.nonce.expiry < new Date()) {
         return res.status(410).json({ message: "Challenge expired" });
      }

      const findUser = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(findBioMetric.userId) });

      if (!findUser) {
         return res.status(409).json({ message: "User not found" });
      }

      const signatureBuffer = Buffer.from(signature, "base64");

      const pemKey = formatPublicKey(findBioMetric.publicKey);

      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(nonce);
      verifier.end();

      const verified = verifier.verify(pemKey, signatureBuffer);

      console.log(verified);

      if (!verified) {
         return res.status(401).json({ message: "Fingerprint verification failed" });
      }

      findBioMetric.nonce.value = null;
      findBioMetric.nonce.expiry = null;
      findBioMetric.lastUsedAt = new Date();

      await findBioMetric.save();

      const accessToken = generateAccessToken(findUser, deviceId);
      const refreshToken = generateRefreshToken(findUser, deviceId);

      findUser.refreshTokens = findUser.refreshTokens.filter((entry) => entry.deviceId !== deviceId);

      findUser.refreshTokens.push({
         token: refreshToken,
         deviceId: deviceId,
      });
      await findUser.save();

      console.log(findUser);

      res.status(200).json({ accessToken, refreshToken, user: findUser });
   } catch (error) {
      next(error);
   }
};

// ENDPOINT: /api/biometric/verify-user
const handleGetBioMetric = async (req, res, next) => {
   try {
      const { storedDeviceID, nonce, signature, deviceId } = req.body;

      const findBioMetric = await BiometricModel.findOne({ deviceId: storedDeviceID });

      if (!findBioMetric) {
         return res.status(409).json({ message: "Biometric not found" });
      }

      if (findBioMetric.nonce.value !== nonce) {
         return res.status(401).json({ message: "Invalid challenge" });
      }

      if (!findBioMetric.nonce.expiry || findBioMetric.nonce.expiry < new Date()) {
         return res.status(410).json({ message: "Challenge expired" });
      }

      const findUser = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(findBioMetric.userId) });

      if (!findUser) {
         return res.status(409).json({ message: "User not found" });
      }

      const signatureBuffer = Buffer.from(signature, "base64");

      const pemKey = formatPublicKey(findBioMetric.publicKey);

      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(nonce);
      verifier.end();

      const verified = verifier.verify(pemKey, signatureBuffer);

      console.log(verified);

      if (!verified) {
         return res.status(401).json({ message: "Fingerprint verification failed" });
      }

      findBioMetric.nonce.value = null;
      findBioMetric.nonce.expiry = null;
      findBioMetric.lastUsedAt = new Date();

      await findBioMetric.save();

      const accessToken = generateAccessToken(findUser, deviceId);
      const refreshToken = generateRefreshToken(findUser, deviceId);

      findUser.refreshTokens = findUser.refreshTokens.filter((entry) => entry.deviceId !== deviceId);

      findUser.refreshTokens.push({
         token: refreshToken,
         deviceId: deviceId,
      });
      await findUser.save();

      console.log(findUser);

      res.status(200).json({ accessToken, refreshToken, user: findUser });
   } catch (error) {
      next(error);
   }
};

// ENDPOINT: /api/biometric/delete-biometric/:userId
const handleDeleteBiometric = async (req, res, next) => {
   try {
      const userId = req.params.userId;
      const findUser = await UserModel.findById(userId);

      if (!findUser) {
         return res.status(404).json({ message: "User not found" });
      }

      const findBioMetric = await BiometricModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!findBioMetric) {
         return res.status(409).json({ message: "Biometric not found" });
      }

      await BiometricModel.findOneAndDelete({ userId: new mongoose.Types.ObjectId(userId) });

      return res.status(200).json({ message: "Biometric removed successfully", enabled: false });
   } catch (error) {
      next(error);
   }
};

export { handleCreateBiometric, handleDeleteBiometric, handleCreateNonce, handleVerifyNonce, handleGetBioMetric };
