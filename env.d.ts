/* eslint-disable import/no-default-export */

declare module '*.svg' {
  const Component: (props: import('react').SVGProps<SVGSVGElement>) => JSX.Element
  export default Component
}

declare module 'react-datetime-picker/dist/entry.nostyle' {
  export { default } from 'react-datetime-picker'
  export * from 'react-datetime-picker'
}

declare namespace NodeJS {
  declare interface ProcessEnv {
    readonly APP_VERSION: string

    readonly NEXT_PUBLIC_CW721_BASE_CODE_ID: string

    readonly NEXT_PUBLIC_API_URL: string
    readonly NEXT_PUBLIC_BLOCK_EXPLORER_URL: string
    readonly NEXT_PUBLIC_NETWORK: string
    readonly NEXT_PUBLIC_WEBSITE_URL: string

    readonly NEXT_PUBLIC_S3_BUCKET: string
    readonly NEXT_PUBLIC_S3_ENDPOINT: string
    readonly NEXT_PUBLIC_S3_KEY: string
    readonly NEXT_PUBLIC_S3_REGION: string
    readonly NEXT_PUBLIC_S3_SECRET: string
  }
}

type KeplrWindow = import('@keplr-wallet/types/src/window').Window

declare interface Window extends KeplrWindow {
  confetti?: (obj: any) => void
}

declare const __DEV__: boolean
declare const __PROD__: boolean

/* eslint-enable import/no-default-export */
