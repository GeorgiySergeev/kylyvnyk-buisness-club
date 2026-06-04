// src/pages/_document.tsx
// BLOCK: Custom Next Document (legacy pages dir). Controls server-rendered document shell. Do NOT add runtime dev-only scripts here.
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
