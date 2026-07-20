'use client';

import { useEffect } from 'react';
import type { LanguageCode } from '@/lib/i18n';

const LATIN_WORD = /[A-Za-z]{3,}/g;
const ALLOWED_LATIN = new Set(['KisanMitra', 'APMC', 'NPK']);

type Props = {
  locale: LanguageCode;
};

export default function LatinLeakScanner({ locale }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || locale === 'en') return undefined;

    let scanTimer = 0;
    const scan = () => {
      const leaks = new Set<string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        const parent = node.parentElement;
        const text = node.textContent?.replace(/\s+/g, ' ').trim() || '';
        if (
          text
          && parent
          && !parent.closest('script, style, code, pre, kbd, samp, select, option, details:not([open]), [aria-hidden="true"], [data-latin-ok], [data-user-content]')
          && parent.getClientRects().length > 0
          && getComputedStyle(parent).display !== 'none'
          && getComputedStyle(parent).visibility !== 'hidden'
        ) {
          for (const word of text.match(LATIN_WORD) || []) {
            if (!ALLOWED_LATIN.has(word)) leaks.add(word);
          }
        }
        node = walker.nextNode();
      }

      if (leaks.size) {
        console.warn('[i18n] Latin leak (' + locale + '):', [...leaks].sort().join(', '));
      } else {
        console.info('[i18n] Latin leak scan clean (' + locale + ')');
      }
    };

    const scheduleScan = () => {
      window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scan, 120);
    };

    scheduleScan();
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(scanTimer);
    };
  }, [locale]);

  return null;
}
