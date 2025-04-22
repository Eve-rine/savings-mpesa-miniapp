const { fetchGoalById, addContribution, updateGoal } = require('../../services/api');

Page({
  data: {
    goalId: '',
    goal: null,
    loading: true,
    activities: [],
    // Modal states
    showAddModal: false,
    showWithdrawModal: false,
    addAmount: '',
    withdrawAmount: '',
    withdrawError: ''
  },

  onLoad(query) {
    if (query.id) {
      this.setData({
        goalId: query.id
      });
      this.loadGoalData();
    } else {
      my.showToast({
        type: 'fail',
        content: 'Goal ID not provided',
        duration: 2000
      });
      my.navigateBack();
    }
  },
  
  onShow() {
    // Refresh goal data when returning to this page
    if (this.data.goalId) {
      this.loadGoalData();
    }
  },

  loadGoalData() {
    this.setData({ loading: true });
    
    fetchGoalById(this.data.goalId)
      .then(goal => {
        // Generate some mock activities for display
        const activities = this.generateMockActivities(goal);
        
        this.setData({
          goal,
          activities,
          loading: false
        });
      })
      .catch(error => {
        console.error('Error loading goal:', error);
        this.setData({ loading: false });
        
        my.showToast({
          type: 'fail',
          content: 'Failed to load goal details',
          duration: 2000
        });
        
        // Navigate back on error
        my.navigateBack();
      });
  },
  
  // Mock function to generate some activity data
  generateMockActivities(goal) {
    const activities = [];
    
    // Add a "started goal" activity
    activities.push({
      type: 'add',
      text: `Started goal with KES ${this.formatCurrency(goal.current)}`,
      date: this.formatShortDate(goal.startDate)
    });
    
    // Add some random activities based on the goal amount
    if (goal.current > goal.target * 0.3) {
      const amount = Math.floor(goal.target * 0.15);
      activities.push({
        type: 'add',
        text: `Added KES ${this.formatCurrency(amount)}`,
        date: '3 days ago'
      });
    }
    
    if (goal.current > goal.target * 0.5) {
      const amount = Math.floor(goal.target * 0.2);
      activities.push({
        type: 'add',
        text: `Added KES ${this.formatCurrency(amount)}`,
        date: 'Yesterday'
      });
    }
    
    return activities.reverse(); // Most recent first
  },
  
  onMenuTap() {
    my.navigateTo({
      url: `/pages/goalMenu/goalMenu?id=${this.data.goalId}`
    });
  },
  
  onAddTap() {
    this.setData({
      showAddModal: true,
      addAmount: ''
    });
  },
  
  onWithdrawTap() {
    this.setData({
      showWithdrawModal: true,
      withdrawAmount: '',
      withdrawError: ''
    });
  },
  
  onCloseGoalTap() {
    my.navigateTo({
      url: `/pages/closeGoal/closeGoal?id=${this.data.goalId}`
    });
  },
  
  closeModals() {
    this.setData({
      showAddModal: false,
      showWithdrawModal: false
    });
  },
  
  onAddAmountInput(e) {
    this.setData({
      addAmount: e.detail.value
    });
  },
  
  // pages/goalDetail/goalDetail.js (continued)
  onWithdrawAmountInput(e) {
    this.setData({
      withdrawAmount: e.detail.value,
      withdrawError: ''
    });
    
    // Validate withdraw amount
    const amount = parseFloat(e.detail.value);
    if (amount > this.data.goal.current) {
      this.setData({
        withdrawError: 'Cannot withdraw more than the current balance'
      });
    }
  },
  
  confirmAdd() {
    const amount = parseFloat(this.data.addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      my.showToast({
        type: 'fail',
        content: 'Please enter a valid amount',
        duration: 1500
      });
      return;
    }
    
    // Add contribution to the goal
    addContribution(this.data.goalId, amount)
      .then(updatedGoal => {
        this.closeModals();
        
        // Add the activity to the list
        const newActivity = {
          type: 'add',
          text: `Added KES ${this.formatCurrency(amount)}`,
          date: 'Today'
        };
        
        this.setData({
          goal: updatedGoal,
          activities: [newActivity, ...this.data.activities]
        });
        
        my.showToast({
          type: 'success',
          content: 'Amount added successfully',
          duration: 1500
        });
      })
      .catch(error => {
        console.error('Error adding amount:', error);
        
        my.showToast({
          type: 'fail',
          content: 'Failed to add amount',
          duration: 2000
        });
      });
  },
  
  confirmWithdraw() {
    const amount = parseFloat(this.data.withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      my.showToast({
        type: 'fail',
        content: 'Please enter a valid amount',
        duration: 1500
      });
      return;
    }
    
    if (amount > this.data.goal.current) {
      this.setData({
        withdrawError: 'Cannot withdraw more than the current balance'
      });
      return;
    }
    
    // Update the goal with the withdrawn amount
    const updatedData = {
      current: this.data.goal.current - amount
    };
    
    updateGoal(this.data.goalId, updatedData)
      .then(updatedGoal => {
        this.closeModals();
        
        // Add the activity to the list
        const newActivity = {
          type: 'withdraw',
          text: `Withdrew KES ${this.formatCurrency(amount)}`,
          date: 'Today'
        };
        
        this.setData({
          goal: updatedGoal,
          activities: [newActivity, ...this.data.activities]
        });
        
        my.showToast({
          type: 'success',
          content: 'Amount withdrawn successfully',
          duration: 1500
        });
      })
      .catch(error => {
        console.error('Error withdrawing amount:', error);
        
        my.showToast({
          type: 'fail',
          content: 'Failed to withdraw amount',
          duration: 2000
        });
      });
  },
  
  formatCurrency(amount) {
    return amount.toLocaleString('en-KE');
  },
  
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-KE', options);
  },
  
  formatShortDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-KE', options);
  },
  
  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
});