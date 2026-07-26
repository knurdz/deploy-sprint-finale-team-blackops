/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL?: string;
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
  readonly VITE_FEATURE_SHOW_INSIGHTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
