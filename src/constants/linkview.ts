import { context } from '../context.ts';

interface LinkFormatCollection {
  editorInteractionAnalyser: LinkFormat;
  interactionTimeline: LinkFormat;
  checkUserWikiSearch: LinkFormat;
  SPITools: {
    timecard: LinkFormat;
    consolidatedTimeline: LinkFormat;
    pages: LinkFormat;
  };
  sandals: {
    timecard: LinkFormat;
    consolidatedTimeline: LinkFormat;
    pages: LinkFormat;
    summaries: LinkFormat;
  };
}

export interface LinkFormat {
  baseUrl: URL;
  startingParams?: URLSearchParams;
  userQueryStringKey: string;
  userQueryStringSeparator: string;
  userQueryStringWrapper: string;
  // Whether we repeat userQueryStringKey for every new user. I.e. &users=user1&users=user2
  multipleUserQueryStringKeys: boolean;
}

export const spiHelperLinkViewURLFormats: LinkFormatCollection = {
  editorInteractionAnalyser: {
    baseUrl: new URL('https://sigma.toolforge.org/editorinteract.py'),
    userQueryStringKey: 'users',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
  },
  interactionTimeline: {
    baseUrl: new URL('https://interaction-timeline.toolforge.org'),
    startingParams: new URLSearchParams('wiki=enwiki'),
    userQueryStringKey: 'user',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
  },
  SPITools: {
    timecard: {
      baseUrl: new URL('https://spi-tools.toolforge.org/spi/timecard/' + context.caseName),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '&',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: true,
    },
    consolidatedTimeline: {
      baseUrl: new URL('https://spi-tools.toolforge.org/spi/timeline/' + context.caseName),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '&',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: true,
    },
    pages: {
      baseUrl: new URL('https://spi-tools.toolforge.org/spi/pages/' + context.caseName),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '&',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: true,
    },
  },
  sandals: {
    timecard: {
      baseUrl: new URL('https://sandals.toolforge.org/timecard'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
    consolidatedTimeline: {
      baseUrl: new URL('https://sandals.toolforge.org/timeline'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
    pages: {
      baseUrl: new URL('https://sandals.toolforge.org/pages'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
    summaries: {
      baseUrl: new URL('https://sandals.toolforge.org/summaries'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
  },
  checkUserWikiSearch: {
    baseUrl: new URL('https://checkuser.wikimedia.org/w/index.php'),
    startingParams: new URLSearchParams('ns0=1'),
    userQueryStringKey: 'search',
    userQueryStringSeparator: ' OR ',
    userQueryStringWrapper: '"',
    multipleUserQueryStringKeys: false,
  },
};
