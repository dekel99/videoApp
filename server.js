const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const path = require('path');
require("dotenv").config()
const io = require("socket.io")(server, {
	cors: {
		origin: process.env.FRONT_URL,
		methods: [ "GET", "POST" ]
	}
})


io.on("connection", (socket) => {
	socket.emit("me", socket.id)
	
	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})
	
	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})
	
	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

if(process.env.NODE_ENV === 'production'){
	app.use(express.static(path.join(__dirname, './frontend/build')));
	app.use((req, res, next) => {
		res.sendFile(path.join(__dirname, './frontend/build', 'index.html'));
	})
}

server.listen(5000, () => console.log("server is running on port 5000"))

