//
// Copyright 2016 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

#import "SpeechRecognitionService.h"

#import <GRPCClient/GRPCCall.h>
#import <RxLibrary/GRXBufferedPipe.h>
#import <ProtoRPC/ProtoRPC.h>

// #define API_KEY @"AIzaSyBqYtZ7yL9B_mX4OfIIkus6qlLwP6st81o"
#define HOST @"speech.googleapis.com"

@interface SpeechRecognitionService ()

@property (nonatomic, assign) BOOL streaming;
@property (nonatomic, strong) Speech *client;
@property (nonatomic, strong) GRXBufferedPipe *writer;
@property (nonatomic, strong) GRPCProtoCall *call;

@end

@implementation SpeechRecognitionService

+ (instancetype) sharedInstance {
  static SpeechRecognitionService *instance = nil;
  if (!instance) {
    instance = [[self alloc] init];
    instance.sampleRate = 16000.0; // default value
  }
  return instance;
}

- (void) streamAudioData:(NSData *) audioData
          withCompletion:(SpeechRecognitionCompletionHandler)completion {

  if (!_streaming) {
    // if we aren't already streaming, set up a gRPC connection
    _client = [[Speech alloc] initWithHost:HOST];
    _writer = [[GRXBufferedPipe alloc] init];
    _call = [_client RPCToStreamingRecognizeWithRequestsWriter:_writer
                                         eventHandler:^(BOOL done, StreamingRecognizeResponse *response, NSError *error) {
                                           completion(response, error);
                                         }];

    // authenticate using an API key obtained from the Google Cloud Console
    _call.requestHeaders[@"X-Goog-Api-Key"] = self.apiKey;
    // if the API key has a bundle ID restriction, specify the bundle ID like this
    _call.requestHeaders[@"X-Ios-Bundle-Identifier"] = [[NSBundle mainBundle] bundleIdentifier];

    NSLog(@"HEADERS: %@", _call.requestHeaders);

    [_call start];
    _streaming = YES;

    // send an initial request message to configure the service
    RecognitionConfig *recognitionConfig = [RecognitionConfig message];
    recognitionConfig.encoding = RecognitionConfig_AudioEncoding_Linear16;
    recognitionConfig.sampleRateHertz = self.sampleRate;
    recognitionConfig.languageCode = @"en-US";
    recognitionConfig.maxAlternatives = 30;

    StreamingRecognitionConfig *streamingRecognitionConfig = [StreamingRecognitionConfig message];
    streamingRecognitionConfig.config = recognitionConfig;
    streamingRecognitionConfig.singleUtterance = NO;
    streamingRecognitionConfig.interimResults = YES;

    StreamingRecognizeRequest *streamingRecognizeRequest = [StreamingRecognizeRequest message];
    streamingRecognizeRequest.streamingConfig = streamingRecognitionConfig;

    [_writer writeValue:streamingRecognizeRequest];
  }

  // send a request message containing the audio data
  StreamingRecognizeRequest *streamingRecognizeRequest = [StreamingRecognizeRequest message];
  streamingRecognizeRequest.audioContent = audioData;
  [_writer writeValue:streamingRecognizeRequest];
}

- (void) stopStreaming {
  if (!_streaming) {
    return;
  }
  [_writer finishWithError:nil];
  _streaming = NO;
}

- (BOOL) isStreaming {
  return _streaming;
}

@end
