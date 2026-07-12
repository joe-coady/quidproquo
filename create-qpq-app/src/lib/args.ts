// Flag parsing over the command's argv (everything after the command name).
export const getArgValue = (argv: string[], flag: string): string | undefined => {
  const eq = argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(`${flag}=`.length);
  const idx = argv.indexOf(flag);
  return idx >= 0 ? argv[idx + 1] : undefined;
};

// Positional args = non-flag args, skipping values consumed by known flags.
export const getPositionalArgs = (argv: string[], valueFlags: string[]): string[] =>
  argv.filter((arg, index) => {
    if (arg.startsWith('--')) return false;
    const previous = argv[index - 1];
    return !(previous && valueFlags.includes(previous));
  });
