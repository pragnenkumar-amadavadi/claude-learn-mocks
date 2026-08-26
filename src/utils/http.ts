import type { Response } from 'express';

// Shared by the newer route handlers (status update, notes, applicants) that
// all parse a numeric route param the same way. Sends the 400 itself so
// callers just check for `undefined` and return. `raw` is typed to match
// Express's ParamsDictionary values (string | string[] | undefined).
export function parseIdParam(raw: string | string[] | undefined, res: Response, label: string): number | undefined {
  const id = parseInt(String(raw ?? ''), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: `Invalid ${label} id` });
    return undefined;
  }
  return id;
}
