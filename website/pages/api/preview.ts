import type { NextApiRequest, NextApiResponse } from 'next';
import Sanity, { pathFromIdQuery } from '@lib/sanity';
import { log } from 'next-axiom';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = req.query.id as string;

  if (req.query.disable === '1') {
    log.info('leaving preview mode');
    return res.clearPreviewData().status(200).json({ message: 'OK' });
  }

  if (req.query.secret !== process.env.PREVIEW_TOKEN) {
    log.error('invalid preview mode token');
    return res.status(401).json({ message: 'invalid token' });
  }

  try {
    const urlPath = await Sanity.getClient().fetch(pathFromIdQuery, { id });
    if (!urlPath) log.error('could not find url for given id');
    const { href } = new URL(urlPath, process.env.SITE_URL);
    if (!href) log.error('resolved url is not a valid');

    log.info('entering preview mode', { href });
    return res.setPreviewData(null).redirect(href);
  } catch (error) {
    log.error(error);
  }

  log.error('error while entering preview mode');
  return res.status(401).json({ message: 'error' });
}
