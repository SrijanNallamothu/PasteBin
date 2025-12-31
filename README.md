
# PasteBin Lite

A lightweight Pastebin-like web application that allows users to create text pastes and share a link to view them.

Pastes can optionally expire based on time (TTL) or number of views. Once a constraint is reached, the paste becomes unavailable.

The application is built with Node.js (Express) and deployed on Vercel, with a simple React.js UI for creating and viewing pastes.

# Features

- Create a text paste and receive a shareable URL

- View pastes via API or HTML page

- Optional time-based expiry (TTL)

- Optional view-count limits

- Deterministic time support for testing (x-test-now-ms)

- Safe rendering (XSS-protected)

- Works in serverless environments

# API Endpoints

GET /api/healthz – Health check

POST /api/pastes – Create a paste

GET /api/pastes/:id – Fetch a paste (counts as a view)

GET /p/:id – View paste as HTML

# Running the Project on Vercel

Backend (Node.js) running on  https://paste-bin-tau.vercel.app/
Fronend (React.js) running on  https://pastebin-ui-seven.vercel.app/


You can test the project through command line using the below curl commands.

1. Health Check

curl -i https://paste-bin-tau.vercel.app/api/healthz

Expected response:

HTTP/1.1 200 OK
Content-Type: application/json

{ "ok": true }

2. Create a Paste

Basic Paste (no TTL, no max views)

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world"}'


Response:

{
  "id": "abc12345",
  "url": "https://paste-bin-tau.vercel.app/p/abc12345"
}

Paste with TTL (10 seconds)

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "TTL Test", "ttl_seconds": 10}'

Paste with max_views = 2

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "View limit Test", "max_views": 2}'

Paste with TTL + max_views

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "TTL + Views", "ttl_seconds": 60, "max_views": 3}'

3. Fetch a Paste (API)

Successful fetch

curl -i https://paste-bin-tau.vercel.app/api/pastes/abc12345

Expected response:

{
  "content": "Hello world",
  "remaining_views": null,
  "expires_at": null
}

Exceed view limit

Create a paste with max_views=1, fetch once:

curl -i https://paste-bin-tau.vercel.app/api/pastes/<paste_id>


Fetch again:

curl -i https://paste-bin-tau.vercel.app/api/pastes/<paste_id>

Expected response (2nd fetch):

HTTP/1.1 404 Not Found
{ "error": "View limit exceeded" }

Expired paste (using TTL)

Create with TTL=5 seconds:

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Expire Test","ttl_seconds":5}'


Wait 6 seconds, fetch:

curl -i https://paste-bin-tau.vercel.app/api/pastes/<paste_id>

Expected response:

HTTP/1.1 404 Not Found
{ "error": "Expired" }

Paste not found
curl -i https://paste-bin-tau.vercel.app/api/pastes/nonexistent

Response:

HTTP/1.1 404 Not Found
{ "error": "Not found" }

4. View a Paste (HTML)

Successful HTML view

curl -i https://paste-bin-tau.vercel.app/p/abc12345


Expected response:

HTTP 200

HTML page containing <pre>Hello world</pre>

Expired or view-limit exceeded

curl -i https://paste-bin-tau.vercel.app/p/<expired_or_exceeded_id>

Expected response:

HTTP 404

Can be JSON error or text: "Not found", "Expired", "View limit exceeded"

5. Deterministic Time Testing (x-test-now-ms)

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -H "x-test-now-ms: 1700000000000" \
  -d '{"content":"Header TTL Test","ttl_seconds":60}'


Fetch using same header to simulate time:

curl -H "x-test-now-ms: 1700000005000" https://paste-bin-tau.vercel.app/api/pastes/<paste_id>


Adjust x-test-now-ms to simulate expiry.

6. Invalid Input Tests

Empty content

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":""}'


Response:

HTTP/1.1 400 Bad Request
{ "error": "Invalid content" }

Negative TTL

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","ttl_seconds":-5}'

Response:

HTTP/1.1 400 Bad Request
{ "error": "Invalid ttl_seconds" }

Negative max_views

curl -X POST https://paste-bin-tau.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","max_views":-1}'


Response:

HTTP/1.1 400 Bad Request
{ "error": "Invalid max_views" }

You can also test the project using frontend running on https://pastebin-ui-seven.vercel.app/


# Running the Project Locally

Prerequisites

- Node.js v18+ (v20 recommended)
- npm
- An Upstash Redis database
- React.js (only if running the frontend locally)


1. Clone the Repository

git clone https://github.com/SrijanNallamothu/PasteBin.git

cd PasteBin

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a .env file at the project root:

create a redis account and get the following values.Update the values in the .env file.

For now the project will run with the given values if you want to update you can create redis account and update the values.

UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
TEST_MODE=1


These values are provided by Upstash when you create a Redis database.

4. Start the Backend Server

npm start

The server will start on:

http://localhost:3000

you can also test the project by giving the same test cases as used in vercel you have to just change the url  to http://localhost:3000 inplace of https://paste-bin-tau.vercel.app


5. (Optional) Start the Frontend

If running the React UI separately:

In Home.js and PasteView.js

use 

const BASE_URL = "http://localhost:3000";

inplace of 

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
// const BASE_URL = "http://localhost:3000";

Run Backend first so that it runs on port 3000 then run frontend so that it runs on 3001

Both should not run on same port and backend must run on 3000.

Steps to run :

cd pastebin-ui
npm install
npm start

Frontend will be available at:

http://localhost:3001


# Persistence Layer

The application uses Upstash Redis as its persistence layer.

Redis is used to store pastes as JSON objects keyed by paste ID.

This choice ensures persistence across requests in serverless environments like Vercel, where in-memory storage is not reliable.


Expired or exhausted pastes are automatically removed when accessed.


```
