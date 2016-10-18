## Setup steps:

1. npm install
2. Download and install ngrok from https://ngrok.com/download
3. ./ngrok http 8445
4. export WIT_TOKEN=vnds_access_token FB_APP_SECRET=your_app_secret FB_PAGE_TOKEN=your_page_token APP_URL=your_node_app_url
5. node app.js
6. Subscribe your page to the Webhooks using verify_token and `https://<your_ngrok_io>/webhook` as callback URL.
7. Talk to your bot on Messenger.

If you just want to test your wit bot:

1. export WIT_TOKEN=your_wit_token
2. node bot.js

## Example settings

`export WIT_TOKEN=RBPAVXHAYSWMBCLEPS3V2QCCQBABVMRU FB_APP_SECRET=558190dd1312f61988fe776c19b7c80c FB_PAGE_TOKEN=EAAMODZCgoKZCABALpSWZBGNZARJscKexzHc0gqE6LgjK8ZBqJSAbZCJ6oylQM6ns8epQGGZCVShTvbnhOo6poV3szZCXQsOaxhJQJBXnC6mVVyhzsqc0XsjXpbhmUZA9p3xat3GQajQGKoNSRMLZCIFqhZAXM4Vlo8PPa8ZD APP_URL=https://22efe847.ngrok.io`