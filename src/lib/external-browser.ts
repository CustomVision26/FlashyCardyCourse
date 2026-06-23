import { registerPlugin } from "@capacitor/core";

export interface ExternalBrowserPlugin {
  open(options: { url: string }): Promise<void>;
}

export const ExternalBrowser = registerPlugin<ExternalBrowserPlugin>("ExternalBrowser");
