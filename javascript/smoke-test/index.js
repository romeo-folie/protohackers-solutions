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

const server = net.createServer((socket) => {
  let isComplete = false;
  
  console.log("new connection from ", socket.localAddress)

  // received data from client
  socket.on("data", function (data) {
    console.log("Received data:", data.toString());
    isComplete = socket.write(data);
  });

  socket.on("error", function (error) {
    console.log("error in communication ", error);
  });

  // client disconnected
  socket.on("end", function () {
    if (isComplete) {
      isComplete = false;
      socket.end();
    }
  });
});

server.on("error", (error) => {
  console.log("error spinning up server", error);
});

server.listen(7, () => {
  console.log("server listening on port 7");
});
