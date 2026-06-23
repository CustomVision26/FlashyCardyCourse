import Foundation
import Capacitor
import UIKit

/// Opens URLs in the device default browser (Safari) for OAuth flows.
/// iOS counterpart of android/.../ExternalBrowserPlugin.java
///
/// After running `npx cap add ios` on a Mac, copy this file into
/// `ios/App/App/` and add it to the App target in Xcode. With Capacitor's
/// `CAPBridgedPlugin` protocol no Objective-C (.m) bridge file is required.
@objc(ExternalBrowserPlugin)
public class ExternalBrowserPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ExternalBrowserPlugin"
    public let jsName = "ExternalBrowser"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)
    ]

    @objc func open(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), !urlString.isEmpty,
              let url = URL(string: urlString) else {
            call.reject("URL is required")
            return
        }

        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { success in
                if success {
                    call.resolve()
                } else {
                    call.reject("Could not open browser")
                }
            }
        }
    }
}
