import { describe, expect, it } from 'vitest';
import { parseApmcList } from './umang-enam';

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
