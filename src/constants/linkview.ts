interface LinkFormatCollection {
  editorInteractionAnalyser: LinkFormat;
  interactionTimeline: LinkFormat;
  checkUserWikiSearch: LinkFormat;
  interleaved: LinkFormat;
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
  baseUrl: (caseName: string) => URL;
  startingParams?: URLSearchParams;
  userQueryStringKey: string;
  userQueryStringSeparator: string;
  userQueryStringWrapper: string;
  // Whether we repeat userQueryStringKey for every new user. I.e. &users=user1&users=user2
  multipleUserQueryStringKeys: boolean;
}

export const spiHelperLinkViewURLFormats: LinkFormatCollection = {
  editorInteractionAnalyser: {
    baseUrl: (_caseName: string) => new URL('https://sigma.toolforge.org/editorinteract.py'),
    userQueryStringKey: 'users',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
  },
  interactionTimeline: {
    baseUrl: (_caseName: string) => new URL('https://interaction-timeline.toolforge.org'),
    startingParams: new URLSearchParams('wiki=enwiki'),
    userQueryStringKey: 'user',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
  },
  SPITools: {
    timecard: {
      baseUrl: (caseName: string) => new URL('https://spi-tools.toolforge.org/spi/timecard/' + caseName),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '&',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: true,
    },
    consolidatedTimeline: {
      baseUrl: (caseName: string) => new URL('https://spi-tools.toolforge.org/spi/timeline/' + caseName),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '&',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: true,
    },
    pages: {
      baseUrl: (caseName: string) => new URL('https://spi-tools.toolforge.org/spi/pages/' + caseName),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '&',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: true,
    },
  },
  sandals: {
    timecard: {
      baseUrl: (_caseName: string) => new URL('https://sandals.toolforge.org/timecard'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
    consolidatedTimeline: {
      baseUrl: (_caseName: string) => new URL('https://sandals.toolforge.org/contributions'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
    pages: {
      baseUrl: (_caseName: string) => new URL('https://sandals.toolforge.org/pages'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
    summaries: {
      baseUrl: (_caseName: string) => new URL('https://sandals.toolforge.org/summaries'),
      userQueryStringKey: 'users',
      userQueryStringSeparator: '|',
      userQueryStringWrapper: '',
      multipleUserQueryStringKeys: false,
    },
  },
  checkUserWikiSearch: {
    baseUrl: (_caseName: string) => new URL('https://checkuser.wikimedia.org/w/index.php'),
    startingParams: new URLSearchParams('ns0=1'),
    userQueryStringKey: 'search',
    userQueryStringSeparator: ' OR ',
    userQueryStringWrapper: '"',
    multipleUserQueryStringKeys: false,
  },
  interleaved: {
    baseUrl: (_caseName: string) => new URL('https://interleaved.toolforge.org/'),
    userQueryStringKey: 'user',
    userQueryStringSeparator: '|',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: false,
  },
};
