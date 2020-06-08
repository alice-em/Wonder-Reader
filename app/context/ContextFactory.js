import electron from 'electron';
import fs from 'fs';
import React, { createContext, useEffect, useState } from 'react';
import path from 'path';
import sizeOf from 'image-size';

import defaultState from './defaultState';
import encodePath from '../modules/encodePath';
import File from '../modules/File';
import turnPage from '../modules/turnPage';
import { copyDeepObject } from '../modules/copyData';
import {
  generateCenterfolds,
  generateNestedContentFromFilepath,
} from '../modules/generate';
import { strainComics } from '../modules/strain';

const { dialog } = electron.remote ? electron.remote : electron;

const mapPages = tempdir => (file, key) => {
  const pagePath = path.join(tempdir, file);
  return {
    encodedPagePath: encodePath(pagePath),
    key,
    pagePath,
  };
};

const generateImage = (page) => {
  const img = new Image();
  img.src = page.encodedPagePath;
  return img;
};

const Context = createContext();
Context.displayName = 'Context';

const ConnectContext = ({ children }) => {
  const [state, updateState] = useState(defaultState);

  // prettier-ignore
  const setState = newState => updateState(currentState => ({ ...currentState, ...newState }));
  // prettier-ignore
  // const setState = newState => updateState(currentState => {
  //     console.log('currentState', currentState);
  //     console.log('newState', newState);
  //
  //     return { ...currentState, ...newState };
  //   });

  // Core Shared Functionality
  const throwError = (error, errorMessage) => {
    if (error) {
      setState({ errorMessage });
    }
  };

  const isCenterfold = (index) => {
    const { centerfolds } = state;
    return centerfolds.includes(index);
  };

  const isCenterfoldsComing = () => {
    const { currentPageIndex } = state;
    return isCenterfold(currentPageIndex) || isCenterfold(currentPageIndex + 1);
  };

  const setCurrentPages = (
    newPageIndex,
    pagesToDisplay,
    { openedComic, pageCount, pages } = state,
  ) => {
    const encodedPages = [];
    const pagesToRender = Math.min(
      pageCount || state.pageCount,
      pagesToDisplay,
    );
    for (let i = 0; i < pagesToRender; i += 1) {
      const key = Number(newPageIndex) + i;
      if (key < pages.length) {
        // Stops from trying to read beyond comic page length
        const pagePath = path.join(openedComic.tempdir, openedComic.pages[key]);
        const { width, height } = sizeOf(pagePath);
        const generateHeight = () =>
          encodedPages[0] && encodedPages[0].height
            ? encodedPages[0].height / height
            : 1;
        const ratio = key === newPageIndex ? 1 : generateHeight();

        encodedPages[i] = {
          height: height * ratio,
          key,
          page: encodePath(pagePath),
          width: width * ratio,
        };
      }
    }

    setState({
      currentPageIndex: newPageIndex,
      encodedPages,
      openedComic,
      pageCount: pageCount || state.pageCount,
      pages: pages || state.pages,
    });
  };

  // ChangePageCount Function
  const togglePageCount = () => {
    const { pageCount } = state;
    const newPageCount = pageCount === 2 ? 1 : 2;
    setState({ pageCount: newPageCount });
    return newPageCount;
  };
  const changePageCount = () => {
    const { currentPageIndex, openedComic } = state;
    const newPageCount = togglePageCount();

    if (openedComic.name !== null) {
      const overridePageCountCondition =
        newPageCount === 2 && isCenterfoldsComing();
      const overriddenPageCountValue = overridePageCountCondition
        ? 1
        : newPageCount;
      setCurrentPages(currentPageIndex, overriddenPageCountValue, state);
    }
  };

  // OpenComic Functions
  const openComic = (fullpath) => {
    const handleReadDir = newOpenedComic => (err, files) => {
      const { pageCount } = state;
      const generatedPages = files.map(mapPages(newOpenedComic.tempdir));
      const pagePaths = generatedPages.map(({ pagePath }) => pagePath);

      const newState = {
        centerfolds: generateCenterfolds(pagePaths),
        images: generatedPages.map(generateImage),
        isLibraryActive: false,
        isLoading: false,
        openedComic: newOpenedComic,
        pages: generatedPages,
      };

      setState(newState);
      setCurrentPages(0, pageCount, newState);
    };

    const handleComicExtract = (newOpenedComic) => {
      if (newOpenedComic.error) {
        throwError(true, newOpenedComic.errorMessage);
      } else {
        fs.readdir(newOpenedComic.tempdir, handleReadDir(newOpenedComic));
      }
    };

    const Comic = new File(fullpath);
    setState({ isLoading: true });
    Comic.extract(handleComicExtract);
  };

  const openAdjacentComic = (polarity) => {
    const { openedComic } = state;
    const handleReadDir = (err, files) => {
      const strainedComics = strainComics(files);
      const newIndex = strainedComics.indexOf(openedComic.name) + polarity;
      if (newIndex > -1 && newIndex < strainedComics.length) {
        const newComicFilepath = path.join(
          path.dirname(openedComic.origin),
          strainedComics[newIndex],
        );
        openComic(newComicFilepath);
      }
    };

    if (openedComic.name !== null) {
      fs.readdir(path.dirname(openedComic.origin), handleReadDir);
    }
  };

  // TurnPage Functions
  const shouldPageTurnLeft = () => {
    const { currentPageIndex } = state;
    return currentPageIndex !== 0;
  };

  const shouldPageTurnRight = () => {
    const { currentPageIndex, pageCount, pages } = state;
    const ultimatePage = pages.length - 1;
    const penultimatePage = pages.length - 2;

    const isUltimatePage = currentPageIndex === ultimatePage;
    const isPenultimatePage = currentPageIndex === penultimatePage;

    return !(
      isUltimatePage ||
      (isPenultimatePage &&
        pageCount === 2 &&
        isCenterfoldsComing(penultimatePage))
    );
  };

  const handleTurnPage = (polarity) => {
    const pageViewerElement = document.querySelector('.PageViewer');

    pageViewerElement.scrollLeft = 0;
    pageViewerElement.scrollTop = 0;
    const {
      centerfolds,
      currentPageIndex,
      openedComic,
      pageCount,
      pages,
    } = state;
    if (openedComic.name.length > 0) {
      const [newPageIndex, pagesToDisplay] = turnPage({
        currentPageIndex,
        centerfolds,
        pageCount,
        pages,
        polarity,
      });
      setCurrentPages(newPageIndex, pagesToDisplay, state);
    }
  };

  const turnPageLeft = () => {
    const polarity = -1;
    if (shouldPageTurnLeft()) {
      handleTurnPage(polarity);
    }
  };

  const turnPageRight = () => {
    const polarity = 1;
    if (shouldPageTurnRight()) {
      handleTurnPage(polarity);
    }
  };

  const arrowKeyTurnPage = (code) => {
    switch (code) {
      case 'ArrowRight':
        turnPageRight();
        break;
      case 'ArrowLeft':
        turnPageLeft();
        break;
      default:
        break;
    }
  };

  // Library Functions
  const setContentToState = (content) => {
    const newContent = copyDeepObject(content);
    newContent.id = 'libraryRoot';
    setState({ content: newContent });
  };

  const updateContent = generateNestedContentFromFilepath(setContentToState);

  const updateRoot = ([filepath]) => {
    if (filepath) {
      updateContent(filepath);
    }
  };

  const openDirectory = () => {
    const properties = ['openDirectory'];
    dialog.showOpenDialog({ properties }, updateRoot);
  };

  const setParentAsLibrary = () => {
    const {
      content: { dirname },
    } = state;
    updateContent(dirname || '');
  };

  const onContentClick = ({ fullpath, isDirectory }) => {
    if (isDirectory) {
      updateContent(fullpath);
    } else {
      openComic(fullpath);
    }
  };

  const handleKeyDown = (e) => {
    const { openedComic } = state;
    const isComicActive = openedComic.name !== null;
    const isActiveElemInput = document.activeElement.tagName === 'input';

    const shouldTurn = isComicActive && !isActiveElemInput;

    if (shouldTurn) {
      arrowKeyTurnPage(e.code);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.encodedPages]);

  // Component Render
  return (
    <Context.Provider
      value={{
        changePageCount,
        onContentClick,
        openAdjacentComic,
        openComic,
        openDirectory,
        setParentAsLibrary,
        setState,
        state,
        throwError,
        turnPageLeft,
        turnPageRight,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { ConnectContext };
export default Context;
