import { describe, expect, it } from 'vitest';
import { amalakiContent, getAmalakiContent, getAmalakiMarket } from './amalaki';

describe('Amalaki market content', () => {
  it('resolves Colombia and the United States explicitly', () => {
    expect(getAmalakiMarket('CO', null)).toBe('CO');
    expect(getAmalakiMarket(null, 'USA')).toBe('US');
  });

  it('resolves missing and unknown markets to UNKNOWN', () => {
    expect(getAmalakiMarket(null, null)).toBe('UNKNOWN');
    expect(getAmalakiMarket('MX', 'México')).toBe('UNKNOWN');
    expect(getAmalakiContent(null, null).market).toBe('UNKNOWN');
  });

  it('keeps market-specific data out of UNKNOWN', () => {
    const unknown = amalakiContent.UNKNOWN;
    const text = JSON.stringify(unknown);
    expect(unknown.nutrition).toEqual([]);
    expect(text).not.toContain('Colombia');
    expect(text).not.toContain('Estados Unidos');
    expect(text).not.toContain('Vegan Friendly');
    expect(text).not.toContain('INVIMA');
    expect(text).not.toContain('potasio');
  });

  it('keeps the two nutrition tables isolated', () => {
    expect(getAmalakiContent('CO').nutrition.map((item) => item.value)).toContain('18 kcal');
    expect(getAmalakiContent('CO').nutrition.map((item) => item.value)).not.toContain('25 cal');
    expect(getAmalakiContent('US').nutrition.map((item) => item.value)).toContain('25 cal');
    expect(getAmalakiContent('US').nutrition.map((item) => item.value)).not.toContain('18 kcal');
  });

  it('contains distinct, substantive explanation levels', () => {
    const content = getAmalakiContent('CO');
    expect(content.common.shortExplanation).not.toBe(content.common.quickExplanation);
    expect(content.common.quickExplanation).not.toBe(content.common.fullExplanation);
    expect(content.common.fullExplanation).toContain('Phyllanthus emblica');
    expect(content.common.fullExplanation).toContain('240 ml');
  });
});
