import type { LanguageCode } from './i18n';

export type InterfaceCopy = {
  skipToContent: string;
  useGps: string;
  chooseLanguage: string;
  switchToDark: string;
  switchToLight: string;
  scoreDetails: string;
  advancedDetails: string;
  evidenceDetails: string;
  updated: string;
  loadingTitle: string;
  loadingHint: string;
};

export const INTERFACE_COPY: Record<LanguageCode, InterfaceCopy> = {
  en: {
    skipToContent: 'Skip to main content',
    useGps: 'Use my current location',
    chooseLanguage: 'Choose language',
    switchToDark: 'Use dark appearance',
    switchToLight: 'Use light appearance',
    scoreDetails: 'Why this score?',
    advancedDetails: 'Device health and trust details',
    evidenceDetails: 'View audit evidence',
    updated: 'Updated',
    loadingTitle: 'Preparing your farm workspace',
    loadingHint: 'Loading your location, weather and farm signals.',
  },
  hi: {
    skipToContent: 'मुख्य जानकारी पर जाएं',
    useGps: 'मेरी वर्तमान जगह का उपयोग करें',
    chooseLanguage: 'भाषा चुनें',
    switchToDark: 'गहरा रंग रूप चुनें',
    switchToLight: 'हल्का रंग रूप चुनें',
    scoreDetails: 'यह स्कोर क्यों है?',
    advancedDetails: 'उपकरण स्थिति और भरोसे का विवरण',
    evidenceDetails: 'जांच प्रमाण देखें',
    updated: 'अपडेट',
    loadingTitle: 'आपका खेत कार्यक्षेत्र तैयार हो रहा है',
    loadingHint: 'जगह, मौसम और खेत संकेत लोड हो रहे हैं।',
  },
  mr: {
    skipToContent: 'मुख्य माहितीवर जा',
    useGps: 'माझे सध्याचे स्थान वापरा',
    chooseLanguage: 'भाषा निवडा',
    switchToDark: 'गडद रंगरूप वापरा',
    switchToLight: 'फिकट रंगरूप वापरा',
    scoreDetails: 'हा स्कोअर का आहे?',
    advancedDetails: 'उपकरण स्थिती आणि विश्वास तपशील',
    evidenceDetails: 'तपासणी पुरावा पहा',
    updated: 'अद्ययावत',
    loadingTitle: 'तुमचे शेत कार्यक्षेत्र तयार होत आहे',
    loadingHint: 'स्थान, हवामान आणि शेत संकेत लोड होत आहेत.',
  },
};
