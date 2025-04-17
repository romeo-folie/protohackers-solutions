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

// define function to check if value isPrime
const MalformedResponse = { method: "isPrime" };

function isPrime(n) {
  if (n < 2) return false;

  for (let i = 2; i < parseInt(Math.sqrt(n) + 1); i++) {
    if (n % i === 0) return false;
  }

  return true;
}

const server = createServer({ allowHalfOpen: true }, (socket) => {
  console.log("new connection from ", socket.remoteAddress);

  socket.on("data", (chunk) => {
    console.log("received data: ", chunk.toString());

    try {
      const request = JSON.parse(chunk.toString());
      console.log("parsed ", request);
      // check if json object has both the method and number fields
      // and their values match what is expected
      if (
        request.method === undefined ||
        request.number === undefined ||
        typeof request.method !== "string" ||
        typeof request.number !== "number"
      ) {
        throw new Error("Malformed Request");
      }

      socket.write(JSON.stringify({ method: "isPrime", prime: isPrime(request.number) }) + '\n');
    } catch (error) {
      console.log("ERROR ", error.message);
      socket.write(JSON.stringify(MalformedResponse));
      socket.end();
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
