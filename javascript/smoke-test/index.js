const net = require("net");

const server = net.createServer({ allowHalfOpen: true }, (socket) => {
  console.log("new connection from ", socket.remoteAddress);

  // received data from client
  socket.on("data", function (data) {
    console.log("received data:", data);
    // check if entire data was written to kernel send buffer
    const isWritten = socket.write(data);
    if (!isWritten) {
      // Pause reading if the buffer is full
      socket.pause();
    }
  });

  socket.on("error", function (err) {
    console.error("Socket error:", err.message);
    socket.destroy();
  });

  socket.on("drain", () => {
    socket.resume();
  });

  // client disconnected
  socket.on("end", function () {
    console.log("client closed socket");
    if (socket.bytesWritten >= socket.bytesRead) {
      socket.end(() => console.log("server closed socket"));
    }
  });

  socket.on("close", (hadError) => {
    console.log("socket closed", hadError ? "with error" : "without error");
  });
});

server.on("error", (error) => {
  console.log("error spinning up server", error);
  server.close();
});

server.listen(7, () => {
  console.log("server listening on port 7");
});
