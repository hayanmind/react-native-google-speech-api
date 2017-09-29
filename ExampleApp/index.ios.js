/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Speech from './Speech';

Speech.setApiKey('AIzaSyBqYtZ7yL9B_mX4OfIIkus6qlLwP6st81o');

export default class ExampleApp extends Component {
  componentDidMount() {
    Speech.setEventListener(Speech.Event.SPEECH_RESULT_RECEIVED, async (result) => {
      console.log('ASR result:', result);
    });
    Speech.setEventListener(Speech.Event.SPEECH_PARTIAL_RESULT_RECEIVED, async (result) => {
      console.log('ASR partial result:', result);
    });
    Speech.setEventListener(Speech.Event.ERROR_RECEIVED, async (error) => {
      console.log('ASR error:', error); // eslint-disable-line no-console
    });
  }
  render() {
    return (
      <View>
        <TouchableOpacity onPress={() => Speech.start('en')}>
          <Text style={{fontSize: 200}}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Speech.cancel()}>
          <Text style={{fontSize: 200}}>Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

AppRegistry.registerComponent('ExampleApp', () => ExampleApp);
