import { describe, expect, it, vi } from 'vitest';

import { getOnRowClick } from './getOnRowClick';

describe('getOnRowClick', () => {
  it('passes the clicked row correlation to the setter', () => {
    const setSelected = vi.fn();

    getOnRowClick(setSelected)({ row: { correlation: 'corr-1' } });

    expect(setSelected).toHaveBeenCalledWith('corr-1');
  });
});
