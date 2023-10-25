# How to Run the project

This application shows you how you can use the Vonage Video API along with Google Cloud APIs to build a captioning application in your language of your choice

# Run the app

1. `npm install`
2. `node index.js`
3. Populate a `.env` as per `.env.example` and copy-paste your google-credentials.json folder into the main project directory
4. Expose port 3001 or the port that you are using with ngrok
5. In public/index.html replace apiKey, sessionId, token and wsUrl (pointing to your publicly accessible server)
6. Open your ngrok URL and click on start session and then on start sending audio.
