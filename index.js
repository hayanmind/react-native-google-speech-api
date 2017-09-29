'use strict';
import React, {
  NativeModules,
  NativeEventEmitter
} from 'react-native';

const { RNGoogleSpeechApi } = NativeModules;
const googleSpeechApiEmitter = new NativeEventEmitter(RNGoogleSpeechApi);

class RCTGoogleSpeechApi {
  constructor() {
    this._loaded = false;
    this._listeners = null;
    this._events = {
      // 'onSpeechStart': this._onSpeechStart.bind(this),
      // 'onSpeechRecognized': this._onSpeechRecognized.bind(this),
      // 'onSpeechEnd': this._onSpeechEnd.bind(this),
      'onSpeechError': this._onSpeechError.bind(this),
      'onSpeechResults': this._onSpeechResults.bind(this),
      'onSpeechPartialResults': this._onSpeechPartialResults.bind(this),
      // 'onSpeechVolumeChanged': this._onSpeechVolumeChanged.bind(this)
    };
  }
  setApiKey(apiKey) {
    RNGoogleSpeechApi.setApiKey(apiKey);
  }
  destroy() {
    return RNGoogleSpeechApi.destroySpeech((error) => {
      if (error) {
        return error;
      }
      if (this._listeners) {
        this._listeners.map((listener, index) => listener.remove());
        this._listeners = null;
      }
      return null;
    });
  }
  start(locale) {
    if (!this._loaded && !this._listeners) {
      this._listeners = Object.keys(this._events)
        .map((key, index) => googleSpeechApiEmitter.addListener(key, this._events[key]));
    }
    return new Promise((resolve, reject) => {
      RNGoogleSpeechApi.startSpeech(locale);
    });
  }
  stop() {
    return new Promise((resolve, reject) => {
      RNGoogleSpeechApi.stopSpeech((error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }
  cancel() {
    return new Promise((resolve, reject) => {
      RNGoogleSpeechApi.cancelSpeech();
    });
  }
  isAvailable() {
    return new Promise((resolve, reject) => {
      RNGoogleSpeechApi.isSpeechAvailable((isAvailable, error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(isAvailable);
        }
      });
    });
  }
  isRecognizing() {
    return new Promise((resolve, reject) => {
      RNGoogleSpeechApi.isRecognizing(isRecognizing => resolve(isRecognizing));
    });
  }
  _onSpeechStart(e) {
    if (this.onSpeechStart) {
      this.onSpeechStart(e);
    }
  }
  _onSpeechRecognized(e) {
    if (this.onSpeechRecognized) {
      this.onSpeechRecognized(e);
    }
  }
  _onSpeechEnd(e) {
    if (this.onSpeechEnd) {
      this.onSpeechEnd(e);
    }
  }
  _onSpeechError(e) {
    if (this.onSpeechError) {
      this.onSpeechError(e);
    }
  }
  _onSpeechResults(e) {
    if (this.onSpeechResults) {
      this.onSpeechResults(e);
    }
  }
  _onSpeechPartialResults(e) {
    if (this.onSpeechPartialResults) {
      this.onSpeechPartialResults(e);
    }
  }
  _onSpeechVolumeChanged(e) {
    if (this.onSpeechVolumeChanged) {
      this.onSpeechVolumeChanged(e);
    }
  }
}

module.exports = new RCTGoogleSpeechApi();
