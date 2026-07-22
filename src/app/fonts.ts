import {
  Noto_Nastaliq_Urdu,
  Noto_Sans_Bengali,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Meetei_Mayek,
  Noto_Sans_Ol_Chiki,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from 'next/font/google';

import { displayFont } from './base-fonts';

const bengali = Noto_Sans_Bengali({ weight: ['500', '700'], display: 'swap', preload: false });
const telugu = Noto_Sans_Telugu({ weight: ['500', '700'], display: 'swap', preload: false });
const tamil = Noto_Sans_Tamil({ weight: ['500', '700'], display: 'swap', preload: false });
const urdu = Noto_Nastaliq_Urdu({ weight: ['500', '700'], display: 'swap', preload: false });
const gujarati = Noto_Sans_Gujarati({ weight: ['500', '700'], display: 'swap', preload: false });
const kannada = Noto_Sans_Kannada({ weight: ['500', '700'], display: 'swap', preload: false });
const malayalam = Noto_Sans_Malayalam({ weight: ['500', '700'], display: 'swap', preload: false });
const oriya = Noto_Sans_Oriya({ weight: ['500', '700'], display: 'swap', preload: false });
const gurmukhi = Noto_Sans_Gurmukhi({ weight: ['500', '700'], display: 'swap', preload: false });
const olChiki = Noto_Sans_Ol_Chiki({ weight: ['500', '700'], display: 'swap', preload: false });
const meetei = Noto_Sans_Meetei_Mayek({ weight: ['500', '700'], display: 'swap', preload: false });

export const wordmarkFontClass: Record<string, string> = {
  as: bengali.className,
  bn: bengali.className,
  brx: displayFont.className,
  doi: displayFont.className,
  en: displayFont.className,
  gu: gujarati.className,
  hi: displayFont.className,
  kn: kannada.className,
  kok: displayFont.className,
  ks: urdu.className,
  mai: displayFont.className,
  ml: malayalam.className,
  mni: meetei.className,
  mr: displayFont.className,
  ne: displayFont.className,
  or: oriya.className,
  pa: gurmukhi.className,
  sa: displayFont.className,
  sat: olChiki.className,
  sd: urdu.className,
  ta: tamil.className,
  te: telugu.className,
  ur: urdu.className,
};
