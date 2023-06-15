import Store from 'electron-store';

export interface StoreSchema {
  recentProjects: string[];
}

export const store = new Store<StoreSchema>({
  schema: {
    recentProjects: {
      type: 'array',
      default: [],
    },
  },
});
