# Graph Report - Stitch  (2026-11-24)

## Corpus Check
- 47 files · ~15,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .scss 8, (none) 3, .example 1)

## Summary
- 465 nodes · 764 edges · 42 communities (14 shown, 28 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96c29cf2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- database.js
- PatternEditComponent
- patterns.component.ts
- options
- schematics
- devDependencies
- AddPatternComponent
- PatternsComponent
- dependencies
- package.json
- compilerOptions
- SettingsComponent
- scripts
- ModalsService
- electron
- app.config.ts
- migration.js
- _tmp_recover_runner.js
- electron-settings
- electron-store@^11.0.0
- @fortawesome/fontawesome-svg-core@^6.7.2
- recover-missing-pattern-files.js
- sqlite3@^5.1.7
- zone.js@~0.15.1
- bootstrap
- bootswatch@^5.3.2
- jquery@^3.7.1
- typescript@~5.9.2
- wait-on@^9.0.3
- index.d.ts
- PATTERN_FOLDER_PATH
- jquery-ui@^1.13.2
- mdb-angular-ui-kit
- ngx-electron@^2.2.0
- tslib@^2.3.0
- karma-chrome-launcher@~3.2.0

## God Nodes (most connected - your core abstractions)
1. `PatternEditComponent` - 38 edges
2. `AddPatternComponent` - 37 edges
3. `DataService` - 28 edges
4. `PatternsComponent` - 21 edges
5. `@angular/core` - 19 edges
6. `PatternDetailsComponent` - 19 edges
7. `Pattern` - 18 edges
8. `Category` - 18 edges
9. `SettingsComponent` - 14 edges
10. `SharedFile` - 13 edges

## Surprising Connections (you probably didn't know these)
- `AddPatternComponent` --references--> `Category`  [EXTRACTED]
  src/app/add-pattern/add-pattern.component.ts → src/app/classes.ts
- `AddPatternComponent` --references--> `NewPattern`  [EXTRACTED]
  src/app/add-pattern/add-pattern.component.ts → src/app/classes.ts
- `AddPatternComponent` --references--> `SharedFile`  [EXTRACTED]
  src/app/add-pattern/add-pattern.component.ts → src/app/classes.ts
- `PatternDetailsComponent` --references--> `Pattern`  [EXTRACTED]
  src/app/pattern-details/pattern-details.component.ts → src/app/classes.ts
- `PatternEditComponent` --references--> `Pattern`  [EXTRACTED]
  src/app/pattern-edit/pattern-edit.component.ts → src/app/classes.ts

## Import Cycles
- None detected.

## Communities (42 total, 28 thin omitted)

### Community 0 - "database.js"
Cohesion: 0.06
Nodes (42): addCategory(), addComment(), addPattern(), Database, db, dbPath, deleteCategory(), deleteComment() (+34 more)

### Community 2 - "patterns.component.ts"
Cohesion: 0.10
Nodes (20): @angular/core@^20.3.2, @angular/cdk, @angular/common, @angular/core, @angular/forms, @fortawesome/angular-fontawesome, @fortawesome/free-regular-svg-icons, @fortawesome/free-solid-svg-icons (+12 more)

### Community 3 - "options"
Cohesion: 0.07
Nodes (35): build, extract-i18n, serve, test, builder, configurations, defaultConfiguration, options (+27 more)

### Community 4 - "schematics"
Cohesion: 0.07
Nodes (28): newProjectRoot, projects, Stitch, $schema, schematics, style, type, type (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (29): devDependencies, @angular/build@^20.3.3, @angular/cli@^20.3.3, @angular/compiler-cli@^20.3.2, concurrently@^9.2.1, cross-env@^10.1.0, @electron/rebuild@^4.0.4, karma@~6.4.0 (+21 more)

### Community 8 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @angular/cdk@^20.2.5, @angular/common@^20.3.2, @angular/compiler@^20.3.2, @angular/forms@^20.3.2, @angular/material@^20.2.5, @angular/platform-browser-dynamic@^20.3.2, bootstrap-icons@^1.13.1 (+18 more)

### Community 9 - "package.json"
Cohesion: 0.13
Nodes (14): @angular/animations@^20.3.2, better-sqlite3@^12.9.0, material-design-icons-iconfont@^6.7.0, jasmine-core@~5.1.0, @types/jasmine@~5.1.0, main, name, private (+6 more)

### Community 10 - "compilerOptions"
Cohesion: 0.18
Nodes (11): ./tsconfig.json, compilerOptions, allowSyntheticDefaultImports, esModuleInterop, module, moduleResolution, resolveJsonModule, extends (+3 more)

### Community 12 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:migrate, electron, electron:dev, ng, start, test (+1 more)

### Community 14 - "electron"
Cohesion: 0.50
Nodes (3): electron@^38.2.0, { ipcRenderer, webUtils, contextBridge }, electron

### Community 15 - "app.config.ts"
Cohesion: 0.24
Nodes (7): @angular/platform-browser@^20.3.2, @angular/router@^20.3.2, @angular/platform-browser, @angular/router, AppComponent, appConfig, routes

### Community 16 - "migration.js"
Cohesion: 0.21
Nodes (10): Database, db, dbPath, ensureMigrationsTable(), fs, getAppliedMigrations(), getMigrationFiles(), migrationsDir (+2 more)

### Community 17 - "_tmp_recover_runner.js"
Cohesion: 0.22
Nodes (9): { DatabaseSync }, db, dbPath, fs, IMAGE_EXTENSIONS, listFiles(), main(), path (+1 more)

### Community 21 - "recover-missing-pattern-files.js"
Cohesion: 0.24
Nodes (9): Database, db, dbPath, fs, IMAGE_EXTENSIONS, listFiles(), main(), path (+1 more)

## Knowledge Gaps
- **2 isolated node(s):** `./tsconfig.json`, `PATTERN_FOLDER_PATH`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 161 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `electron` connect `electron` to `database.js`, `package.json`, `patterns.component.ts`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `./tsconfig.json`, `PATTERN_FOLDER_PATH` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `database.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06265664160401002 - nodes in this community are weakly interconnected._
- **Why does `better-sqlite3` connect `package.json` to `database.js`, `migration.js`, `recover-missing-pattern-files.js`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Should `PatternEditComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.07765151515151515 - nodes in this community are weakly interconnected._
- **Why does `AddPatternComponent` connect `AddPatternComponent` to `patterns.component.ts`, `app.config.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Should `patterns.component.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10034013605442177 - nodes in this community are weakly interconnected._