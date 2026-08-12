// Shapes for the api.ts stubs the action suites install with mock.module. The mock
// functions themselves stay local to each test file - mock.module replaces a module
// process-wide for the rest of the run, so sharing mock instances would leak call
// history and implementations between files.

export interface EditPageOpts { title: string; newText: string; summary?: string }
