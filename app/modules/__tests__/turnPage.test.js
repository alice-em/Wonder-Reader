import turnPage from '../turnPage';

// Test data is limited in scope, so a lot of generated numbers that tend to
// overlap when using single-digit numbers.
const generateTurnPageData = (newPageIndex, pagesToDisplay) => [
  newPageIndex,
  pagesToDisplay,
];

describe('turnPage', () => {
  it('turns a page right', () => {
    const state = {
      currentPageIndex: 0,
      centerfolds: [],
      pageCount: 1,
      pages: ['a', 'b', 'c', 'd'],
      polarity: 1,
    };
    const turnPageData = turnPage(state);
    expect(turnPageData).toEqual(generateTurnPageData(1, 1));
    expect(state.pages[turnPageData[0]]).toBe('b');
  });

  it('turns a page left', () => {
    const state = {
      currentPageIndex: 2,
      centerfolds: [],
      pageCount: 1,
      pages: ['a', 'b', 'c', 'd'],
      polarity: -1,
    };
    const turnPageData = turnPage(state);
    expect(turnPageData).toEqual(generateTurnPageData(1, 1));
    expect(state.pages[turnPageData[0]]).toBe('b');
  });

  it('turns to the last page', () => {
    const state = {
      currentPageIndex: 3,
      centerfolds: [],
      pageCount: 1,
      pages: ['a', 'b', 'c', 'd'],
      polarity: 1,
    };
    const turnPageData = turnPage(state);
    expect(turnPageData).toEqual(generateTurnPageData(3, 1));
    expect(state.pages[turnPageData[0]]).toBe('d');
  });

  it('turns to the first page', () => {
    const state = {
      currentPageIndex: 0,
      centerfolds: [],
      pageCount: 2,
      pages: ['a', 'b', 'c', 'd'],
      polarity: -1,
    };
    const turnPageData = turnPage(state);
    expect(turnPageData).toEqual(generateTurnPageData(0, 2));
    expect(state.pages[turnPageData[0]]).toBe('a');
  });

  it('turns to the second page if first page is a centerfold', () => {
    const state = {
      currentPageIndex: 1,
      centerfolds: [0],
      pageCount: 2,
      pages: ['a', 'b', 'c', 'd'],
      polarity: -1,
    };
    const turnPageData = turnPage(state);
    expect(turnPageData).toEqual(generateTurnPageData(0, 1));
    expect(state.pages[turnPageData[0]]).toBe('a');
  });

  describe('Complex Positive Polarity Conditionals', () => {
    const polarity = 1;
    it('renders on centerfolds', () => {
      const state = {
        currentPageIndex: 0,
        centerfolds: [0],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(1, 2));
      expect(state.pages[turnPageData[0]]).toBe('b');
    });

    it('renders on relative upcoming centerfolds', () => {
      const state = {
        currentPageIndex: 0,
        centerfolds: [0, 1],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(1, 1));
      expect(state.pages[turnPageData[0]]).toBe('b');
    });

    it('renders if the next page is a centerfold', () => {
      const state = {
        currentPageIndex: 0,
        centerfolds: [1],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(1, 1));
      expect(state.pages[turnPageData[0]]).toBe('b');
    });

    it('anticipates if there is a centerfold 2 pages from currentPageIndex', () => {
      const state = {
        currentPageIndex: 0,
        centerfolds: [2],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(2, 1));
      expect(state.pages[turnPageData[0]]).toBe('c');
    });

    it('renders complex equations if it fails other positive polarity patterns', () => {
      const state = {
        currentPageIndex: 0,
        centerfolds: [],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(2, 2));
      expect(state.pages[turnPageData[0]]).toBe('c');
    });
  });

  describe('Complex Negative Polarity Conditionals', () => {
    const polarity = -1;
    it('anticipates a centerfold two pages back', () => {
      const state = {
        currentPageIndex: 2,
        centerfolds: [0],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(1, 1));
      expect(state.pages[turnPageData[0]]).toBe('b');
    });

    it('Goes back two pages if it fails all other scenarios', () => {
      const state = {
        currentPageIndex: 2,
        centerfolds: [],
        pageCount: 2,
        pages: ['a', 'b', 'c', 'd'],
        polarity,
      };
      const turnPageData = turnPage(state);
      expect(turnPageData).toEqual(generateTurnPageData(0, 2));
      expect(state.pages[turnPageData[0]]).toBe('a');
    });
  });
});
