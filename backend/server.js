const express = require("express");
const app = express();
const rooms = ["general", "tech", "finance", "crypto"];
const cors = require("cors");
const connectDB = require("./connectDb");
connectDB();

const userRoutes = require("./routes/userroutes");
const errorHandler = require("./middleware/ErrorHandler");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/users", userRoutes);

app.use(errorHandler);
const server = require("http").createServer(app);
const PORT = 5000;
const { Server } = require("socket.io");
const MessageModel = require("./models/MessageModel");
const userModel = require("./models/userModel");
// const { socket } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/rooms", (req, res) => {
  res.json(rooms);
});
async function getLastMessagesFromRoom(room) {
  let roomMessages = await MessageModel.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
}
function sortRoomMessagesByDate(messages) {
  return messages.sort((a, b) => {
    let date_1 = a._id.split("/");
    let date_2 = b._id.split("/");
    date_1 = date_1[2] + date_1[0] + date_1[1];
    date_2 = date_2[2] + date_2[0] + date_2[1];

    return date_1 < date_2 ? -1 : 1;
  });
}
io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    const members = await userModel.find();
    io.emit("new-user", members);
  });

  socket.on("join-room", async (newRoom, previousRoom) => {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit("room-messages", roomMessages);
  });

  socket.on("message-room", async (room, content, sender, time, date) => {
    console.log(content);
    const newMessage = await MessageModel.create({
      content,
      from: sender,
      time,
      date,
      to: room,
    });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // sending message to room
    io.to(room).emit("room-messages", roomMessages);
    socket.broadcast.emit("notifications", room);
  });

  app.delete("/logout", async (req, res) => {
    try {
      const { _id, newMessages } = req.body;
      const user = await userModel.findById(_id);
      user.status = "Offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await userModel.find();
      socket.broadcast.emit("new-user", members);
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(400).send();
    }
  });
});

server.listen(PORT, () => {
  console.log("server is listening at " + PORT);
});
