- Create helper function for logging with a parameter for errors
- Determine whether we also want to skip tagging temporary accounts
- Implement unit tests?
- Determine which async calls should be awaited and which can be let to run
- Remove redundant JSDoc
- Use proper API typing
- Split off spihelper.ts to different files
- Use helper like below:
function mustQuery<T extends HTMLElement = HTMLElement>(selector: string): JQuery<T> {
  const $el = $(selector);
  if ($el.length === 0) {
  throw new Error(`Element not found: ${selector}`);
  }
  return $el as JQuery<T>;
}
- Cleanup the for (const likelyUser of likelyUsers) stuff
- Reduce amount of globals
- Decide whether I want sectionId to be a number or a string
- Merge spiHelperGetPageRev into spiHelperGetPageText?
- Cleanup spiHelperGetAPI and new mw.Api()