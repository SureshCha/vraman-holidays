// Passenger startup wrapper for the Next.js standalone server.
//
// cPanel's "Setup Node.js App" (Phusion Passenger) launches this file. Passenger
// intercepts the server's listen() call and supplies its own socket, but Next's
// standalone server also tries to bind to process.env.HOSTNAME — under Passenger
// that can be a non-bindable machine name. Forcing 0.0.0.0 avoids that failure.
//
// In the cPanel Node.js App settings, set the startup file to "passenger.js".
// If you ever prefer to bypass this wrapper, set it to "server.js" directly.
process.env.HOSTNAME = "0.0.0.0";

require("./server.js");
