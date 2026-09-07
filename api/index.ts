import app from '../server.ts';

export default async function handler(req: any, res: any) {
  try {
    // Restore rewritten URL if dispatched through Vercel rewrites
    const matched = req.headers?.['x-matched-path'] || req.headers?.['x-forwarded-uri'];
    if (matched && typeof matched === 'string' && matched.startsWith('/api')) {
      req.url = matched;
    } else if (req.query && req.query['0']) {
      req.url = '/api/' + req.query['0'];
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Serverless Handler Exception:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Serverless Handler Exception',
        message: err?.message || String(err),
      });
    }
  }
}
