const { withDangerousMod, withStringsXml } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIpAddress() {
  // Prioritize environment variable from .env
  if (process.env.LOCAL_IP) {
    return process.env.LOCAL_IP;
  }

  // Fallback to detection logic
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const withStabilization = (config) => {
  const ip = getLocalIpAddress();

  // 1. iOS Podfile and AppDelegate Fix
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = path.join(config.modRequest.projectRoot, 'ios');

      // Podfile Fix
      const podfilePath = path.join(iosRoot, 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let content = fs.readFileSync(podfilePath, 'utf8');
        if (!content.includes("target.name == 'fmt'")) {
          const hook = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if target.name == 'fmt'
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        else
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'gnu++20'
        end
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
      end
    end`;
          content = content.replace(/post_install do \|installer\|/, `post_install do |installer|\n${hook}`);
          fs.writeFileSync(podfilePath, content);
        }
      }

      // AppDelegate Fix (Inject detected/env IP)
      const appDelegatePath = path.join(iosRoot, config.modRequest.projectName, 'AppDelegate.swift');
      if (fs.existsSync(appDelegatePath)) {
        let appDelegate = fs.readFileSync(appDelegatePath, 'utf8');
        const bundleUrlLine = `return URL(string: "http://${ip}:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true")`;

        // Match standard Expo template or previously hardcoded URL
        const pattern = /return (RCTBundleURLProvider|URL\(string: "http:\/\/.*:8081.*"\)).*/;
        if (appDelegate.includes('bundleURL()')) {
            appDelegate = appDelegate.replace(
                /override func bundleURL\(\) -> URL\? \{[\s\S]*?#if DEBUG([\s\S]*?)#else/,
                "override func bundleURL() -> URL? {\n#if DEBUG\n    " + bundleUrlLine + "\n#else"
            );
            fs.writeFileSync(appDelegatePath, appDelegate);
        }
      }

      return config;
    },
  ]);

  // 2. Android Dev IP Fix
  config = withStringsXml(config, (config) => {
    // Remove existing if present to avoid duplicates
    config.modResults.resources.string = (config.modResults.resources.string || []).filter(
        s => s.$.name !== 'react_native_dev_server_ip'
    );

    config.modResults.resources.string.push({
        $: { name: 'react_native_dev_server_ip', translatable: 'false' },
        _: ip
    });

    return config;
  });

  return config;
};

module.exports = withStabilization;
