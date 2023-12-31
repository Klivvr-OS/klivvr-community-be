function env(name: string, required?: boolean): string;
function env(name: string, required: boolean): string | undefined;
function env(name: string, required = true): string | undefined {
  const envVar = process.env[name];
  if (required && envVar === undefined) {
    console.error(`Environement variable "${name}" is required but not set.`);
    process.exit(1);
  }
  return envVar;
}

export default env;
