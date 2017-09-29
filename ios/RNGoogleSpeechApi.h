
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNGoogleSpeechApi : RCTEventEmitter <RCTBridgeModule>

- (void)recordAudio;
- (void)stopAudio;

@end
  
