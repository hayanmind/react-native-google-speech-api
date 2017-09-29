import Voice from 'react-native-google-speech-api';
import { EventEmitter } from 'fbemitter';

class Speech {
  constructor() {
    this.Event = {
      RECOGNITION_STARTED: 'event/recognitionStarted',
      RECOGNITION_ENDED: 'event/recognitinoEnded',
      SPEECH_RESULT_RECEIVED: 'event/speechResultReceived',
      SPEECH_PARTIAL_RESULT_RECEIVED: 'event/speechPartialResultReceived',
      ERROR_RECEIVED: 'event/errorReceived',
    };

    this.recognizing = false;
    this.emitter = new EventEmitter();
    this.prevPartialResult = '';
    this.lastPartialResultAtPrevNumberOfBreakingSetence = '';
    /*
      'numberOfBreakingSentenece'
      How many user stop speaking between Voice.start() and Voice.stop() in Android
    */
    this.prevNumberOfBreakingSentence = -1;

    Voice.onSpeechStart = (event) => {
      console.log(event);
      this.emitter.emit(this.Event.RECOGNITION_STARTED);
    };
    Voice.onSpeechEnd = (event) => {
      console.log(event);
      this.emitter.emit(this.Event.RECOGNITION_ENDED);
    };
    Voice.onSpeechResults = (event) => {
      console.log(event);
      this.emitter.emit(this.Event.SPEECH_RESULT_RECEIVED, { text: event.value[0] });
    };
    Voice.onSpeechPartialResults = (event) => {
      console.log(event);
      const { value, numberOfBreakingSentence } = event;
      // When user stop speaking, speech result(event.value) is initialized
      if (this.prevNumberOfBreakingSentence !== numberOfBreakingSentence) {
        this.lastPartialResultAtPrevNumberOfBreakingSetence =
          `${this.lastPartialResultAtPrevNumberOfBreakingSetence} ${this.prevPartialResult}`;
      }
      const text = this.lastPartialResultAtPrevNumberOfBreakingSetence + value[0];
      this.emitter.emit(this.Event.SPEECH_PARTIAL_RESULT_RECEIVED, { text });

      this.prevPartialResult = value[0];
      this.prevNumberOfBreakingSentence = numberOfBreakingSentence;
    };
    Voice.onSpeechError = (event) => {
      console.log(event);
      this.emitter.emit(this.Event.ERROR_RECEIVED, new Error(event.error.message));
    };
  }

  setApiKey(apiKey) {
    Voice.setApiKey(apiKey);
  }

  // eslint-disable-next-line class-methods-use-this
  start(language) {
    console.log('Voice.start()'); // eslint-disable-line no-console

    if (this.recognizing) {
      return Promise.reject(new Error('Already recognizing'));
    }

    this.prevPartialResult = '';
    this.lastPartialResultAtPrevNumberOfBreakingSetence = '';
    this.prevNumberOfBreakingSentence = -1;

    this.recognizing = true;
    return Voice.start(language);
  }

  // eslint-disable-next-line class-methods-use-this
  stop() {
    console.log('Voice.stop()'); // eslint-disable-line no-console

    if (!this.recognizing) {
      return Promise.reject(new Error('Recognizer does not start'));
    }

    this.recognizing = false;
    return Voice.stop();
  }

  // eslint-disable-next-line class-methods-use-this
  cancel() {
    console.log('Voice.cancel()'); // eslint-disable-line no-console

    if (!this.recognizing) {
      return Promise.reject(new Error('Recognizer does not start'));
    }

    this.recognizing = false;
    return Voice.cancel();
  }

  // eslint-disable-next-line class-methods-use-this
  release() {
    console.log('Voice.release()'); // eslint-disable-line no-console

    this.emitter.removeAllListeners();

    if (this.recognizing) {
      this.recognizing = false;
      Voice.destroy();
    }
  }

  setEventListener(eventName, listener) {
    if (Object.values(this.Event).indexOf(eventName) === -1) {
      // eslint-disable-next-line no-console
      console.warn('Event name is invalid: ', eventName);
    } else {
      this.emitter.addListener(eventName, listener);
      console.log(`Voice is now listening to : ${eventName}`);
    }
  }
}

export default new Speech(); // Singleton module
