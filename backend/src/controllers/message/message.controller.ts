//@ts-nocheck
import mongoose from "mongoose";
import Message from "../../models/message/message.model";
import { User } from "../../models/user.model";
import { s3DeleteFiles } from "../../utils/s3";

export const createMessage = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(400).send({ error: true, msg: "Unauthorized" });
    }
    console.log("🚀 ~ createMessage ~ req.body:", req.body)
    req.body.from = user.id;
    const message = await Message.create(req.body);
    res.locals.io.emit("newMessage", {
      to: req.body.to,
      from: req.body.from,
      message,
    });
    res
      .status(200)
      .send({ error: false, msg: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).send({ error: true, msg: error.message });
  }
};

// Get User List of Messages Sent
export const userListMessageSend = async (req, res) => {
  try {
    const { query } = req;
    const filter = {};
    const user = res.locals.user;

    if (user) {
      filter["from"] = user.id;
    }

    const usersMessage = await Message.paginate(filter, {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sort: { createdAt: -1 },
      populate: [{ path: "to", select: "name email image" }],
    });

    const getUniqueUser = Array.from(
      new Set(usersMessage?.docs?.map((item) => item.to))
    );

    res.status(200).send({
      error: false,
      msg: "Successfully retrieved user list",
      data: getUniqueUser,
    });
  } catch (error) {
    res.status(500).send({ error: true, msg: error.message });
  }
};

// Get Messages Between Two Users
export const getMessages = async (req, res) => {
  try {
    const { activeId, to, page = 1, limit = 10 } = req.query;
    console.log("🚀 ~ getMessages ~ to:", to);
    const from = res.locals.user?.id;
    console.log("🚀 ~ getMessages ~ from:", from);

    if (!from || !to) {
      return res
        .status(400)
        .send({ error: true, msg: "Missing sender or receiver" });
    }

    if (activeId) {
      await Message.updateMany(
        {
          from: new mongoose.Types.ObjectId(to),
          to: new mongoose.Types.ObjectId(from),
          seen: false,
        },
        { $set: { seen: true } }
      );
    }
    res.locals.io.emit("read-message", {
      to: new mongoose.Types.ObjectId(to),
      from: new mongoose.Types.ObjectId(from),
      seen: true,
    });
    const filter = {
      $or: [
        {
          from: new mongoose.Types.ObjectId(from),
          to: new mongoose.Types.ObjectId(to),
        },
        {
          from: new mongoose.Types.ObjectId(to),
          to: new mongoose.Types.ObjectId(from),
        },
      ],
    };

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      select: "from to message image file seen delivered createdAt",
    };

    const data = await Message.paginate(filter, options);

    res.status(200).send({
      error: false,
      msg: "Messages fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).send({ error: true, msg: error.message });
  }
};

// Get Chat List
export const getChatList = async (req, res) => {
  try {
    const { query } = req;
    const userId = new mongoose.Types.ObjectId(res.locals.user.id);

    const filters = {
      $or: [{ from: userId }, { to: userId }],
    };

    const searchFilter = query?.search
      ? { "chatUserDetails.name": { $regex: query.search, $options: "i" } }
      : {};

    const chatList = await Message.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            chatUser: {
              $cond: [{ $eq: ["$from", userId] }, "$to", "$from"],
            },
          },
          lastMessage: { $last: "$$ROOT" },
          unseenCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$to", userId] }, { $eq: ["$seen", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.chatUser",
          foreignField: "_id",
          as: "chatUserDetails",
        },
      },
      { $unwind: "$chatUserDetails" },
      {
        $match: {
          "chatUserDetails._id": { $ne: userId },
          ...searchFilter,
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $project: {
          _id: 0,
          chatUser: "$chatUserDetails",
          lastMessage: {
            message: "$lastMessage.message",
            createdAt: "$lastMessage.createdAt",
          },
          unseenCount: 1,
        },
      },
    ])
      .skip((Number(query.page) - 1 || 0) * (Number(query.limit) || 10))
      .limit(Number(query.limit) || 10);

    res.status(200).send({
      error: false,
      msg: "Chat list fetched successfully",
      data: chatList,
    });
  } catch (error) {
    console.error("Error in getChatList:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { _id } = req.query;

    if (!_id) {
      return res
        .status(400)
        .send({ error: true, msg: "Message ID is required" });
    }

    const find = await Message.findById(_id);
    if (!find) {
      return res.status(404).send({ error: true, msg: "Message not found" });
    }

    if (find.image || find.file) {
      await s3DeleteFiles([find.image || find.file]);
    }

    await Message.findByIdAndDelete(_id);

    res.status(200).send({ error: false, msg: "Message deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: true, msg: error.message });
  }
};

export const getAdminInfo = async (req, res) => {
  try {
    let user = res.locals.user;
    if (user?.role === "Admin") {
      return res.status(200).send({
        error: false,
        msg: "Admin info fetched successfully",
        data: null,
      });
    }
    let findAdmin = await User.findOne({ role: "admin" }).select(
      "name email image id"
    );
    if (findAdmin) {
      return res.status(200).send({
        error: false,
        msg: "Admin info fetched successfully",
        data: findAdmin,
      });
    }
    return res.status(200).send({
      error: false,
      msg: "Admin info fetched successfully",
      data: {},
    });
  } catch (error) {
    return res.status(500).send({
      error: true,
      msg: "Internal server error",
    });
  }
};
