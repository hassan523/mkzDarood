import HistoryModel from "../models/HistorySchema.js";
import RealtimeCounterModel from "../models/RealtimeCounter.js";

const handleRealtimeCounter = async (req, res, next) => {
   try {
      const { seq, todayDate } = req.body;
      const { userId } = req.params;

      if (typeof seq !== "number") {
         return res.status(400).json({ message: "Seq must be a number" });
      }

      if (!userId) {
         return res.status(404).json({ message: "Invalid user" });
      }

      const userHistory = await HistoryModel.findOne({ userId });

      const backendTodayDate = new Date().toISOString().split("T")[0];
      const today = todayDate || backendTodayDate;

      if (userHistory) {
         const index = userHistory.histories.findIndex((item) => {
            return item.readDate.toISOString().split("T")[0] === today;
         });

         if (index > -1) {
            userHistory.histories[index].count += seq;
            userHistory.totalDarood = (Number(userHistory.totalDarood) || 0) + seq;
         } else {
            userHistory.histories.push({
               count: seq,
               readDate: new Date(today),
            });
            userHistory.totalDarood = (Number(userHistory.totalDarood) || 0) + seq;
         }

         await userHistory.save();
      } else {
         await HistoryModel.create({
            userId,
            histories: [
               {
                  count: seq,
                  readDate: new Date(today),
               },
            ],
            totalDarood: seq,
         });
      }

      const updatedCounter = await RealtimeCounterModel.findOneAndUpdate({}, { $inc: { seq } }, { new: true, upsert: true });

      res.status(200).json({
         message: `Seq incremented by ${seq}`,
         seq: updatedCounter.seq,
      });
   } catch (error) {
      console.error("Error incrementing counter:", error);
      next(error);
   }
};

const handleGetRealtimeCounter = async (req, res, next) => {
   try {
      const getCounter = await RealtimeCounterModel.find();
      res.status(200).json({ seq: getCounter[0].seq || [] });
   } catch (error) {
      console.log("");
      next(error);
   }
};

const handleResetRealtimeCounter = async (req, res, next) => {
   try {
      const updatedCounter = await RealtimeCounterModel.findOneAndUpdate({}, { $set: { seq: 0 } }, { new: true, upsert: true });

      res.status(200).json({
         message: "Counter reset successfully",
         seq: updatedCounter.seq,
      });
   } catch (error) {
      console.error("Error resetting counter:", error);
      next(error);
   }
};

export { handleRealtimeCounter, handleGetRealtimeCounter, handleResetRealtimeCounter };
