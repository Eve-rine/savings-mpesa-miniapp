const { seedInitialData } = require('./services/api');

App({
  onLaunch(options) {
    // Page opens for the first time
    console.info('App onLaunch');
    seedInitialData()
    .then(() => {
      console.log('App initialized with data');
    })
    .catch(error => {
      console.error('Error initializing app:', error);
    });
  },
  onShow(options) {
    // Reopened by scheme from the background
  },
  globalData: {
    theme: 'dark'
  }
});
