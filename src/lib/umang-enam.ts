const UMANG_BASE_URL = 'https://apigw.umangapp.in/umang/apisetu/dept/enamapi/ws1';
const DEPARTMENT_ID = '324';
const SERVICE_ID = '1408';
const SUBSERVICE_ID = '0';
const FORM_TRACKER = '0';

type UnknownRecord = Record<string, unknown>;

export type ApmcOption = {
  state: string;
  name: string;
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
  return typeof value === 'string' ? value.trim() : '';
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

async function callUmang(operation: string, requestData: UnknownRecord): Promise<unknown> {
  const config = readConfig();
  if (!config) throw new UmangGatewayError('UMANG/eNAM credentials are not configured', 503);
  const body: UnknownRecord = {
    tkn: config.requestToken,
    trkr: config.tracker,
    usrid: config.userId,
    srvid: SERVICE_ID,
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
      srvid: SERVICE_ID,
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
