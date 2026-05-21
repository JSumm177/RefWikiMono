const { withDangerousMod, withStringsXml } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIpAddress() {
  if (process.env.LOCAL_IP) {
    return process.env.LOCAL_IP;
  }
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

  // 0. Update ip.js (outside of dangerous mod because it's a shared JS file)
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const ipJsPath = path.join(projectRoot, 'utils', 'ip.js');
      if (fs.existsSync(ipJsPath)) {
        fs.writeFileSync(ipJsPath, `export const LOCAL_IP = '${ip}';\n`);
      }
      return config;
    }
  ]);

  // 1. iOS Podfile and AppDelegate Fix
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = path.join(config.modRequest.projectRoot, 'ios');

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
        config.build_settings['SDKROOT'] = 'iphonesimulator'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
      end
    end`;
          content = content.replace(/post_install do \|installer\|/, `post_install do |installer|\n${hook}`);
          fs.writeFileSync(podfilePath, content);
        }
      }

      const appDelegatePath = path.join(iosRoot, config.modRequest.projectName, 'AppDelegate.swift');
      if (fs.existsSync(appDelegatePath)) {
        let appDelegate = fs.readFileSync(appDelegatePath, 'utf8');
        const bundleUrlLine = `return URL(string: "http://${ip}:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true")`;

        if (appDelegate.includes('bundleURL()')) {
            // Updated regex to precisely replace the URL string inside #if DEBUG
            appDelegate = appDelegate.replace(
                /(override func bundleURL\(\) -> URL\? \{[\s\S]*?#if DEBUG\s*?)return URL\(string: "http:\/\/.*?:8081\/.*?"\)([\s\S]*?#else)/s,
                "$1" + bundleUrlLine + "$2"
            );
            fs.writeFileSync(appDelegatePath, appDelegate);
        }
      }

      return config;
    },
  ]);

  // 2. Android Dev IP and Gradle Fix
  config = withDangerousMod(config, [
    'android',
    async (config) => {
        const androidRoot = path.join(config.modRequest.projectRoot, 'android');

        // Force Gradle Wrapper to 8.13 to avoid Java 21 compatibility issues
        const gradleWrapperPath = path.join(androidRoot, 'gradle', 'wrapper', 'gradle-wrapper.properties');
        if (fs.existsSync(gradleWrapperPath)) {
            let gradleProps = fs.readFileSync(gradleWrapperPath, 'utf8');
            gradleProps = gradleProps.replace(/gradle-.*-bin\.zip/, 'gradle-8.13-bin.zip');
            fs.writeFileSync(gradleWrapperPath, gradleProps);
        }

        // Force java.home and other properties
        const gradlePropertiesPath = path.join(androidRoot, 'gradle.properties');
        if (fs.existsSync(gradlePropertiesPath)) {
            let gradleProps = fs.readFileSync(gradlePropertiesPath, 'utf8');

            // Set java.home to ensure it uses Java 21
            let javaHome = process.env.JAVA_HOME;
            if (!javaHome) {
                if (os.platform() === 'darwin') {
                    javaHome = `/Users/${os.userInfo().username}/Library/Java/JavaVirtualMachines/openjdk-21.0.2/Contents/Home`;
                } else {
                    // Robust check for linux default java 21 path
                    const linuxPath = '/usr/lib/jvm/java-21-openjdk-amd64';
                    if (fs.existsSync(linuxPath)) {
                        javaHome = linuxPath;
                    } else {
                        // Fallback if not found
                        javaHome = '/usr/lib/jvm/java-21-openjdk';
                    }
                }
            }

            if (gradleProps.includes('org.gradle.java.home')) {
                gradleProps = gradleProps.replace(/^org\.gradle\.java\.home=.*$/m, `org.gradle.java.home=${javaHome}`);
            } else {
                gradleProps += `\norg.gradle.java.home=${javaHome}\n`;
            }

            fs.writeFileSync(gradlePropertiesPath, gradleProps);
        }

        // Force local.properties to have sdk.dir non-destructively
        const localPropsPath = path.join(androidRoot, 'local.properties');
        let sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
        if (!sdkDir) {
            if (os.platform() === 'darwin') {
                sdkDir = `/Users/${os.userInfo().username}/Library/Android/sdk`;
            } else {
                sdkDir = '/opt/android-sdk';
            }
        }

        let localProps = '';
        if (fs.existsSync(localPropsPath)) {
            localProps = fs.readFileSync(localPropsPath, 'utf8');
        }

        if (localProps.includes('sdk.dir')) {
            localProps = localProps.replace(/^sdk\.dir=.*$/m, `sdk.dir=${sdkDir}`);
        } else {
            localProps += `\nsdk.dir=${sdkDir}\n`;
        }
        fs.writeFileSync(localPropsPath, localProps.trim() + '\n');

        return config;
    }
  ]);

  // Handle Android strings.xml via withStringsXml
  config = withStringsXml(config, (config) => {
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
