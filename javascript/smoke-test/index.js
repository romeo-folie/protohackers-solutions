/**
Deep inside Initrode Global's enterprise management framework lies a component that writes data to a server and expects to read the same data back.
(Think of it as a kind of distributed system delay-line memory). We need you to write the server to echo the data back.


Requirements
Should listen for TCP connections on TCP port 7

Accept TCP connections.
Whenever you receive data from a client, send it back unmodified.
Make sure you don't mangle binary data, and that you can handle at least 5 simultaneous clients.

Once the client has finished sending data to you it shuts down its sending side. 
Once you've reached end-of-file on your receiving side, and sent back all the data you've received, close the socket so that the client knows you've finished. 
(This point trips up a lot of proxy software, such as ngrok;
if you're using a proxy and you can't work out why you're failing the check, try hosting your server in the cloud instead).
Your program will implement the TCP Echo Service from RFC 862.
*/
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

  /* 
  emitted when internal buffer managed by node becomes empty and ready to receive data
  this could mean that it has successfully transferred all the bytes from it's internal buffer to the kernel's send buffer
  or that it has transferred all the bytes it could hold at a time and is ready to receive more
  */
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
