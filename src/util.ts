export const messageLogger = (tag: string, message: unknown): void => {
  console.log(`${tag}::`, message);
};
