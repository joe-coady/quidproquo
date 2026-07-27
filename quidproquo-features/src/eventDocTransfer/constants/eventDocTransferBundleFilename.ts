// Download name for an exported bundle: readable, sortable, and safe on every OS. A single doc is
// named after its code (`template-invoice-2026-07-27T....json`), which is the useful part; a
// multi-doc export names the collection and how many roots went in, because no one code represents
// it. Slugged so a code with spaces or slashes cannot produce an unusable filename.
const slug = (value: string): string => value.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'doc';

export const eventDocTransferBundleFilename = (type: string, code: string, exportedAt: string, rootCount = 1): string => {
  const subject = rootCount > 1 ? `${rootCount}-docs` : slug(code);

  return `${slug(type)}-${subject}-${slug(exportedAt)}.json`;
};
