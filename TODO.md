- Instead of constantly refetching page and section content, on a save check if there's an edit we didn't make and if so confirm() we want to proceed
- Make switching layouts smoother
- Instead of removing spiHelperTopViewHTML to replace with spiHelperActionViewHTML all the time, keep it as hidden. Avoids regenerating the layout every time.
- Look into making it prettier via animations and whatnot
- Choose if we want to redefine context (status quo) or freeze it. Probably the latter. move.ts L62
- Change spiHelperWikiBlockUser to opt with object
- Split HTML building into views.ts or views/foo.ts
- Remove \<b> from spihelper-errortext and move it to CSS
- Remove the (clerk only) messages
- Mention moving categories from spihelper move/merge full case
- Add mw.track()?
- In caseActions.ts, instead of fetching the HTML values, save our changes ourselves through on('change'). Probably in state.
- Migrate to formatversion 2
- Standardise HTML and CSS naming
- Move 'clerk note: originally filed under this user' to 'clerk, CU, and patrolling admin comments'

Generic:
- Don't keep big HTML blocks as raw template strings
- Implement Dbeef's updater
- Implement unit tests?
- Make practical test gauntlet on testwiki


All sections selection not working

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