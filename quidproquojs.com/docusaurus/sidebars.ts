import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    'getting-started',
    'core-concepts',
    'use-cases',
    'architecture-overview',
  ],
  
  apiSidebar: [
    'api/index',
    {
      type: 'category',
      label: 'Actions',
      items: [
        'api/actions/claude-ai',
        'api/actions/config',
        'api/actions/context',
        'api/actions/date',
        'api/actions/error',
        'api/actions/event',
        'api/actions/eventbus',
        'api/actions/file',
        'api/actions/graph-database',
        'api/actions/guid',
        'api/actions/key-value-store',
        'api/actions/log',
        'api/actions/math',
        'api/actions/network',
        'api/actions/platform',
        'api/actions/queue',
        'api/actions/state',
        'api/actions/system',
        'api/actions/user-directory',
      ],
    },
  ],
};

export default sidebars;