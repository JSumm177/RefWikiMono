import { translateQuery } from '../../utils/refTranslator';

describe('translateQuery', () => {
  it('should return empty string if input is empty', () => {
    expect(translateQuery('')).toBe('');
  });

  it('should translate single terms correctly', () => {
    expect(translateQuery('pi')).toBe('pass interference');
    expect(translateQuery('facemask')).toBe('face mask');
  });

  it('should be case-insensitive', () => {
    expect(translateQuery('PI')).toBe('pass interference');
    expect(translateQuery('FaceMask')).toBe('face mask');
  });

  it('should handle multi-word terms', () => {
    expect(translateQuery('horse collar')).toBe('horse-collar tackle');
    expect(translateQuery('automatic first down')).toBe('first down');
  });

  it('should translate multiple terms in one string', () => {
    const input = 'pi and facemask';
    const output = translateQuery(input);
    expect(output).toBe('pass interference and face mask');
  });

  it('should only match whole words', () => {
    // "pi" is in the dict, but "pilot" should not be translated
    expect(translateQuery('pilot')).toBe('pilot');
    // "dpi" is in the dict, but "rapid" should not be translated
    expect(translateQuery('rapid')).toBe('rapid');
  });

  it('should handle complex strings with mixed terms', () => {
    const input = 'That horse collar was at least 15 yards';
    const output = translateQuery(input);
    expect(output).toBe('that horse-collar tackle was at least 15 yards penalty');
  });

  it('should return the original string (lowercased) if no terms match', () => {
    const input = 'holding and personal foul';
    expect(translateQuery(input)).toBe('holding and personal foul');
  });
});
