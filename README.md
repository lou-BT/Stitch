# stitch

stitch is a desktop app to store and visualize sewing patterns. 
Eventually, a fabric stash inventory section will be added.
It's a work in progress.

The project is built with Angular and Electron.

## Installation

1. Clone the repository:
   ```bash
   git clone https://gitlab.com/lou.bt5/stitch.git
   ```
2. Navigate to the project directory:
   ```bash
   cd stitch
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Set the link to the folder that will contain the patterns in main.js (l.4)
   ```bash
   const patternFolderPath = 'full path here';
   ```

5. To start the application, run:
   ```bash
   npm run electron
   ```

6. To start the application in dev mode, run:
   ```bash
   npm run electron:dev
   ```

## Visuals

![Project Screenshot](https://gitlab.com/lou.bt5/stitch/-/blob/main/screens/stitchMain.PNG)
(more photos in the 'screens' folder)


## Usage

Adding patterns: 
- set name and category before adding pictures, technical drawings (flats, size chart...) and the pattern files (pattern & instructions)
- clicking on 'add pattern' will create a folder in the main pattern folder, move (copy for now) the selected files to that folder and update the pattern index (stored in a JSON file)
- the name choice is restricted for safety reasons

Patterns display
- displays a list of patterns in cards (first picture, name & category)
- clicking on a pattern/card will open a modal with more details: all pictures, the name, the category, buttons to open each pattern file, a button to delete the pattern and a button to edit the pattern

Pattern edit
- each pattern can be edited: add/remove pictures and files or change the category

## Roadmap

- settings page: set the path to the pattern folder here would make things easier
- replace JSON index with simple DB
- add fabric inventory
- add more details for each pattern (size range, fabric requirements, pattern already tested: yes/no, personal comments...)

## License

[MIT](https://choosealicense.com/licenses/mit/)