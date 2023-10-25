# How to Run the project

This application shows you how you can use the Vonage Video API along with Google Cloud APIs to build a captioning application in your language of your choice

# Run the app

1. `npm install`
2. `node index.js`
3. Populate a `.env` as per `.env.example` and copy-paste your google-credentials.json folder into the main project directory
4. Expose port 3001 or the port that you are using with ngrok
5. In public/index.html replace apiKey, sessionId, token and wsUrl (pointing to your publicly accessible server)
6. Open your ngrok URL and click on start session and then on start sending audio. If you start speaking, you should see the captions.

# Credentials explanation

- GOOGLE_APPLICATION_CREDENTIALS is the json file that you obtain from Google when you create a project. It's the way to authenticate with Google.
- apiKey, secret, sessionId and token are the parameters in this case harcoded and generated in the [account portal](https://tokbox.com/account/) for the sake of simplicity. Bear in mind that the token needs to belong to the sessionId.
- websocket_url is the websocket URI of your server. That is, your server URL in a wss format. I recommend using ngrok for testing.
- Language is the language code of your choice. See this list for [languages supported](https://cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages)
