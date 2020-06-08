// Page turning engine 2.0

const turnPage = ({
  currentPageIndex,
  centerfolds,
  pageCount,
  pages,
  polarity,
}) => {
  // centerfolds for singlePaging ( [2, 5, 11]  )
  // currentPageIndex for currentPage, which will make a new var newPageIndex ( Num )
  // pageCount for number of pages turned ( 2 || 1 )
  // pages.length for full comic scope ( 18 )
  // polarity for left or right ( 1 || -1 )

  const isCenterfold = index => centerfolds.includes(index);
  const areThereUpcomingCenterfolds = index =>
    isCenterfold(index) || isCenterfold(index + 1);
  const isRelativeIndexACenterfold = index =>
    areThereUpcomingCenterfolds(currentPageIndex + index);

  let newPageIndex;
  let pagesToDisplay;

  const shouldRenderFirstPage = currentPageIndex + pageCount * polarity < 0;
  const shouldRenderLastPage =
    currentPageIndex + pageCount * polarity >= pages.length - 1;

  if (shouldRenderLastPage) {
    newPageIndex = pages.length - 1;
    pagesToDisplay = 1;
  } else if (shouldRenderFirstPage) {
    newPageIndex = 0;
    pagesToDisplay = areThereUpcomingCenterfolds(0) ? 1 : 2;
  } else if (pageCount === 1) {
    newPageIndex = currentPageIndex + polarity;
    pagesToDisplay = 1;
  } else if (polarity > 0) {
    if (isCenterfold(currentPageIndex)) {
      newPageIndex = currentPageIndex + 1;
      pagesToDisplay = isRelativeIndexACenterfold(1) ? 1 : 2;
    } else if (isCenterfold(currentPageIndex + 1)) {
      newPageIndex = currentPageIndex + 1;
      pagesToDisplay = 1;
    } else if (isRelativeIndexACenterfold(2)) {
      newPageIndex = currentPageIndex + 2;
      pagesToDisplay = 1;
    } else {
      newPageIndex = currentPageIndex + 2;
      pagesToDisplay = 2;
    }
  } else if (isRelativeIndexACenterfold(-2)) {
    newPageIndex = currentPageIndex - 1;
    pagesToDisplay = 1; // May be buggy ?
  } else {
    newPageIndex = currentPageIndex - 2;
    pagesToDisplay = 2;
  }
  return [newPageIndex, pagesToDisplay];
};

export default turnPage;
