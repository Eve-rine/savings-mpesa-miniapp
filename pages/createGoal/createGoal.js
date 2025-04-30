const { createGoal, fetchCategories } = require('../../services/api');

Page({
  data: {
    name: '',
    target: '',
    current: '',
    targetDate: '',
    today: '',
    categoryIndex: -1,
    categories: [],
    isFormValid: false,
    loading: false
  },

  onLoad() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    this.setData({
      today: todayString
    });
    
    fetchCategories()
      .then(categories => {
        const formattedCategories = categories.map(category => 
          category.charAt(0).toUpperCase() + category.slice(1)
        );
        
        this.setData({
          categories: formattedCategories
        });
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  },

  validateForm() {
    const { name, target, targetDate, categoryIndex } = this.data;
    const isValid = 
      name.trim() !== '' && 
      target.trim() !== '' && 
      !isNaN(parseFloat(target)) && 
      parseFloat(target) > 0 &&
      targetDate !== '' &&
      categoryIndex !== -1;
    
    this.setData({
      isFormValid: isValid
    });
    
    return isValid;
  },

  onNameInput(e) {
    this.setData({
      name: e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  onTargetInput(e) {
    this.setData({
      target: e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  onCurrentInput(e) {
    this.setData({
      current: e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  onTargetDateChange(e) {
    this.setData({
      targetDate: e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  onCategoryChange(e) {
    this.setData({
      categoryIndex: e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  onSaveGoal() {
    if (!this.validateForm()) {
      my.showToast({
        type: 'fail',
        content: 'Please fill all required fields',
        duration: 1500
      });
      return;
    }
    
    this.setData({ loading: true });
    
    const { name, target, current, targetDate, categoryIndex, categories } = this.data;
    
    // Today's date for the start date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const startDate = `${year}-${month}-${day}`;
    
    // Lower case category for API
    const category = categories[categoryIndex].toLowerCase();
    
    const goalData = {
      name,
      target: parseFloat(target) || 0,
      current: parseFloat(current) || 0,
      startDate,
      targetDate,
      category
    };
    
    createGoal(goalData)
      .then(() => {
        this.setData({ loading: false });
        
        my.showToast({
          type: 'success',
          content: 'Goal created successfully',
          duration: 1500
        });
        
        setTimeout(() => {
          my.reLaunch({
            url: '/pages/index/index'
          });
        }, 1500);
        // my.navigateBack();
      })
      .catch(error => {
        console.error('Error creating goal:', error);
        this.setData({ loading: false });
        
        my.showToast({
          type: 'fail',
          content: 'Failed to create goal',
          duration: 2000
        });
      });
  },

  onBack() {
    my.navigateBack();
  }
});