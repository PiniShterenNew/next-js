import { calculateInvoiceTotal } from '../utils';

describe('calculateInvoiceTotal', () => {
  it('calculates total with tax and discount', () => {
    const result = calculateInvoiceTotal(200, 10, 20);
    expect(result).toEqual({
      subtotal: 200,
      tax: 18,
      discount: 20,
      total: 198,
    });
  });

  it('defaults discount and tax to zero', () => {
    const result = calculateInvoiceTotal(50);
    expect(result).toEqual({
      subtotal: 50,
      tax: 0,
      discount: 0,
      total: 50,
    });
  });
});
