- Migrate main interface to Codex
  - Instead of constantly refetching page and section content, on a save check if there's an edit we didn't make and if so confirm() we want to proceed
  - Make switching layouts smoother
  - Instead of removing spiHelperTopViewHTML to replace with spiHelperActionViewHTML all the time, keep it as hidden. Avoids regenerating the layout every time.
  - Look into making it prettier via animations and whatnot
  - Merge 'close' into 'change status'
- Remove \<b> from spihelper-errortext and move it to CSS
- Add mw.track()?
- In caseActions.ts, instead of fetching the HTML values, save our changes ourselves through on('change'). Probably in state.
  - What did I even mean by this?
- Standardise HTML and CSS naming

Generic:
- Split HTML building into views.ts or views/foo.ts
- Don't keep big HTML blocks as raw template strings
- Implement Dbeef's updater
- Implement unit tests?
- Make practical test gauntlet on testwiki

Backburner:
- Migrate to formatversion 2

Required tests:
- Single:
  - Archive case
  - One click archive case
  - Close case
- Combined:
  - Change case status
  - Block/tag socks
  - Sock links
  - Comment
- Edge cases:
  - Moving from/to protected page
  - Archive that overflows max expand size
  - Nonexistant archivenotice