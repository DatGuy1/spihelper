// Regex to match the case status, group 1 is the actual status
export const spiHelperCaseStatusRegex = /{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i;
// Regex to match closed case statuses (close or closed)
export const spiHelperCaseClosedRegex = /^closed?$/i;

export const spiHelperClerkStatusRegex = /{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu)?endorse|inprogress|decline(?:-ip)?|moreinfo|relisted|onhold)}}/i;

export const spiHelperSockSectionWithNewlineRegex = /====\s*Suspected sockpuppets\s*====\n*/i;

export const spiHelperAdminSectionWithPrecedingNewlinesRegex = /\n*\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i;

export const spiHelperCUBlockRegex = /{{(checkuserblock(-account|-wide)?|checkuser block)}}/i;

export const spiHelperArchiveNoticeRegex = /{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i;

export const spiHelperPriorCasesRegex = /{{spipriorcases}}/i;

export const spiHelperSectionRegex = /^(?:===[^=]*===|=====[^=]*=====)\s*$/m;

// regex to remove hidden characters from form inputs - they mess up some things,
// especially mw.util.isIP
export const spiHelperHiddenCharNormRegex = /\u200E/g;
