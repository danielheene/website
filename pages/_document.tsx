import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { extractCritical } from '@emotion/server';
import { EasterEggo } from '@components/EasterEggo';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document?.getInitialProps?.(ctx);
    const critical = extractCritical(initialProps.html);
    initialProps.html = critical.html;
    initialProps.styles = (
      <React.Fragment>
        {initialProps.styles}
        <style
          data-emotion-css={critical.ids.join(' ')}
          dangerouslySetInnerHTML={{ __html: critical.css }}
        />
      </React.Fragment>
    );

    return initialProps;
  }

  render() {
    return (
      <Html lang='en'>
        <Head>
          <link rel='icon' type='image/png' href='/favicon.png' />
        </Head>
        <body>
          <Main />
          <NextScript />
          <EasterEggo
            audioPath='/eggls/toasty.mp3'
            imagePath='/eggls/toasty.webp'
          />
        </body>
      </Html>
    );
  }
}
