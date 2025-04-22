Page({
  data: {
    activeTab: 'quotes',
    quotes: [
      {
        text: "A penny saved is a penny earned.",
        author: "Benjamin Franklin"
      },
      {
        text: "Financial freedom is available to those who learn about it and work for it.",
        author: "Robert Kiyosaki"
      },
      {
        text: "Do not save what is left after spending, but spend what is left after saving.",
        author: "Warren Buffett"
      },
      {
        text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.",
        author: "Ayn Rand"
      },
      {
        text: "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought.",
        author: "T.T. Munger"
      }
    ],
    tips: [
      "Create a vision board with images of what you're saving for. Visual reminders can boost your motivation to save.",
      "Try the 30-day rule: When tempted to make an unplanned purchase, wait 30 days. If you still want it, then consider buying it.",
      "Set up automatic transfers to your savings account on payday so you never see the money in your checking account.",
      "Challenge yourself to no-spend days or weekends to cut unnecessary expenses.",
      "Use cash envelopes for discretionary spending to help stay within budget."
    ],
    displayedQuotes: [],
    currentTip: ""
  },

  onLoad() {
    this.refreshContent();
  },

  refreshContent() {
    // Select random quotes and tip
    const shuffledQuotes = this.shuffleArray([...this.data.quotes]);
    const displayedQuotes = shuffledQuotes.slice(0, 2);
    
    const randomTipIndex = Math.floor(Math.random() * this.data.tips.length);
    const currentTip = this.data.tips[randomTipIndex];
    
    this.setData({
      displayedQuotes,
      currentTip
    });
  },
  
  shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    } else if (tab === 'tips') {
      my.navigateTo({
        url: '/pages/strategies/strategies'
      });
    }
  },
  
  onRefreshTap() {
    this.refreshContent();
    
    my.showToast({
      type: 'success',
      content: 'Quotes refreshed',
      duration: 1500
    });
  },

  onBack() {
    my.navigateBack();
  }
});
