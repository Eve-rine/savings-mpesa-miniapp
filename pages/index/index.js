const { fetchGoals } = require('../../services/api');

Page({
  data: {
    goals: [],
    loading: true
  },

  onLoad() {
    this.loadGoals();
  },

  onShow() {
    this.loadGoals();
  },

  onPullDownRefresh() {
    this.loadGoals();
  },

  loadGoals() {
    this.setData({ loading: true });
    
    fetchGoals()
      .then(goals => {
        goals.sort((a, b) => b.percentage - a.percentage);
        
        this.setData({
          goals,
          loading: false
        });
        
        my.stopPullDownRefresh();
      })
      .catch(error => {
        console.error('Error loading goals:', error);
        this.setData({ loading: false });
        my.stopPullDownRefresh();
        
        my.showToast({
          type: 'fail',
          content: 'Failed to load goals',
          duration: 2000
        });
        
        if (error.toString().includes('Network')) {
          my.navigateTo({
            url: '/pages/error/error'
          });
        }
      });
  },
  
  formatCurrency(amount) {
    return amount.toLocaleString('en-KE');
  },
  
  onGoalTap(event) {
    const goalId = event.currentTarget.dataset.id;
    my.navigateTo({
      url: `/pages/goalDetail/goalDetail?id=${goalId}`
    });
  },
  
  onNewGoalTap() {
    my.navigateTo({
      url: '/pages/createGoal/createGoal'
    });
  },
  
  onSearchTap() {
    my.showToast({
      type: 'none',
      content: 'Search feature coming soon',
      duration: 1500
    });
  }
});