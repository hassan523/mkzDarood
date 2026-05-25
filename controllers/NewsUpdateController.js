import AdminModel from "../models/AdminSchema.js";
import { v2 as cloudinary } from "cloudinary";
import NewsUpdateModel from "../models/NewsUpdateSchema.js";
import SearchQuery from "../utils/SearchQuery.js";
import mongoose from "mongoose";

// ADD NEWS
// METHOD : POST
// ENDPOINT: /api/news/add-news
const handleAddNews = async (req, res, next) => {
   try {
      const createdBy = await AdminModel.find().limit(1);
      const adminID = createdBy[0]._id;

      const { content, title, btnName, btnLink, pinnedNews } = req.body;

      const images = req?.files?.images;
      const videos = req?.files?.videos;
      console.log(images);
      let thumbnails = [];
      let videosArray = [];
      let button = {
         link: "",
         text: "",
      };

      if (!content || !title) {
         return res.status(400).json({
            message: "Title and Content are required",
         });
      }

      if (images) {
         const files = Array.isArray(images) ? images : [images];

         for (const file of files) {
            const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
               resource_type: "auto",
               folder: "news",
            });

            thumbnails.push(uploadResult.secure_url);
         }
      }

      if (videos) {
         const files = Array.isArray(videos) ? videos : [videos];

         for (const file of files) {
            const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
               resource_type: "auto",
               folder: "news",
            });
            videosArray.push(uploadResult.secure_url);
         }
      }

      if (btnName && btnLink) {
         button = {
            text: btnName,
            link: btnLink,
         };
      }

      const createNews = new NewsUpdateModel({
         createdBy: adminID,
         title,
         content,
         thumbnail: thumbnails,
         video: videosArray,
         button: button,
         pinnedNews: pinnedNews === true || pinnedNews === "true" ? true : false,
      });

      await createNews.save();

      return res.status(201).json({
         success: true,
         message: "News added successfully",
         data: createNews,
      });
   } catch (error) {
      console.error(error);
      next(error);
   }
};

// GET NEWS
// METHOD : GET
// ENDPOINT: /api/news/get-news
const handleGetNews = async (req, res, next) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search || {};

      const matchStage = SearchQuery(search);
      const pipeline = [];

      if (matchStage) pipeline.push(matchStage);

      pipeline.push({
         $lookup: {
            from: "admins",
            localField: "createdBy",
            foreignField: "_id",
            as: "adminDetails",
         },
      });

      pipeline.push({
         $unwind: { path: "$adminDetails", preserveNullAndEmptyArrays: true },
      });

      pipeline.push({
         $project: {
            _id: 1,
            title: 1,
            thumbnail: 1,
            button: 1,
            createdAt: 1,
            video: 1,
            content: 1,
            pinnedNews: 1,
            admin: {
               _id: "$adminDetails._id",
               username: "$adminDetails.username",
               profilePicture: "$adminDetails.profilePicture",
            },
         },
      });

      pipeline.push({
         $sort: {
            pinnedNews: -1,
            createdAt: -1,
         },
      });

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const news = await NewsUpdateModel.aggregate(pipeline);

      const countPipeline = [];
      if (matchStage) countPipeline.push(matchStage);
      countPipeline.push({ $count: "totalItems" });

      const countResult = await NewsUpdateModel.aggregate(countPipeline);
      const totalItems = countResult.length > 0 ? countResult[0].totalItems : 0;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
         news,
         meta: {
            totalItems,
            totalPages,
            page,
            limit,
         },
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

// GET NEWS
// METHOD : GET
// ENDPOINT: /api/news/get-news
const handleSingleGetNews = async (req, res, next) => {
   try {
      const newsId = req.params.newsID;
      console.log(newsId);
      const pipeline = [];

      pipeline.push({
         $match: {
            _id: new mongoose.Types.ObjectId(newsId),
         },
      });

      pipeline.push({
         $lookup: {
            from: "admins",
            localField: "createdBy",
            foreignField: "_id",
            as: "adminDetails",
         },
      });

      pipeline.push({
         $unwind: {
            path: "$adminDetails",
            preserveNullAndEmptyArrays: true,
         },
      });

      pipeline.push({
         $project: {
            _id: 1,
            title: 1,
            thumbnail: 1,
            button: 1,
            createdAt: 1,
            video: 1,
            content: 1,
            admin: {
               _id: "$adminDetails._id",
               username: "$adminDetails.username",
               profilePicture: "$adminDetails.profilePicture",
            },
         },
      });

      const news = await NewsUpdateModel.aggregate(pipeline);

      if (news.length === 0) {
         return res.status(404).json({
            success: false,
            message: "News not found",
         });
      }

      return res.status(200).json({
         success: true,
         data: news[0],
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

// UPDATE NEWS
// METHOD : GET
// ENDPOINT: /api/news/:adminID/update-news/:newsID
const handleUpdateNews = async (req, res, next) => {
   try {
      const { adminID, newsID } = req.params;
      const { content, title, images: existingImages, btnName, btnLink, pinnedNews } = req.body;

      const findAdmin = await AdminModel.findById(adminID);
      if (!findAdmin) {
         return res.status(404).json({ message: "Admin Not Found" });
      }

      const findNews = await NewsUpdateModel.findById(newsID);
      if (!findNews) {
         return res.status(404).json({ message: "News Not Found" });
      }

      const images = req?.files?.images;
      const videos = req?.files?.videos;
      let button = {
         link: "",
         text: "",
      };

      // Existing image links from frontend
      let thumbnails = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];

      let videosArray = [];

      // Upload new images and merge
      if (images) {
         const files = Array.isArray(images) ? images : [images];

         for (const file of files) {
            const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
               resource_type: "auto",
               folder: "news",
            });

            thumbnails.push(uploadResult.secure_url);
         }
      }

      // Upload videos
      if (videos) {
         const files = Array.isArray(videos) ? videos : [videos];

         for (const file of files) {
            const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
               resource_type: "auto",
               folder: "news",
            });

            videosArray.push(uploadResult.secure_url);
         }
      }

      // Save merged data
      if (thumbnails.length) {
         findNews.thumbnail = thumbnails;
      }

      if (videosArray.length) {
         findNews.video = videosArray;
      }

      if (btnName && btnLink) {
         button = {
            text: btnName,
            link: btnLink,
         };
      }

      findNews.title = title || findNews.title;
      findNews.content = content || findNews.content;
      findNews.button = button;
      findNews.pinnedNews = pinnedNews === true || pinnedNews === "true" ? true : false;

      await findNews.save();

      res.status(200).json({
         message: "News Updated Successfully",
         data: findNews,
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

// DELETE NEWS
// METHOD : DELETE
// ENDPOINT: /api/news/:adminID/delete-news/:newsID
const handleDeleteNews = async (req, res, next) => {
   try {
      const { adminID, newsID } = req.params;

      // Check admin exists
      const findAdmin = await AdminModel.findById(adminID);
      if (!findAdmin) {
         return res.status(404).json({ message: "Admin Not Found" });
      }
      // Check news exists
      const findNews = await NewsUpdateModel.findById(newsID);
      if (!findNews) {
         return res.status(404).json({ message: "News Not Found" });
      }

      await NewsUpdateModel.findByIdAndDelete(newsID);

      res.status(200).json({ message: "News Deleted Successfully" });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

export { handleAddNews, handleGetNews, handleUpdateNews, handleDeleteNews, handleSingleGetNews };
