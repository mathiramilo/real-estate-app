import { Server } from "socket.io"

const io = new Server({
  cors: {
    origin: "http://localhost:5173"
  }
})

let onlineUser = []

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find(u => u.userId === userId)
  if (!userExists) {
    onlineUser.push({ userId, socketId })
  }
}

const removeUser = socketId => {
  onlineUser = onlineUser.filter(u => u.socketId !== socketId)
}

const getUser = userId => {
  return onlineUser.find(u => u.userId === userId)
}

io.on("connection", socket => {
  socket.on("newUser", userId => {
    addUser(userId, socket.id)
  })

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId)
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data)
    }
  })

  socket.on("disconnect", () => {
    removeUser(socket.id)
  })
})

io.listen(4000)
