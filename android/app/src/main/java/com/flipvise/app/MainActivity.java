package com.flipvise.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(ExternalBrowserPlugin.class);
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onPause() {
    super.onPause();
    CookieManager.getInstance().flush();
  }
}
