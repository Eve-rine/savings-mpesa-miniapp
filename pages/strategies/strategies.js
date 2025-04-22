Page({
  data: {
    activeTab: 'tips'
  },

  onTabChange(event) {
    const tab = event.currentTarget.dataset.tab;
    
    this.setData({
      activeTab: tab
    });
    
    if (tab === 'goals') {
      my.navigateTo({
        url: '/pages/index/index'
      });
    } else if (tab === 'settings') {
      my.showToast({
        type: 'none',
        content: 'Settings coming soon',
        duration: 1500
      });
    }
  },
  
  onSetupAutomaticTap() {
    my.showToast({
      type: 'none',
      content: 'Automatic savings feature coming soon',
      duration: 1500
    });
  },
  
  onTrackExpensesTap() {
    my.showToast({
      type: 'none',
      content: 'Expense tracking feature coming soon',
      duration: 1500
    });
  },
  
  onExtraIncomeTap() {
    my.showToast({
      type: 'none',
      content: 'Income ideas feature coming soon',
      duration: 1500
    });
  },

  onBack() {
    my.navigateBack();
  }
});
