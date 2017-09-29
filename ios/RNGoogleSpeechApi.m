
#import <AVFoundation/AVFoundation.h>

#import "RNGoogleSpeechApi.h"
#import "AudioController.h"
#import "SpeechRecognitionService.h"
#import "google/cloud/speech/v1/CloudSpeech.pbrpc.h"

#define SAMPLE_RATE 16000.0f

@interface RNGoogleSpeechApi () <AudioControllerDelegate>
@property (nonatomic, strong) NSMutableData *audioData;
@end

@implementation RNGoogleSpeechApi

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"onSpeechPartialResults", @"onSpeechResults", @"onSpeechError"];
}

- (void) recordAudio {
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setCategory:AVAudioSessionCategoryRecord error:nil];
    
    _audioData = [[NSMutableData alloc] init];
    [[AudioController sharedInstance] prepareWithSampleRate:SAMPLE_RATE];
    [[SpeechRecognitionService sharedInstance] setSampleRate:SAMPLE_RATE];
    [[AudioController sharedInstance] start];
}

- (void) stopAudio {
    [[AudioController sharedInstance] stop];
    [[SpeechRecognitionService sharedInstance] stopStreaming];
}

- (void) processSampleData:(NSData *)data
{
    [self.audioData appendData:data];
    NSInteger frameCount = [data length] / 2;
    int16_t *samples = (int16_t *) [data bytes];
    int64_t sum = 0;
    for (int i = 0; i < frameCount; i++) {
        sum += abs(samples[i]);
    }
    NSLog(@"audio %d %d", (int) frameCount, (int) (sum * 1.0 / frameCount));
    
    // We recommend sending samples in 100ms chunks
    int chunk_size = 0.1 /* seconds/chunk */ * SAMPLE_RATE * 2 /* bytes/sample */ ; /* bytes/chunk */
    
    if ([self.audioData length] > chunk_size) {
        NSLog(@"SENDING");
        [[SpeechRecognitionService sharedInstance] streamAudioData:self.audioData
                                                    withCompletion:^(StreamingRecognizeResponse *response, NSError *error) {
                                                        if (error) {
                                                            NSLog(@"ERROR: %@", error);
                                                            NSString *errorMessage = [NSString stringWithFormat:@"%ld/%@", error.code, [error localizedDescription]];
                                                            [self sendEventWithName:@"onSpeechError" body:@{@"error": errorMessage}];
                                                            [self stopAudio];
                                                        } else if (response) {
                                                            BOOL finished = NO;
                                                            NSLog(@"RESPONSE: %@", response);
                                                            NSMutableArray *transcriptArray = [NSMutableArray array];
                                                            for (StreamingRecognitionResult *result in response.resultsArray) {
                                                                NSLog(@"RESULT: %@", result);
                                                                [transcriptArray addObject:result.alternativesArray[0].transcript];
                                                                if (result.isFinal) {
                                                                    finished = YES;
                                                                }
                                                            }
                                                            if (finished) {
                                                                [self sendEventWithName:@"onSpeechResults" body:@{@"value": transcriptArray}];
                                                            } else {
                                                                [self sendEventWithName:@"onSpeechPartialResults" body:@{@"value": transcriptArray}];
                                                            }
                                                        }
                                                    }
         ];
        self.audioData = [[NSMutableData alloc] init];
    }
}

RCT_EXPORT_METHOD(setApiKey:(NSString *)apiKey) {
    NSLog(@"setApiKey: %@", apiKey);
    [AudioController sharedInstance].delegate = self;
    [[SpeechRecognitionService sharedInstance] setApiKey:apiKey];
}

RCT_EXPORT_METHOD(startSpeech:(NSString*)localeStr) {
    [self recordAudio];
}

RCT_EXPORT_METHOD(cancelSpeech) {
    [self stopAudio];
}

@end
