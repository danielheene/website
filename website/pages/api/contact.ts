import sgMail from '@sendgrid/mail';
import { get } from 'lodash-es';
import dedent from 'dedent';
import type { NextApiRequest, NextApiResponse } from 'next';

const isProd = process.env.NODE_ENV === 'production';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 *
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, message, email } = isProd ? req.body : req.body || req.query;

  if (isProd && req.method !== 'POST') {
    return res.status(500).json({ status: 'ERROR' });
  }

  const subject = `${name} dropped a message!`;
  const text = dedent`

      ${subject}

      Name: ${name}
      Mail: ${email}

      Message:
      ${message}
    `;

  try {
    await sgMail.send({
      from: {
        name: 'Contact Mailer | Daniel Heene',
        email: 'no-reply@heene.io',
      },
      replyTo: {
        name,
        email,
      },
      to: {
        name: 'Daniel Heene',
        email: 'daniel@heene.io',
      },
      subject,
      text,
      // html,
    });

    return res.status(200).json({ status: 200, success: true, message: 'OK' });
  } catch (error) {
    const message = get(error, 'message', 'Something went wrong');
    return res
      .status(500)
      .json({ status: 500, success: false, message: message });
  }
}
