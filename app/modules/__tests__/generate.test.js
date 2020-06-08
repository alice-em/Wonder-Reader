import fs from 'fs';
import path from 'path';

import {
  generateCenterfolds,
  generateContent,
  generateContents,
  generateNestedContentFromFilepath,
} from '../generate';

describe('generate', () => {
  describe('generateContent', () => {
    it('returns as expected for file', () => {
      expect(generateContent(__filename)).toEqual({
        basename: 'generate.test.js',
        bookmark: 0,
        contents: [],
        dirname: __dirname,
        extname: '.js',
        fullpath: __filename,
        id: encodeURIComponent(__filename),
        isDirectory: false,
      });
    });

    it('returns as expected for directory', () => {
      expect(generateContent(__dirname)).toEqual({
        basename: '__tests__',
        bookmark: NaN,
        contents: [],
        dirname: path.dirname(__dirname),
        extname: '',
        fullpath: __dirname,
        id: encodeURIComponent(__dirname),
        isDirectory: true,
      });
    });
  });

  describe('generateCenterfolds', () => {
    it('should create an array of valid centerfold images', (done) => {
      const sampleDirectory = path.join(__dirname, 'sampleFiles');
      const createFilepath = file => path.join(sampleDirectory, file);
      const expectedCenterfoldIndex = 2;
      fs.readdir(sampleDirectory, (_, files) => {
        const filepaths = files.map(createFilepath);
        const centerfolds = generateCenterfolds(
          files.map(file => path.join(sampleDirectory, file)),
        );
        expect(centerfolds).toEqual([expectedCenterfoldIndex]);
        expect(filepaths[expectedCenterfoldIndex]).toBe(
          createFilepath('03-sample-centerfold.jpg'),
        );
        done();
      });
    });
  });

  describe('generateContents', () => {
    const sampleDirectory = path.join(__dirname, 'sampleFiles');
    const sampleFilepath = path.join(sampleDirectory, 'sample.txt.cbz');
    const encodedSampleFullpath = encodeURIComponent(sampleFilepath);

    it('should generate content from __dirname/sampleFiles', (done) => {
      const content = generateContent(sampleDirectory);
      generateContents(content, (err, contents) => {
        expect(err).toBe(null);
        expect(contents).toEqual([
          {
            basename: 'sample.txt.cbz',
            bookmark: 0,
            contents: [],
            dirname: sampleDirectory,
            extname: '.cbz',
            fullpath: sampleFilepath,
            id: encodedSampleFullpath,
            isDirectory: false,
          },
        ]);
        done();
      });
    });

    it('should generate an empty object from __dirname/sampleFiles/sample.txt.cbr', (done) => {
      const content = generateContent(sampleFilepath);
      generateContents(content, (err, contents) => {
        expect(err).toBe(null);
        expect(contents).toEqual([]);
        done();
      });
    });

    it('should generate an empty object from an FS error', (done) => {
      const content = generateContent(sampleFilepath);
      content.isDirectory = true;
      generateContents(content, (err, contents) => {
        expect(err).toBe(null);
        expect(contents).toEqual([]);
        done();
      });
    });
  });

  describe('generateNestedContentFromFilepath', () => {
    it('should generate content', (done) => {
      generateNestedContentFromFilepath((content) => {
        expect(content).toEqual({
          basename: '__tests__',
          bookmark: NaN,
          contents: [],
          dirname: path.dirname(__dirname),
          extname: '',
          fullpath: __dirname,
          id: encodeURIComponent(__dirname),
          isDirectory: true,
        });
        done();
      })(__dirname);
    });
  });
});
