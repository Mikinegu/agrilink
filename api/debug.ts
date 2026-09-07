export default async function handler(req: any, res: any) {
  const result: any = {
    step: 'started',
    nodeVersion: process.version,
    cwd: process.cwd(),
    envKeys: Object.keys(process.env).filter((k) => !k.toLowerCase().includes('key') && !k.toLowerCase().includes('secret')),
  };

  try {
    result.step = 'importing server.ts';
    const serverModule = await import('../server.ts');
    result.step = 'server.ts imported successfully';
    result.hasApp = Boolean(serverModule.app || serverModule.default);
  } catch (err: any) {
    result.step = 'import failed';
    result.error = {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
    };
  }

  return res.status(200).json(result);
}
