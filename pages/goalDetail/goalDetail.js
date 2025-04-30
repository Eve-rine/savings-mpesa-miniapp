const { fetchGoalById, updateGoal,deleteGoal,addContribution } = require('../../services/api');

Page({
  data: {
    goalId: '',
    goal: null,
    loading: true,
    activities: [],
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
  
  generateMockActivities(goal) {
    const activities = [];
    
    activities.push({
      type: 'add',
      text: `Started goal with KES ${this.formatCurrency(goal.current)}`,
      date: this.formatShortDate(goal.startDate)
    });
    
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
    const goalId = this.data.goalId;
  
    my.confirm({
      title: 'Close Goal',
      content: 'Are you sure you want to close and delete this goal?',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      success: (result) => {
        if (result.confirm) {
          deleteGoal(goalId)
            .then(() => {
              my.showToast({
                type: 'success',
                content: 'Goal closed successfully',
                duration: 2000
              });
  
              setTimeout(() => {
                my.navigateBack();
              }, 2000);
            })
            .catch((error) => {
              console.error('Error closing goal:', error);
              my.showToast({
                type: 'fail',
                content: 'Failed to close goal',
                duration: 2000
              });
            });
        }
      }
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
  
  onWithdrawAmountInput(e) {
    this.setData({
      withdrawAmount: e.detail.value,
      withdrawError: ''
    });
    
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

try {
  console.log('Initiating payment for amount:', amount);
  console.log('goalid',this.data.goalId)
  my.call("payBill", {
    businessID: "1112223", 
    billReference: this.data.goalId, // Using goal ID as reference
    amount: amount.toString(),
    currency: "KES",
    reason: `Contribution to ${this.data.goal.name}`,
    success: (res) => {
      console.log('Payment success response:', JSON.stringify(res, null, 2));
      this.handleSuccessfulPayment(amount, res);
    },
    fail: (res) => {
      console.error('Payment failed:', JSON.stringify(res, null, 2));
      let errorMsg = 'Payment failed';
      
      my.alert({
        title: 'Payment Error',
        content: `Error Code: ${res.error || 'Unknown'}\nMessage: ${errorMsg}\n\nFull Details: ${JSON.stringify(res, null, 2)}`,
        buttonText: 'OK',
      });
    },
  });
} catch (error) {
  console.error('Error calling payment API:', error);
  
  // Display detailed error information
  my.alert({
    title: 'Payment API Error',
    content: `An error occurred while attempting to call the payment API:\n\n${error.message || error}\n\nStack: ${error.stack || 'Not available'}`,
    buttonText: 'OK'
  });
}
},

handleSuccessfulPayment(amount, paymentResponse) {
  addContribution(this.data.goalId, amount)
    .then(updatedGoal => {
      return updateGoal(this.data.goalId, {
        lastContribution: {
          amount: Number(amount),
          date: new Date().toISOString(),
          transactionId: paymentResponse.transactionId || null,
          paymentMethod: 'PayBill',
          status: 'completed'
        }
      });
    })
    .then(updatedGoal => {
      this.closeModals();
      
      const newActivity = {
        type: 'add',
        text: `Added KES ${this.formatCurrency(amount)}`,
        date: 'Today',
        transactionId: paymentResponse.transactionId || 'Unknown'
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
        content: 'Failed to update goal',
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