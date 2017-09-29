using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Com.Reactlibrary.RNGoogleSpeechApi
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNGoogleSpeechApiModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNGoogleSpeechApiModule"/>.
        /// </summary>
        internal RNGoogleSpeechApiModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNGoogleSpeechApi";
            }
        }
    }
}
