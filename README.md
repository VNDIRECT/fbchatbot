## Setup steps:

1. npm install
2. Download and install ngrok from https://ngrok.com/download
3. ./ngrok http 8445
4. export WIT_TOKEN=vnds_access_token FB_APP_SECRET=your_app_secret FB_PAGE_TOKEN=your_page_token
5. node app.js
6. Subscribe your page to the Webhooks using verify_token and `https://<your_ngrok_io>/webhook` as callback URL.
7. Talk to your bot on Messenger.

If you just want to test your wit bot:

1. export WIT_TOKEN=your_wit_token
2. node bot.js