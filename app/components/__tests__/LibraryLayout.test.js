import Adapter from 'enzyme-adapter-react-16';
import electron from 'electron';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import LibraryLayout from '../LibraryLayout';

const {
  generateNestedContentFromFilepath,
} = require('../../modules/generate.js');

jest.mock('electron', () => ({
  remote: {
    dialog: { showOpenDialog: jest.fn() },
  },
}));
jest.mock('../../modules/generate.js', () => ({
  generateNestedContentFromFilepath: jest.fn(),
}));

Enzyme.configure({ adapter: new Adapter() });

const props = {
  closeLibrary: jest.fn(),
  openComic: jest.fn(),
  root: '.',
  saveContentDataToParent: jest.fn(),
  updateRoot: jest.fn(),
};

const sampleContent = {
  basename: '',
  bookmark: '',
  contents: [],
  dirname: '',
  fullpath: null,
  id: 'libraryRoot',
  isDirectory: true,
  root: '',
};

describe('LibraryLayout', () => {
  it('should render', () => {
    const wrapper = shallow(<LibraryLayout {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  describe('Class Functions', () => {
    describe('openDirectory', () => {
      it('should show dialog', () => {
        const wrapper = new LibraryLayout(props);
        wrapper.openDirectory();
        expect(electron.remote.dialog.showOpenDialog).toHaveBeenCalledWith(
          { properties: ['openDirectory'] },
          wrapper.updateRoot,
        );
      });
    });

    describe('saveContentDataToParent', () => {
      it('should set content data to state', (done) => {
        const wrapper = new LibraryLayout(props);
        wrapper.setState = jest.fn();
        wrapper.saveContentDataToParent(sampleContent);
        expect(wrapper.setState).toHaveBeenCalledWith(sampleContent);
        done();
      });
    });

    describe('saveContentsDataToParent', () => {
      it('should set new contents data to state', (done) => {
        const wrapper = new LibraryLayout(props);
        wrapper.setState = jest.fn();
        wrapper.saveContentsDataToParent([sampleContent]);
        expect(wrapper.setState).toHaveBeenCalledWith({
          contents: { ...sampleContent, contents: [sampleContent] },
        });
        done();
      });
    });

    describe('setContentToState', () => {
      it('sets state to content argument', (done) => {
        const wrapper = new LibraryLayout(props);
        wrapper.setState = jest.fn();
        wrapper.setContentToState(sampleContent);
        expect(wrapper.setState).toHaveBeenCalledWith(sampleContent);
        done();
      });
    });

    describe('setParentAsLibrary', () => {
      it('sets state based on dirname state', (done) => {
        const wrapper = new LibraryLayout(props);
        wrapper.setParentAsLibrary();
        expect(wrapper.state).toEqual(sampleContent);
        done();
      });
    });
  });

  it('should generateNestedContent and set that data to state', () => {
    const wrapper = new LibraryLayout(props);
    wrapper.setContentToState = jest.fn();
    wrapper.updateContent('.');
    expect(generateNestedContentFromFilepath).toHaveBeenCalledWith(
      '.',
      wrapper.setContentToState,
    );
  });
});
