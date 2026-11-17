# Graph Report - Stitch  (2026-11-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 430 nodes · 719 edges · 37 communities (11 shown, 26 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ab31364`
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
- @angular/router
- better-sqlite3
- electron-reload@^2.0.0-alpha.1
- electron-settings
- electron-store@^11.0.0
- @fortawesome/fontawesome-svg-core@^6.7.2
- graphifyy@^0.10.0
- @popperjs/core@^2.11.8
- sqlite3@^5.1.7
- zone.js@~0.15.1
- concurrently@^9.2.1
- karma-jasmine@~5.1.0
- @types/jasmine@~5.1.0
- typescript@~5.9.2
- wait-on@^9.0.3
- index.d.ts
- PATTERN_FOLDER_PATH

## God Nodes (most connected - your core abstractions)
1. `PatternEditComponent` - 35 edges
2. `AddPatternComponent` - 34 edges
3. `DataService` - 28 edges
4. `PatternsComponent` - 20 edges
5. `@angular/core` - 19 edges
6. `PatternDetailsComponent` - 18 edges
7. `Pattern` - 18 edges
8. `Category` - 18 edges
9. `SettingsComponent` - 14 edges
10. `SharedFile` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PatternsComponent` --references--> `Category`  [EXTRACTED]
  src/app/patterns/patterns.component.ts → src/app/classes.ts
- `PatternDetailsComponent` --references--> `Category`  [EXTRACTED]
  src/app/pattern-details/pattern-details.component.ts → src/app/classes.ts
- `PatternDetailsComponent` --references--> `Pattern`  [EXTRACTED]
  src/app/pattern-details/pattern-details.component.ts → src/app/classes.ts
- `PatternEditComponent` --references--> `Category`  [EXTRACTED]
  src/app/pattern-edit/pattern-edit.component.ts → src/app/classes.ts
- `PatternEditComponent` --references--> `NewPattern`  [EXTRACTED]
  src/app/pattern-edit/pattern-edit.component.ts → src/app/classes.ts

## Import Cycles
- None detected.

## Communities (37 total, 26 thin omitted)

### Community 0 - "database.js"
Cohesion: 0.05
Nodes (50): addCategory(), addComment(), addPattern(), Database, db, dbPath, deleteCategory(), deleteComment() (+42 more)

### Community 1 - "PatternEditComponent"
Cohesion: 0.06
Nodes (4): Pattern, PatternPartial, PatternEditComponent, DataService

### Community 2 - "patterns.component.ts"
Cohesion: 0.11
Nodes (21): @angular/platform-browser@^20.3.2, @angular/cdk, @angular/common, @angular/core, @angular/forms, @angular/platform-browser, @fortawesome/angular-fontawesome, @fortawesome/free-regular-svg-icons (+13 more)

### Community 3 - "options"
Cohesion: 0.07
Nodes (35): build, extract-i18n, serve, test, builder, configurations, defaultConfiguration, options (+27 more)

### Community 4 - "schematics"
Cohesion: 0.07
Nodes (28): newProjectRoot, projects, Stitch, $schema, schematics, style, type, type (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (29): devDependencies, @angular/build@^20.3.3, @angular/cli@^20.3.3, @angular/compiler-cli@^20.3.2, cross-env@^10.1.0, @electron/rebuild@^4.0.4, jasmine-core@~5.1.0, karma@~6.4.0 (+21 more)

### Community 8 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, @angular/animations@^20.3.2, @angular/cdk@^20.2.5, @angular/common@^20.3.2, @angular/core@^20.3.2, @angular/forms@^20.3.2, @angular/platform-browser-dynamic@^20.3.2, bootstrap@^5.3.3 (+19 more)

### Community 9 - "package.json"
Cohesion: 0.12
Nodes (16): @angular/compiler@^20.3.2, @angular/material@^20.2.5, bootstrap-icons@^1.13.1, jquery-ui@^1.13.2, material-design-icons-iconfont@^6.7.0, ngx-electron@^2.2.0, main, name (+8 more)

### Community 10 - "compilerOptions"
Cohesion: 0.18
Nodes (11): ./tsconfig.json, compilerOptions, allowSyntheticDefaultImports, esModuleInterop, module, moduleResolution, resolveJsonModule, extends (+3 more)

### Community 12 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:migrate, electron, electron:dev, ng, start, test (+1 more)

### Community 14 - "electron"
Cohesion: 0.50
Nodes (3): electron@^38.2.0, { ipcRenderer, webUtils }, electron

## Knowledge Gaps
- **2 isolated node(s):** `./tsconfig.json`, `PATTERN_FOLDER_PATH`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 137 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `better-sqlite3` connect `better-sqlite3` to `database.js`, `package.json`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `./tsconfig.json`, `PATTERN_FOLDER_PATH` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `database.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Why does `@angular/core` connect `patterns.component.ts` to `dependencies`, `package.json`, `ModalsService`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `PatternEditComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.06028368794326241 - nodes in this community are weakly interconnected._
- **Why does `AddPatternComponent` connect `AddPatternComponent` to `patterns.component.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `patterns.component.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1109936575052854 - nodes in this community are weakly interconnected._