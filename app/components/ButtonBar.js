import React from 'react';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaBook,
  FaMinusSquareO,
  FaSquareO
} from 'react-icons/lib/fa';

import Button from './HeaderButton';
import Slider from './Slider';
import { buttonStyle, buttonTheme } from './buttonStyle';

const NewButtonBar = ({
  changePageCount,
  openLibrary,
  openPrevComic,
  pageCount,
  setZoomLevel,
  turnPageLeft,
  turnPageRight,
  zoomLevel
}) => (
  <MuiThemeProvider theme={buttonTheme}>
    <div style={buttonStyle}>
      <Slider onChange={setZoomLevel} value={zoomLevel} />
      <Button onClick={openLibrary}>
        <FaBook />
      </Button>
      <Button onClick={changePageCount} rotation={90}>
        {pageCount === 2 ? <FaMinusSquareO /> : <FaSquareO />}
      </Button>
      <Button onClick={openPrevComic}>
        <FaAngleDoubleLeft />
      </Button>
      <Button onClick={turnPageLeft}>
        <FaAngleLeft />
      </Button>
      <Button onClick={turnPageRight}>
        <FaAngleRight />
      </Button>
      <Button onClick={openPrevComic}>
        <FaAngleDoubleRight />
      </Button>
    </div>
  </MuiThemeProvider>
);

NewButtonBar.propTypes = {
  changePageCount: PropTypes.func.isRequired,
  openLibrary: PropTypes.func.isRequired,
  openPrevComic: PropTypes.func.isRequired,
  pageCount: PropTypes.number.isRequired,
  setZoomLevel: PropTypes.func.isRequired,
  turnPageLeft: PropTypes.func.isRequired,
  turnPageRight: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number.isRequired
};

export default NewButtonBar;
