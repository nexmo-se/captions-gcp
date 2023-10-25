'use strict';
require('dotenv').config();
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const model = 'command_and_search';
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Translate } = require('@google-cloud/translate').v2;
const fs = require('fs');
const util = require('util');

class StreamingClient {
  constructor(id, language) {
    this.id = id;
    this.init = this.init.bind(this);
    this.recognizeStream = null;
    this.speechClientv2 = null;
    this.ttsTimer = undefined;
    this.language = language;
    this.waitingRestart = true;
    this.sessionEnding = false;
    this.transcriptAvailableCallback = undefined;
    this.streamingLimit = 290000;
    this.intervalRestart = setInterval(() => {
      this.tryEndAudioStream();
      this.startRecognizer();
    }, this.streamingLimit);
    this.errorCallback = undefined;
  }

  setTranscriptionAvailableCallback(callback) {
    this.transcriptAvailableCallback = callback;
  }
  setId(id) {
    this.id = id;
  }

  async init() {
    this.speechClient = new speech.SpeechClient();
    // this.speechClientv2 = new speech.v2.SpeechClient();
    this.ttsClient = new textToSpeech.TextToSpeechClient();
  }

  sendMessage(msg) {
    if (!this.waitingRestart) {
      this.recognizeStream.write(msg);
      // fs.appendFileSync('out.pcm',msg);
    }
  }

  clearInterval() {
    clearInterval(this.intervalRestart);
  }

  // async startV2Recognizer() {
  //   const recognizerRequest = {
  //     parent: `projects/translate-video-330516/locations/global`,
  //     recognizerId: 'orasdsl',
  //     recognizer: {
  //       languageCodes: ['en-US'],
  //       model: 'long',
  //     },
  //   };

  //   // const operation = await this.speechClientv2.createRecognizer(recognizerRequest);
  //   // const recognizer = operation[0].result;
  //   const recognitionConfig = {
  //     // autoDecodingConfig removes the need to specify audio encoding.
  //     // This field only needs to be present in the recognitionConfig
  //     autoDecodingConfig: {},
  //   };
  //   const streamingConfig = {
  //     config: recognitionConfig,
  //   };

  //   const configRequest = {
  //     recognizer: 'oralplop',
  //     // recognizer: recognizer.name,
  //     streamingConfig: streamingConfig,
  //   };

  //   // const operation = await client.createRecognizer(recognizerRequest);
  //   // console.log(this.speechClientv2.streamingRecognize)

  //   this.recognizeStream = this.speechClientv2.streamingRecognize(configRequest);
  //   this.recognizeStream.on('data', async (data) => {
  //     let originalText = data.results[0].alternatives[0].transcript;
  //     console.log('[' + this.id + '][User]' + originalText);
  //     if (this.transcriptAvailableCallback) {
  //       this.transcriptAvailableCallback({
  //         original: originalText,
  //         id: this.id,
  //       });
  //     }
  //   });

  //   this.recognizeStream.on('error', (err) => {
  //     console.error(err);
  //     this.tryEndAudioStream();
  //     if (this.errorCallback) {
  //       this.errorCallback(err);
  //     }
  //   });

  //   this.recognizeStream.on('finish', (res) => {});
  //   console.log('[' + this.id + '] Stream Created');
  //   this.waitingRestart = false;
  //   return this.recognizeStream;
  // }

  startRecognizer() {
    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      model: model,
      enableAutomaticPunctuation: true,
      languageCode: this.language,
    };

    const request = {
      config: config,
      interimResults: true,
    };

    this.recognizeStream = this.speechClient.streamingRecognize(request);
    this.recognizeStream.on('data', async (data) => {
      let originalText = data.results[0].alternatives[0].transcript;
      console.log('[' + this.id + '][User]' + originalText);
      if (this.transcriptAvailableCallback) {
        this.transcriptAvailableCallback({
          original: originalText,
          id: this.id,
        });
      }
    });

    this.recognizeStream.on('error', (err) => {
      console.error(err);
      this.tryEndAudioStream();
      if (this.errorCallback) {
        this.errorCallback(err);
      }
    });

    this.recognizeStream.on('finish', (res) => {});
    console.log('[' + this.id + '] Stream Created');
    this.waitingRestart = false;
    return this.recognizeStream;
  }

  tryEndAudioStream() {
    if (this.recognizeStream) {
      this.recognizeStream.destroy();
      this.recognizeStream.removeAllListeners('data');
      this.recognizeStream = null;
      console.log('[' + this.id + '] Stream Destroyed');
    } else {
      clearInterval(this.intervalRestart);
    }
  }
  closeConversation() {
    this.tryEndAudioStream();
  }
}

module.exports = StreamingClient;
