// Implementation for MockAPI.io

const API_BASE_URL = 'https://6804146579cb28fb3f5a50d0.mockapi.io/savings/api';

// Fetch all goals
function fetchGoals() {
  return new Promise((resolve, reject) => {
    my.request({
      url: `${API_BASE_URL}/goals`,
      method: 'GET',
      success: (res) => {
        if (res.status === 200) {
          const goals = res.data.map(goal => ({
            ...goal,
            current: Number(goal.current),
            target: Number(goal.target),
            percentage: Number(goal.percentage)
          }));
          resolve(goals);
        } else {
          reject(new Error(`API error: ${res.status}`));
        }
      },
      fail: (error) => {
        console.error('Error fetching goals:', error);
        reject(error);
      }
    });
  });
}

// Fetch a specific goal by ID
function fetchGoalById(id) {
  return new Promise((resolve, reject) => {
    my.request({
      url: `${API_BASE_URL}/goals/${id}`,
      method: 'GET',
      success: (res) => {
        if (res.status === 200) {
          const goal = {
            ...res.data,
            current: Number(res.data.current),
            target: Number(res.data.target),
            percentage: Number(res.data.percentage)
          };
          resolve(goal);
        } else {
          reject(new Error(`API error: ${res.status}`));
        }
      },
      fail: (error) => {
        console.error(`Error fetching goal ${id}:`, error);
        reject(error);
      }
    });
  });
}

function createGoal(goalData) {
  return new Promise((resolve, reject) => {
    const current = Number(goalData.current || 0);
    const target = Number(goalData.target || 0);
    
    const percentage = target > 0 ? Math.floor((current / target) * 100) : 0;
    
    const goalWithPercentage = { 
      ...goalData, 
      current,
      target,
      percentage
    };
    
    my.request({
      url: `${API_BASE_URL}/goals`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: goalWithPercentage,
      dataType: 'json',
      success: (res) => {
        if (res.status === 201 || res.status === 200) {
          const newGoal = {
            ...res.data,
            current: Number(res.data.current),
            target: Number(res.data.target),
            percentage: Number(res.data.percentage)
          };
          resolve(newGoal);
        } else {
          reject(new Error(`API error: ${res.status}`));
        }
      },
      fail: (error) => {
        console.error('Error creating goal:', error);
        reject(error);
      }
    });
  });
}

function updateGoal(id, updatedData) {
  return new Promise((resolve, reject) => {
    fetchGoalById(id)
      .then(currentGoal => {
        const current = updatedData.current !== undefined ? Number(updatedData.current) : currentGoal.current;
        const target = updatedData.target !== undefined ? Number(updatedData.target) : currentGoal.target;
        
        const percentage = target > 0 ? Math.floor((current / target) * 100) : 0;
        
        const goalWithPercentage = { 
          ...updatedData, 
          current,
          target,
          percentage
        };
        
        my.request({
          url: `${API_BASE_URL}/goals/${id}`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          data: goalWithPercentage,
          dataType: 'json',
          success: (res) => {
            if (res.status === 200) {
              const updatedGoal = {
                ...res.data,
                current: Number(res.data.current),
                target: Number(res.data.target),
                percentage: Number(res.data.percentage)
              };
              resolve(updatedGoal);
            } else {
              reject(new Error(`API error: ${res.status}`));
            }
          },
          fail: (error) => {
            console.error(`Error updating goal ${id}:`, error);
            reject(error);
          }
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

// Add contribution to a goal
function addContribution(id, amount) {
  return new Promise((resolve, reject) => {
    fetchGoalById(id)
      .then(goal => {
        const newCurrent = goal.current + Number(amount);
        const percentage = goal.target > 0 ? Math.floor((newCurrent / goal.target) * 100) : 0;

        my.request({
          url: `${API_BASE_URL}/goals/${id}`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            ...goal,
            current: newCurrent,
            percentage
          },
          dataType: 'json',
          success: (res) => {
            if (res.status === 200) {
              const updatedGoal = {
                ...res.data,
                current: Number(res.data.current),
                target: Number(res.data.target),
                percentage: Number(res.data.percentage)
              };
              resolve(updatedGoal);
            } else {
              reject(new Error(`API error: ${res.status}`));
            }
          },
          fail: (error) => {
            console.error(`Error adding contribution to goal ${id}:`, error);
            reject(error);
          }
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

// Delete a goal
function deleteGoal(id) {
  return new Promise((resolve, reject) => {
    my.request({
      url: `${API_BASE_URL}/goals/${id}`,
      method: 'DELETE',
      success: (res) => {
        if (res.status === 200 || res.status === 204) {
          resolve({ success: true, id });
        } else {
          reject(new Error(`Failed to delete goal: ${res.status}`));
        }
      },
      fail: (error) => {
        console.error(`Error deleting goal ${id}:`, error);
        reject(error);
      }
    });
  });
}

// Get goal categories
function fetchCategories() {
  return new Promise((resolve) => {
    resolve([
      'emergency',
      'travel',
      'electronics',
      'education',
      'home',
      'vehicle',
      'events',
      'investment',
      'other'
    ]);
  });
}

module.exports = {
  fetchGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  addContribution,
  deleteGoal,
  fetchCategories,
};