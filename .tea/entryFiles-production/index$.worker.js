if(!self.__appxInited) {
self.__appxInited = 1;
require('@alipay/appx-compiler/lib/sjsEnvInit');

require('./config$');
require('./importScripts$');

var AFAppX = self.AFAppX;
self.getCurrentPages = AFAppX.getCurrentPages;
self.getApp = AFAppX.getApp;
self.Page = AFAppX.Page;
self.App = AFAppX.App;
self.my = AFAppX.bridge || AFAppX.abridge;
self.abridge = self.my;
self.Component = AFAppX.WorkerComponent || function(){};
self.$global = AFAppX.$global;
self.requirePlugin = AFAppX.requirePlugin;


if(AFAppX.registerApp) {
  AFAppX.registerApp({
    appJSON: appXAppJson,
  });
}

if(AFAppX.compilerConfig){ AFAppX.compilerConfig.component2 = true; }

function success() {
require('../../app');
require('../../node_modules/antd-mini/es/Loading/index?hash=05d2a9730dd6009bf9446182f9c985f40f8c0f43');
require('../../node_modules/antd-mini/es/Icon/index?hash=05d2a9730dd6009bf9446182f9c985f40f8c0f43');
require('../../node_modules/antd-mini/es/Button/index?hash=19ce9f67101419dba449818e100154044fb178ab');
require('../../pages/index/index?hash=b00aab65a00d3026494dfea3afeb4034ce403eb1');
require('../../pages/createGoal/createGoal?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/error/error?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/strategies/strategies?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/goalDetail/goalDetail?hash=94f6ae6798859cdc832e022272ca397573322e90');
require('../../pages/motivation/motivation?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}