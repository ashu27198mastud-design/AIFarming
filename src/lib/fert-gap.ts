import type { LanguageCode } from './i18n';

export type FertilizerGapResult =
  | { status: 'empty' }
  | {
      status: 'ready';
      quantity: number;
      verdict: string;
      verdictParts: { prefix: string; quantity: string; suffix: string };
      context: string;
      compliance: string;
      category: 'urea';
      categoryPath: string;
    };

const COPY: Record<LanguageCode, {
  prefix: (crop: string) => string;
  suffix: string;
  context: string;
  compliance: string;
}> = {
  hi: {
    prefix: (crop) => crop + ' के लिए',
    suffix: 'बैग यूरिया चाहिए',
    context: 'NPK सूक्ष्म पोषक',
    compliance: 'यह केवल दर्ज योजना और उपलब्ध स्टॉक का अंतर है। अंतिम मात्रा मिट्टी जांच और कृषि अधिकारी से पक्की करें।',
  },
  en: {
    prefix: (crop) => 'For ' + crop,
    suffix: 'bags of urea are needed',
    context: 'NPK micronutrients',
    compliance: 'This is only the gap between your logged plan and stock. Confirm the final dose using a soil test and local agriculture officer.',
  },
  mr: {
    prefix: (crop) => crop + 'साठी',
    suffix: 'बॅग युरिया लागेल',
    context: 'NPK सूक्ष्म अन्नद्रव्ये',
    compliance: 'हा फक्त नोंदवलेली योजना आणि उपलब्ध साठा यातील फरक आहे. अंतिम मात्रा माती तपासणी आणि कृषी अधिकाऱ्याकडून निश्चित करा.',
  },
};

export function calculateFertilizerGap(input: {
  crop: string;
  language: LanguageCode;
  plannedBags: number | null;
  stockBags: number | null;
}): FertilizerGapResult {
  if (
    input.plannedBags === null
    || input.stockBags === null
    || !Number.isFinite(input.plannedBags)
    || !Number.isFinite(input.stockBags)
    || input.plannedBags < 0
    || input.stockBags < 0
  ) {
    return { status: 'empty' };
  }

  const quantity = Math.max(0, Math.ceil(input.plannedBags - input.stockBags));
  const copy = COPY[input.language];
  const localizedQuantity = new Intl.NumberFormat(
    input.language === 'mr' ? 'mr-IN' : input.language === 'hi' ? 'hi-IN' : 'en-IN',
  ).format(quantity);
  const parts = {
    prefix: copy.prefix(input.crop),
    quantity: localizedQuantity,
    suffix: copy.suffix,
  };

  return {
    status: 'ready',
    quantity,
    verdict: parts.prefix + ' ' + parts.quantity + ' ' + parts.suffix,
    verdictParts: parts,
    context: copy.context,
    compliance: copy.compliance,
    category: 'urea',
    categoryPath: '/bazaar?category=urea&lang=' + input.language,
  };
}
