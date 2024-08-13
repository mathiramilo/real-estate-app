import { useContext, useEffect, useRef, useState } from "react"
import { format } from "timeago.js"

import apiRequest from "../../lib/apiRequest"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import "./chat.scss"

function Chat({ chats }) {
  const [chat, setChat] = useState(false)
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)

  const messageEndRef = useRef(null)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest.get(`/chats/${id}`)
      setChat({ ...res.data, receiver })
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const text = formData.get("text")

    if (!text) return

    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text })
      setChat({ ...chat, messages: [...chat.messages, res.data] })
      e.target.reset()
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id)
      } catch (err) {
        console.log(err)
      }
    }

    if (chat && socket) {
      socket.on("getMessage", data => {
        if (chat.id === data.chatId) {
          setChat({
            ...chat,
            messages: [...chat.messages, data]
          })
          read()
        }
      })
    }

    return () => {
      socket.off("getMessage")
    }
  }, [socket, chat])

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats.map(c => (
          <div
            className="message"
            key={c.id}
            onClick={() => handleOpenChat(c.id, c.receiver)}
          >
            <img
              src={c.receiver.avatar || "/noavatar.jpg"}
              alt=""
            />
            <span>{c.receiver.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src={chat.receiver.avatar || "/noavatar.jpg"}
                alt=""
              />
              {chat.receiver.username}
            </div>
            <span
              className="close"
              onClick={() => setChat(null)}
            >
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map(m => (
              <div
                className="chatMessage"
                style={{
                  alignSelf: m.userId === currentUser.id ? "flex-end" : "flex-start",
                  textAlign: m.userId === currentUser.id ? "right" : "left"
                }}
                key={m.id}
              >
                <p>{m.text}</p>
                <span>{format(m.createdAt)}</span>
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="bottom"
          >
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Chat
