import type { LanguageCode } from './i18n';

type CameraCopy = {
  deviceUnavailable: string;
  fileTooLarge: string;
  prepareFailed: string;
  secureRequired: string;
  permissionBlocked: string;
  cameraMissing: string;
  cameraBusy: string;
  startFailed: string;
  previewFailed: string;
  previewUnavailable: string;
  captureFailed: string;
  liveCamera: string;
  starting: string;
  captured: string;
  capturing: string;
  close: string;
  takePhoto: string;
  restart: string;
  cropPreview: string;
};

export const CAMERA_COPY: Record<LanguageCode, CameraCopy> = {
  en: {
    deviceUnavailable: 'The device camera is unavailable. Reload the page and try again.',
    fileTooLarge: 'This file is over 25 MB. Choose a smaller photo or video.',
    prepareFailed: 'This photo could not be prepared. Choose a clear, closer photo and try again.',
    secureRequired: 'Live camera needs a secure connection. Use the device camera option below.',
    permissionBlocked: 'Camera access is blocked. Allow it in browser settings, or use the device camera.',
    cameraMissing: 'No camera was found. Upload a photo or use another device.',
    cameraBusy: 'Another app is using the camera. Close that app and try again.',
    startFailed: 'The live camera could not start. Use the device camera option below.',
    previewFailed: 'The camera opened, but the preview did not start. Restart it or use the device camera.',
    previewUnavailable: 'The camera preview is unavailable. Restart the camera.',
    captureFailed: 'The photo was not captured. Hold the phone steady and try again.',
    liveCamera: 'Live crop camera',
    starting: 'Starting camera',
    captured: 'Photo captured',
    capturing: 'Capturing photo',
    close: 'Close camera',
    takePhoto: 'Take crop photo',
    restart: 'Restart camera',
    cropPreview: 'Crop photo preview',
  },
  hi: {
    deviceUnavailable: 'फोन कैमरा उपलब्ध नहीं है। पेज फिर खोलकर दोबारा प्रयास करें।',
    fileTooLarge: 'यह फाइल 25 एमबी से बड़ी है। छोटी फोटो या वीडियो चुनें।',
    prepareFailed: 'यह फोटो तैयार नहीं हो सकी। साफ और पास से ली गई फोटो चुनकर फिर प्रयास करें।',
    secureRequired: 'लाइव कैमरे के लिए सुरक्षित कनेक्शन चाहिए। नीचे फोन कैमरा विकल्प उपयोग करें।',
    permissionBlocked: 'कैमरा अनुमति बंद है। ब्राउज़र सेटिंग में अनुमति दें या फोन कैमरा उपयोग करें।',
    cameraMissing: 'कैमरा नहीं मिला। फोटो अपलोड करें या दूसरा फोन उपयोग करें।',
    cameraBusy: 'कैमरा किसी दूसरे ऐप में खुला है। वह ऐप बंद करके फिर प्रयास करें।',
    startFailed: 'लाइव कैमरा शुरू नहीं हुआ। नीचे फोन कैमरा विकल्प उपयोग करें।',
    previewFailed: 'कैमरा खुला, लेकिन दृश्य शुरू नहीं हुआ। कैमरा फिर शुरू करें या फोन कैमरा उपयोग करें।',
    previewUnavailable: 'कैमरा दृश्य उपलब्ध नहीं है। कैमरा फिर शुरू करें।',
    captureFailed: 'फोटो नहीं ली जा सकी। फोन स्थिर रखकर फिर प्रयास करें।',
    liveCamera: 'फसल का लाइव कैमरा',
    starting: 'कैमरा शुरू हो रहा है',
    captured: 'फोटो ली गई',
    capturing: 'फोटो ली जा रही है',
    close: 'कैमरा बंद करें',
    takePhoto: 'फसल की फोटो लें',
    restart: 'कैमरा फिर शुरू करें',
    cropPreview: 'फसल फोटो का दृश्य',
  },
  mr: {
    deviceUnavailable: 'फोन कॅमेरा उपलब्ध नाही. पान पुन्हा उघडून प्रयत्न करा.',
    fileTooLarge: 'ही फाइल 25 एमबीपेक्षा मोठी आहे. लहान फोटो किंवा व्हिडिओ निवडा.',
    prepareFailed: 'हा फोटो तयार करता आला नाही. स्वच्छ आणि जवळून घेतलेला फोटो निवडून पुन्हा प्रयत्न करा.',
    secureRequired: 'थेट कॅमेरासाठी सुरक्षित जोडणी हवी. खालील फोन कॅमेरा पर्याय वापरा.',
    permissionBlocked: 'कॅमेरा परवानगी बंद आहे. ब्राउझर सेटिंगमध्ये परवानगी द्या किंवा फोन कॅमेरा वापरा.',
    cameraMissing: 'कॅमेरा सापडला नाही. फोटो अपलोड करा किंवा दुसरा फोन वापरा.',
    cameraBusy: 'कॅमेरा दुसऱ्या अॅपमध्ये सुरू आहे. ते अॅप बंद करून पुन्हा प्रयत्न करा.',
    startFailed: 'थेट कॅमेरा सुरू झाला नाही. खालील फोन कॅमेरा पर्याय वापरा.',
    previewFailed: 'कॅमेरा सुरू झाला, पण दृश्य दिसले नाही. पुन्हा सुरू करा किंवा फोन कॅमेरा वापरा.',
    previewUnavailable: 'कॅमेरा दृश्य उपलब्ध नाही. कॅमेरा पुन्हा सुरू करा.',
    captureFailed: 'फोटो घेता आला नाही. फोन स्थिर धरून पुन्हा प्रयत्न करा.',
    liveCamera: 'पिकाचा थेट कॅमेरा',
    starting: 'कॅमेरा सुरू होत आहे',
    captured: 'फोटो घेतला',
    capturing: 'फोटो घेतला जात आहे',
    close: 'कॅमेरा बंद करा',
    takePhoto: 'पिकाचा फोटो घ्या',
    restart: 'कॅमेरा पुन्हा सुरू करा',
    cropPreview: 'पिकाच्या फोटोचे दृश्य',
  },
};
