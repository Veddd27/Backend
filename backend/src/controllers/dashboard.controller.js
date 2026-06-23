import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

  const stats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },           // count of documents = total videos
        totalViews: { $sum: "$views" },      // sum of views field across all videos
        totalSubscribers: {                  // size of subscribers array (same on every doc, take first)
          $first: { $size: "$subscribers" },
        },
        totalLikes: { $sum: { $size: "$likes" } }, // sum of likes arrays across all videos
      },
    },

    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        totalSubscribers: 1,
        totalLikes: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        stats[0] || {
          totalVideos: 0,
          totalViews: 0,
          totalSubscribers: 0,
          totalLikes: 0,
        },
        "Channel stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },

    {
      $addFields: {
        likesCount: { $size: "$likes" },
        // createdAt already exists from timestamps
      },
    },
  
    { $sort: { createdAt: -1 } },
    
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        likesCount: 1,
        duration: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
    }