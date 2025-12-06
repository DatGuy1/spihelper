- Create helper function for logging with a parameter for errors
- Determine whether we also want to skip tagging temporary accounts
- Determine which async calls should be awaited and which can be let to run
- Remove redundant JSDoc
- Use proper API typing
- Use helper like below:
function mustQuery<T extends HTMLElement = HTMLElement>(selector: string): JQuery<T> {
  const $el = $(selector);
  if ($el.length === 0) {
  throw new Error(`Element not found: ${selector}`);
  }
  return $el as JQuery<T>;
}
- Decide whether I want sectionId to be a number or a string
- Merge spiHelperGetPageRev into spiHelperGetPageText?
- Replace options.ts with OOJS
- Instead of constantly refetching page and section content, on a save check if there's an edit we didn't make and if so confirm() we want to proceed
- Make switching layouts smoother
- Instead of removing spiHelperTopViewHTML to replace with spiHelperActionViewHTML all the time, keep it as hidden. Avoids regenerating the layout every time.
- Look into making it prettier via animations and whatnot
- Choose if we want to redefine context (status quo) or freeze it. Probably the latter. move.ts L62
- Change spiHelperWikiBlockUser to opt with object

Generic:
- Don't keep big HTML blocks as raw template strings
- Implement Dbeef's updater
- Implement unit tests?
- Make practical test gauntlet on testwiki