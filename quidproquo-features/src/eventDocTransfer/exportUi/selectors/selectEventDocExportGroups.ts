import { EventDocManifestGroup } from '../../models';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

// The DEPENDENCIES grouped by doc type, for the dialog's "content: a, b, c / style: x, y" list. The
// docs the operator picked (depth 0) are dropped: they are listed separately by
// selectEventDocExportRoots, and repeating them as their own dependencies reads as noise. Type order
// follows first appearance, which is the walk's own breadth-first order.
export const selectEventDocExportGroups = (state: EventDocExportUiState): EventDocManifestGroup[] => {
  const dependencies = state.items.filter((item) => item.depth > 0);

  return dependencies.reduce<EventDocManifestGroup[]>((groups, item) => {
    const group = groups.find((candidate) => candidate.type === item.type);

    if (!group) {
      return [...groups, { type: item.type, items: [item] }];
    }

    group.items.push(item);

    return groups;
  }, []);
};
