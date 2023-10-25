'use strict';
require('dotenv').config();
const StreamingClient = require('./streamingClient.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressWs = require('express-ws')(app);
const axios = require('axios');

const utils = require('./utils.js');

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
  next();
});

app.post('/startStreaming', async (req, res) => {
  try {
    console.log('someone wants to stream');
    const streamId = req.body.streamId;
    // console.log(streamId);
    const response = await startStreamer(streamId);

    res.send(response);
  } catch (e) {
    console.log(e);
  }
});

app.ws('/socket', async (ws, req) => {
  console.log('someone connected');

  const uuid = req?.query?.uuid ? req.query.uuid : 'dummyuuid';
  let sc = new StreamingClient(uuid, process.env.lang);
  await sc.init();
  const aWss = expressWs.getWss().clients;

  sc.setTranscriptionAvailableCallback(function (data) {
    console.log(data);
    const aWss = expressWs.getWss('/socket').clients;
    aWss.forEach(function (client) {
      client.send(JSON.stringify(data));
    });
  });
  sc.startRecognizer();
  // await sc.startV2Recognizer();
  ws.on('message', (msg) => {
    try {
      if (typeof msg === 'string') {
        let config = JSON.parse(msg);
        console.log(config);
        sc.setId(config.from);
      } else {
        // console.log(msg);
        sc.sendMessage(msg);
      }
    } catch (err) {
      console.log('[' + uuid + '] ' + err);
      ws.removeAllListeners('message');
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('[' + uuid + '] Websocket closed');
    sc.closeConversation();
    sc = null;
  });
});

const startStreamer = async (streamId) => {
  try {
    const data = JSON.stringify({
      sessionId: process.env.sessionId,
      token: process.env.token,
      websocket: {
        uri: `${process.env.websocket_url}/socket`,
        streams: [streamId],
        headers: {
          from: streamId,
        },
      },
    });

    const config = {
      method: 'post',
      url: `https://api.opentok.com/v2/project/${process.env.apiKey}/connect`,
      headers: {
        'X-OPENTOK-AUTH': await utils.generateRestToken(),
        'Content-Type': 'application/json',
      },
      data: data,
    };
    // console.log(config);
    const response = await axios(config);
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server application listening on port ${port}!`));
