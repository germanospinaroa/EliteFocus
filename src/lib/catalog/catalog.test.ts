import { describe, expect, it } from 'vitest';
import { catalogProducts, getCatalogProduct } from './products';

describe('native catalog', () => {
  it('exposes only the six published products', () => {
    expect(catalogProducts.map((product) => product.slug)).toEqual(['ice', 'amalaki', 'b-fit', 'edge', 'rise', 'ultra-vibe']);
    expect(getCatalogProduct('accell')).toBeUndefined();
  });
});
