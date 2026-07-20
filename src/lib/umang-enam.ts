const UMANG_BASE_URL = 'https://apigw.umangapp.in/umang/apisetu/dept/enamapi/ws1';
const DEPARTMENT_ID = '324';
const APMC_SERVICE_ID = '1408';
const BID_SERVICE_ID = '1411';
const SUBSERVICE_ID = '0';
const FORM_TRACKER = '0';

type UnknownRecord = Record<string, unknown>;

export type ApmcOption = {
  state: string;
  name: string;
};

export type EnamBid = {
  apmcId: string;
  apmcName: string;
  transactionId: string;
  lotCode: string;
  productId: string;
  productName: string;
  bags: number;
  weightQuintal: number;
  bidType: string;
  bidStatus: 'open' | 'closed' | 'unknown';
  maxBidValue: number;
  bidEndTime: string;
  rateUom: string;
};

export type EnamBidSummary = {
  lots: number;
  openLots: number;
  highestBid: number;
  totalWeightQuintal: number;
  rateUom: string;
  closesAt: string;
};

type UmangConfig = {
  apiKey: string;
  accessToken: string;
  requestToken: string;
  tracker: string;
  userId: string;
};

export class UmangGatewayError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'UmangGatewayError';
  }
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function recordList(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function text(value: unknown): string {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized.toLowerCase() === 'none' ? '' : normalized;
}

function numberFrom(value: unknown): number {
  const normalized = typeof value === 'number' ? String(value) : text(value);
  const parsed = Number(normalized.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)?.[0] ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function readConfig(): UmangConfig | null {
  const apiKey = process.env.UMANG_ENAM_API_KEY?.trim();
  const accessToken = process.env.UMANG_ENAM_ACCESS_TOKEN?.trim();
  const requestToken = process.env.UMANG_ENAM_REQUEST_TOKEN?.trim();
  if (!apiKey || !accessToken || !requestToken) return null;
  return {
    apiKey,
    accessToken,
    requestToken,
    tracker: process.env.UMANG_ENAM_TRACKER?.trim() || '213132',
    userId: process.env.UMANG_ENAM_USER_ID?.trim() || '09',
  };
}

export function isUmangEnamConfigured(): boolean {
  return readConfig() !== null;
}

export function parseApmcList(payload: unknown): ApmcOption[] {
  const blocks = recordList(record(payload).pd);
  const seen = new Set<string>();
  const options: ApmcOption[] = [];
  for (const block of blocks) {
    const rows = recordList(block.listStateApmc ?? block.listApmc);
    for (const row of rows) {
      const name = text(row.apmcDesc ?? row.mandiName ?? row.marketName);
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      options.push({ state: text(row.stateDesc), name });
    }
  }
  return options;
}

function bidStatus(value: unknown): EnamBid['bidStatus'] {
  const normalized = text(value).toLowerCase();
  if (normalized === 'o' || normalized === 'open') return 'open';
  if (normalized === 'c' || normalized === 'closed') return 'closed';
  return 'unknown';
}

export function parseBidList(payload: unknown): EnamBid[] {
  const blocks = recordList(record(payload).pd);
  const bids: EnamBid[] = [];
  for (const block of blocks) {
    for (const row of recordList(block.listNewBid)) {
      const lotCode = text(row.lotCode);
      const transactionId = text(row.tranId);
      const maxBidValue = numberFrom(row.maxOpenBidVal ?? row.lastBidVal);
      if (!lotCode && !transactionId) continue;
      bids.push({
        apmcId: text(row.oprId),
        apmcName: text(row.oprNameEn ?? row.oprName),
        transactionId,
        lotCode,
        productId: text(row.productId),
        productName: text(row.productName),
        bags: numberFrom(row.noOfBag),
        weightQuintal: numberFrom(row.wbWeight),
        bidType: text(row.bidType),
        bidStatus: bidStatus(row.bidStatus),
        maxBidValue,
        bidEndTime: text(row.bidEndTime ?? row.extendedEndTime ?? row.endDate),
        rateUom: text(row.rateUom) || 'QUINTAL',
      });
    }
  }
  return bids.sort((a, b) => b.maxBidValue - a.maxBidValue);
}

export function summarizeBids(bids: EnamBid[]): EnamBidSummary {
  const valid = bids.filter((bid) => bid.maxBidValue > 0 || bid.weightQuintal > 0);
  const dated = valid
    .map((bid) => ({ value: bid.bidEndTime, time: new Date(bid.bidEndTime).getTime() }))
    .filter((item) => Number.isFinite(item.time))
    .sort((a, b) => a.time - b.time);
  return {
    lots: valid.length,
    openLots: valid.filter((bid) => bid.bidStatus === 'open').length,
    highestBid: valid.reduce((max, bid) => Math.max(max, bid.maxBidValue), 0),
    totalWeightQuintal: Math.round(valid.reduce((sum, bid) => sum + bid.weightQuintal, 0) * 10) / 10,
    rateUom: valid.find((bid) => bid.rateUom)?.rateUom || 'QUINTAL',
    closesAt: dated[0]?.value || '',
  };
}

async function callUmang(operation: string, requestData: UnknownRecord, serviceId = APMC_SERVICE_ID): Promise<unknown> {
  const config = readConfig();
  if (!config) throw new UmangGatewayError('UMANG/eNAM credentials are not configured', 503);
  const body: UnknownRecord = {
    tkn: config.requestToken,
    trkr: config.tracker,
    usrid: config.userId,
    srvid: serviceId,
    mode: 'web',
    pltfrm: 'apisetu',
    did: null,
    deptid: DEPARTMENT_ID,
    subsid: SUBSERVICE_ID,
    subsid2: SUBSERVICE_ID,
    formtrkr: FORM_TRACKER,
    [operation]: requestData,
  };
  const response = await fetch(UMANG_BASE_URL + '/' + operation, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + config.accessToken,
      deptid: DEPARTMENT_ID,
      srvid: serviceId,
      subsid: SUBSERVICE_ID,
      subsid2: SUBSERVICE_ID,
      formtrkr: FORM_TRACKER,
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new UmangGatewayError('UMANG/eNAM gateway returned ' + response.status, response.status);
  }
  const payload = await response.json();
  const root = record(payload);
  if (text(root.rs).toLowerCase() === 'failure') {
    throw new UmangGatewayError(text(root.rd) || 'UMANG/eNAM request failed', 502);
  }
  return payload;
}

export async function getApmcsForDistrict(input: { language: string; state: string; district: string }): Promise<ApmcOption[]> {
  const payload = await callUmang('getApmcForMI', {
    language: input.language,
    stateName: input.state,
    districtName: input.district,
  });
  return parseApmcList(payload);
}

export async function getMandiInformation(input: { language: string; state: string; district: string; mandi: string }): Promise<unknown[]> {
  const payload = await callUmang('getMandiInfoForMI', {
    language: input.language,
    stateName: input.state,
    districtName: input.district,
    mandiName: input.mandi,
  });
  return Array.isArray(record(payload).pd) ? record(payload).pd as unknown[] : [];
}

export async function getAllBids(input: { language: string; stateId: number; apmcId: number; commodityId: string }): Promise<EnamBid[]> {
  const payload = await callUmang('getAllBids', {
    language: input.language,
    stateId: input.stateId,
    apmcId: input.apmcId,
    commodityId: input.commodityId,
  }, BID_SERVICE_ID);
  return parseBidList(payload);
}
