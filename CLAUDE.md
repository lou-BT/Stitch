# Project Guidelines for Claude Code

## 1. Project Overview
- This project is a windows app using electron and angular
- It is linked to a local database with sqlite3
- It can access/create local folders and copy documents in newly created folders
- Concretely, it is a pattern librairy: patterns are uploaded, a subfolder is created for it in the main pattern folder, the data is copied into it and the record is added to the database.

## 2. Key Directory Structure
- `/src` : Angular APP
- `/src/app/app.config.ts` : Angular app routes definitions.
- `/src/app/classes.ts` : Typescript types/classes/interfaces used by the Angular application
- `/src/app/services/data.service.ts`: Angular service used to load/create/update data stored localy (Database and pattern folder)
- `/.env` (`PATTERN_FOLDER_PATH`): path to the pattern folder, read by `main.js` on startup (hard-coded fallback in `main.js` if not set)
- `/config.json`: pattern folder path for `loadConfig()` / `updateConfig()` in `main.js`, which are currently not called — not read at startup
- `/main.js`: main file where electron is configured, the angular data service is translated into real actions (folder interaction and database update) via ipcmain from the electron librairy
- `database`: folder with database definition and migration system

## 3. Core Commands
- **New database migration**: `db:migrate`
- **Build electron app** : `electron`
- **Start dev electron app**: `electron:dev`
- **Serve angular app**: `start`
- **Build angular app**: `build`

##  4. Coding style gidelines
- Variable names must follow camelCase.
- Angular elements must use style defined in `src\styles.scss`, if a new style is neaded (e.g. new type of component), create a new class in central styles.scss file. Small details that are unique to a page can be defined in the component's own style file.
- In the Angukar app avoid 'any' types, use types in `/src/app/classes.ts` and if a new one or a modification is needed, ask the programmer about it first

## 5. Installed Tools
- **Node.js**: v22.14.0
- **npm**: 10.9.2
- **Angular CLI**: 20.3.13 (invoke via `ng` or `npx ng`)
- **git**: 2.49.0
- **Electron**: ^38.2.0 (devDependency)
- **TypeScript**: ~5.9.2
- **Database**: `better-sqlite3` (runtime) and `sqlite3` (used by the migration scripts in `/database`)
- **Test runner**: Karma + Jasmine (`npm test` / `ng test`)
- **UI**: Angular Material, Bootstrap 5 + Bootswatch, MDB Angular UI Kit, Font Awesome
- **VS Code recommended extension**: `angular.ng-template` (Angular Language Service)
- **VS Code tasks**: `npm: start` (ng serve, background) and `npm: test` (ng test, background) - see `.vscode/tasks.json`