const { withDangerousMod, withStringsXml } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIpAddress() {
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
  // 1. iOS Podfile Fix (C++ and fmt)
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
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
      return config;
    },
  ]);

  // 2. Android Dev IP Fix
  config = withStringsXml(config, (config) => {
    const ip = getLocalIpAddress();
    config.modResults = {
        ...config.modResults,
        resources: {
            ...config.modResults.resources,
            string: [
                ...(config.modResults.resources.string || []),
                { $: { name: 'react_native_dev_server_ip' }, _: ip }
            ]
        }
    };
    return config;
  });

  return config;
};

module.exports = withStabilization;
