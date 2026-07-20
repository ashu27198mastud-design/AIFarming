import { describe, expect, it } from 'vitest';
import { parseApmcList, parseBidList, summarizeBids } from './umang-enam';

describe('parseApmcList', () => {
  it('normalizes and de-duplicates the documented UMANG/eNAM response', () => {
    const payload = {
      rs: 'Success',
      pd: [{
        statusMsg: 'S',
        listStateApmc: [
          { stateDesc: 'West Bengal', apmcDesc: 'Jiyaganj Krishak Bazar' },
          { stateDesc: 'West Bengal', apmcDesc: 'Samsherganj Krishak Bazar' },
          { stateDesc: 'West Bengal', apmcDesc: 'Jiyaganj Krishak Bazar' },
        ],
      }],
    };

    expect(parseApmcList(payload)).toEqual([
      { state: 'West Bengal', name: 'Jiyaganj Krishak Bazar' },
      { state: 'West Bengal', name: 'Samsherganj Krishak Bazar' },
    ]);
  });

  it('returns an empty list for an unexpected gateway response', () => {
    expect(parseApmcList({ message: 'Forbidden' })).toEqual([]);
  });
});

describe('parseBidList', () => {
  const payload = {
    rs: 'Success',
    pd: [{
      status: 'S',
      listNewBid: [
        {
          oprId: '371',
          oprName: 'SIWANI',
          tranId: '2024030371121001051',
          seller: 'GORDHAN',
          commissionAgent: 'M/S HANUMAN PARSAD RAVINDER KUMAR',
          lotCode: '371-20240322-13',
          productId: '2016070011220000039',
          productName: 'GUAR SEEDS',
          noOfBag: '60',
          wbWeight: '30.00 QUINTAL',
          bidType: 'Open',
          bidStatus: 'O',
          maxOpenBidVal: '5050.00',
          bidEndTime: '2024-03-22 18:21:26',
          caEmailid: 'abc@gmail.com',
          caContactNo: '9813517653',
          rateUom: 'QUINTAL',
        },
        {
          oprId: '371',
          oprName: 'SIWANI',
          tranId: '2024030371121001050',
          lotCode: '371-20240322-14',
          productId: '2016070011220000039',
          productName: 'GUAR SEEDS',
          noOfBag: '56',
          wbWeight: '28.00 QUINTAL',
          bidType: 'Open',
          bidStatus: 'O',
          maxOpenBidVal: '5043.00',
          bidEndTime: '2024-03-22 18:25:26',
          rateUom: 'QUINTAL',
        },
      ],
    }],
  };

  it('normalizes bid rows and strips private seller/contact fields', () => {
    const bids = parseBidList(payload);
    expect(bids).toHaveLength(2);
    expect(bids[0]).toMatchObject({
      apmcId: '371',
      apmcName: 'SIWANI',
      lotCode: '371-20240322-13',
      bags: 60,
      weightQuintal: 30,
      bidStatus: 'open',
      maxBidValue: 5050,
    });
    expect(bids[0]).not.toHaveProperty('seller');
    expect(bids[0]).not.toHaveProperty('commissionAgent');
    expect(bids[0]).not.toHaveProperty('caContactNo');
  });

  it('summarizes open lots, highest bid, and total arrival weight', () => {
    expect(summarizeBids(parseBidList(payload))).toEqual({
      lots: 2,
      openLots: 2,
      highestBid: 5050,
      totalWeightQuintal: 58,
      rateUom: 'QUINTAL',
      closesAt: '2024-03-22 18:21:26',
    });
  });
});
