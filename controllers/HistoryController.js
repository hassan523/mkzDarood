import mongoose from "mongoose";
import AdminModel from "../models/AdminSchema.js";
import HistoryModel from "../models/HistorySchema.js";
import UserModel from "../models/UserSchema.js";
import SearchQuery from "../utils/SearchQuery.js";
import RealtimeCounterModel from "../models/RealtimeCounter.js";

// GET HISTORY
// /api/history/get-history/:userId
// const handleGetHistory = async (req, res, next) => {
//    try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;
//       const skip = (page - 1) * limit;

//       const search = req.query.search || {};
//       const { from, to } = req.query;
//       const userId = req.params.userId;

//       // 🔥 SAFE MATCH STAGE (NEVER NULL)
//       let matchStage = SearchQuery(search) || {};

//       console.log({ from, to });

//       // 🔥 CHECK USER / ADMIN
//       const findHistory = (await UserModel.findById(userId)) || (await AdminModel.findById(userId));

//       if (!findHistory) {
//          return res.status(404).json({ message: "Invalid User" });
//       }

//       const userType = findHistory.role;

//       // Helper function to create date filter
//       const createDateFilter = () => {
//          if (!from && !to) return null;

//          const conditions = [];

//          if (from) {
//             conditions.push({
//                $gte: ["$$item.readDate", new Date(from)],
//             });
//          }

//          if (to) {
//             // Set to end of day to include full day
//             const endDate = new Date(to);
//             endDate.setHours(23, 59, 59, 999);
//             conditions.push({
//                $lte: ["$$item.readDate", endDate],
//             });
//          }

//          return {
//             $filter: {
//                input: "$histories",
//                as: "item",
//                cond: conditions.length === 1 ? conditions[0] : { $and: conditions },
//             },
//          };
//       };

//       const dateFilter = createDateFilter();

//       // ================= USER =================
//       if (userType === "User") {
//          const pipeline = [];

//          // MATCH FIRST
//          pipeline.push({
//             $match: {
//                userId: new mongoose.Types.ObjectId(userId),
//             },
//          });

//          // APPLY SEARCH FILTERS
//          if (Object.keys(matchStage).length > 0) {
//             pipeline.push({
//                $match: matchStage,
//             });
//          }

//          // 🔥 FILTER HISTORIES ARRAY BY DATE
//          if (dateFilter) {
//             pipeline.push({
//                $addFields: {
//                   histories: dateFilter,
//                },
//             });
//          }

//          // 🔥 UNWIND TO PAGINATE INDIVIDUAL HISTORY ITEMS
//          pipeline.push({
//             $unwind: {
//                path: "$histories",
//                preserveNullAndEmptyArrays: false, // Remove empty histories
//             },
//          });

//          // SORT BY HISTORY ITEM DATE
//          pipeline.push({ $sort: { "histories.readDate": -1 } });

//          // 🔥 PAGINATE AT HISTORY ITEM LEVEL
//          // First, get total count before pagination
//          const countPipeline = [...pipeline, { $count: "totalItems" }];

//          // Then apply pagination
//          pipeline.push({ $skip: skip });
//          pipeline.push({ $limit: limit });

//          // 🔥 GROUP BACK TO ORIGINAL STRUCTURE
//          pipeline.push({
//             $group: {
//                _id: "$_id",
//                userId: { $first: "$userId" },
//                totalDarood: { $first: "$totalDarood" },
//                histories: { $push: "$histories" },
//                createdAt: { $first: "$createdAt" },
//                updatedAt: { $first: "$updatedAt" },
//             },
//          });

//          // LOOKUP USER
//          pipeline.push({
//             $lookup: {
//                from: "users",
//                localField: "userId",
//                foreignField: "_id",
//                as: "userData",
//             },
//          });

//          pipeline.push({
//             $unwind: {
//                path: "$userData",
//                preserveNullAndEmptyArrays: true,
//             },
//          });

//          // PROJECT
//          pipeline.push({
//             $project: {
//                _id: 1,
//                userId: 1,
//                histories: 1,
//                totalDarood: 1,
//                createdAt: 1,
//                updatedAt: 1,
//                userData: {
//                   _id: 1,
//                   username: 1,
//                   email: 1,
//                   phone: 1,
//                   profilePicture: 1,
//                   role: 1,
//                   country: 1,
//                   city: 1,
//                },
//             },
//          });

//          // Execute count pipeline
//          const countResult = await HistoryModel.aggregate(countPipeline);
//          const totalItems = countResult.length > 0 ? countResult[0].totalItems : 0;
//          const totalPages = Math.ceil(totalItems / limit);

//          // Execute main pipeline
//          const history = await HistoryModel.aggregate(pipeline);

//          return res.status(200).json({
//             history,
//             meta: {
//                totalItems,
//                totalPages,
//                page,
//                limit,
//             },
//          });
//       }

//       // ================= ADMIN =================
//       else if (userType === "Admin") {
//          const pipeline = [];

//          // APPLY SEARCH FILTERS
//          if (Object.keys(matchStage).length > 0) {
//             pipeline.push({ $match: matchStage });
//          }

//          // 🔥 FILTER HISTORIES ARRAY BY DATE
//          if (dateFilter) {
//             pipeline.push({
//                $addFields: {
//                   histories: dateFilter,
//                },
//             });
//          }

//          // 🔥 UNWIND TO PAGINATE INDIVIDUAL HISTORY ITEMS
//          pipeline.push({
//             $unwind: {
//                path: "$histories",
//                preserveNullAndEmptyArrays: false,
//             },
//          });

//          // SORT BY HISTORY ITEM DATE
//          pipeline.push({ $sort: { "histories.readDate": -1 } });

//          // Count total before pagination
//          const countPipeline = [...pipeline, { $count: "totalItems" }];

//          // Apply pagination
//          pipeline.push({ $skip: skip });
//          pipeline.push({ $limit: limit });

//          // 🔥 GROUP BACK TO ORIGINAL STRUCTURE
//          pipeline.push({
//             $group: {
//                _id: "$_id",
//                userId: { $first: "$userId" },
//                histories: { $push: "$histories" },
//                createdAt: { $first: "$createdAt" },
//                updatedAt: { $first: "$updatedAt" },
//             },
//          });

//          // LOOKUP USER
//          pipeline.push({
//             $lookup: {
//                from: "users",
//                localField: "userId",
//                foreignField: "_id",
//                as: "userData",
//             },
//          });

//          pipeline.push({
//             $unwind: {
//                path: "$userData",
//                preserveNullAndEmptyArrays: true,
//             },
//          });

//          // PROJECT
//          pipeline.push({
//             $project: {
//                _id: 1,
//                userId: 1,
//                histories: 1,
//                createdAt: 1,
//                updatedAt: 1,
//                userData: {
//                   _id: 1,
//                   username: 1,
//                   email: 1,
//                   phone: 1,
//                   profilePicture: 1,
//                   role: 1,
//                   country: 1,
//                   city: 1,
//                },
//             },
//          });

//          // Execute count pipeline
//          const countResult = await HistoryModel.aggregate(countPipeline);
//          const totalItems = countResult.length > 0 ? countResult[0].totalItems : 0;
//          const totalPages = Math.ceil(totalItems / limit);

//          // Execute main pipeline
//          const history = await HistoryModel.aggregate(pipeline);
//          console.log(history);
//          return res.status(200).json({
//             history,
//             meta: {
//                totalItems,
//                totalPages,
//                page,
//                limit,
//             },
//          });
//       }

//       return res.status(404).json({ message: "Invalid User Type" });
//    } catch (error) {
//       console.log(error);
//       next(error);
//    }
// };

const handleGetHistory = async (req, res, next) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const search = req.query.search || {};
      const { from, to } = req.query;
      const userId = req.params.userId;

      let matchStage = SearchQuery(search) || {};

      const findHistory = (await UserModel.findById(userId)) || (await AdminModel.findById(userId));

      if (!findHistory) {
         return res.status(404).json({ message: "Invalid User" });
      }

      const userType = findHistory.role;

      // ================= BASE PIPELINE =================
      const pipeline = [];

      if (userType === "User") {
         pipeline.push({
            $match: {
               userId: new mongoose.Types.ObjectId(userId),
            },
         });
      }

      pipeline.push({
         $unwind: "$histories",
      });

      // ================= SEARCH =================
      if (Object.keys(matchStage).length > 0) {
         pipeline.push({
            $match: matchStage,
         });
      }

      // ================= DATE FILTER =================
      if (from || to) {
         const dateMatch = {};

         if (from) {
            dateMatch["histories.readDate"] = {
               ...dateMatch["histories.readDate"],
               $gte: new Date(from),
            };
         }

         if (to) {
            const endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);

            dateMatch["histories.readDate"] = {
               ...dateMatch["histories.readDate"],
               $lte: endDate,
            };
         }

         pipeline.push({
            $match: dateMatch,
         });
      }

      // ================= SORT =================
      pipeline.push({
         $sort: { "histories.readDate": -1 },
      });

      // ================= FACET =================
      const finalPipeline = [
         ...pipeline,
         {
            $facet: {
               data: [
                  { $skip: skip },
                  { $limit: limit },
                  {
                     $group: {
                        _id: "$_id",
                        userId: { $first: "$userId" },
                        totalDarood: { $first: "$totalDarood" },
                        histories: { $push: "$histories" },
                     },
                  },
                  {
                     $lookup: {
                        from: "users", // collection name (IMPORTANT)
                        localField: "userId",
                        foreignField: "_id",
                        as: "userData",
                     },
                  },
                  {
                     $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true,
                     },
                  },
               ],

               meta: [{ $count: "totalItems" }],

               filterTotal: [
                  {
                     $group: {
                        _id: null,
                        total: { $sum: "$histories.count" },
                     },
                  },
               ],
            },
         },
      ];
      const result = await HistoryModel.aggregate(finalPipeline);

      const history = result[0]?.data || [];
      const totalItems = result[0]?.meta?.[0]?.totalItems || 0;
      const filterTotal = result[0]?.filterTotal?.[0]?.total || 0;

      return res.status(200).json({
         history,
         meta: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            page,
            limit,
         },
         filterTotal,
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

// DELETE HISTORY
// /api/history/delete-history/:userId/:historyId
const handleDeleteHistory = async (req, res, next) => {
   try {
      const { userId, historyId } = req.params;
      const findValidUser = (await UserModel.findById(userId)) || (await AdminModel.findById(userId));
      console.log({ userId, historyId });
      if (!findValidUser) {
         return res.status(404).json({ message: "Invalid User" });
      }

      const findHistory = await HistoryModel.findOne({
         userId: new mongoose.Types.ObjectId(userId),
         histories: {
            $elemMatch: {
               _id: new mongoose.Types.ObjectId(historyId),
            },
         },
      });

      if (!findHistory) {
         return res.status(404).json({ message: "Invalid History" });
      }
      console.log(findHistory);
      const filterHistory = findHistory.histories.find((item) => item._id.toString() === historyId);

      if (!filterHistory) {
         return res.status(404).json({ message: "Invalid History" });
      }

      const updated = await HistoryModel.findOneAndUpdate(
         {
            userId: new mongoose.Types.ObjectId(userId),
         },
         {
            $pull: {
               histories: {
                  _id: new mongoose.Types.ObjectId(historyId),
               },
            },
            $inc: {
               totalDarood: -filterHistory.count,
            },
         },
         { new: true },
      );

      if (!updated) {
         return res.status(404).json({
            message: "User history not found",
         });
      }

      const updatedCounter = await RealtimeCounterModel.findOneAndUpdate({}, { $inc: { seq: -filterHistory.count } }, { new: true, upsert: true });

      res.status(200).json({
         message: "History item deleted successfully",
         data: "test",
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

export { handleGetHistory, handleDeleteHistory };
