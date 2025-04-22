/**
 Requirements
 - Request will be a single line containing the JSON object e.g {"method":"isPrime","number":123}
 - Response must be a single line containing a JSON object e.g {"method":"isPrime","prime":false}
 - Accept TCP connections.
 - Whenever you receive a conforming request, send back a correct response, and wait for another request.
 - Whenever you receive a malformed request, send back a single malformed response, and disconnect the client.
 
 Considerations
  - Each request is a single line containing a JSON object, terminated by a newline character ('\n', or ASCII 10)
  - A request is malformed if it is not a well-formed JSON object, if any required field is missing, 
    if the method name is not "isPrime", or if the number value is not a number.
  - A response is malformed if it is not a well-formed JSON object, if any required field is missing, 
    if the method name is not "isPrime", or if the prime value is not a boolean.
  - Note that non-integers can not be prime.
 */

import { createServer } from "net";

const MalformedResponse = { error: "invalid request" };

function isPrime(n) {
  if (!Number.isInteger(n)) return false;
  if (n <= 1) return false;
  if (n === 2) return true;
  
  const limit = Math.ceil(Math.sqrt(n)) + 1;
  
  for (let i = 2; i < limit; i++) {
    if (n % i === 0) return false;
  }
  
  return true;
}

const server = createServer((socket) => {
  console.log("new connection from ", socket.remoteAddress);

  let requestBuffer = "";

  socket.on("data", (chunk) => {
    console.log("received data: ", chunk.toString());
    requestBuffer += chunk.toString();

    let newlineIndex;
    while ((newlineIndex = requestBuffer.indexOf("\n")) !== -1) {
      const raw = requestBuffer.slice(0, newlineIndex).trim();
      requestBuffer = requestBuffer.slice(newlineIndex + 1);
      if (!raw) continue;

      try {
        const request = JSON.parse(raw);
        if (
          request.method === undefined ||
          request.number === undefined ||
          request.method !== "isPrime" ||
          typeof request.method !== "string" ||
          typeof request.number !== "number"
        ) {
          throw new Error('malformed request');
        }
  
        socket.write(
          JSON.stringify({
            method: request.method,
            prime: isPrime(request.number),
          }) + "\n"
        );
      } catch (error) {
        console.log(`error: ${error.message}`);
        if (socket.writable) socket.write(JSON.stringify(MalformedResponse));
        socket.end();
      }
      
    }
  });

  socket.on("error", function (err) {
    console.error("Socket error:", err.message);
    socket.destroy();
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
