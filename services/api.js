// services/api.js - Implementation for MockAPI.io

// Base URL for the API
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

// Create a new goal
function createGoal(goalData) {
  return new Promise((resolve, reject) => {
    // Ensure numeric fields are numbers
    const current = Number(goalData.current || 0);
    const target = Number(goalData.target || 0);
    
    // Calculate percentage
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

// Update an existing goal
function updateGoal(id, updatedData) {
  return new Promise((resolve, reject) => {
    // First get the current goal to calculate percentage correctly
    fetchGoalById(id)
      .then(currentGoal => {
        // Determine current and target values
        const current = updatedData.current !== undefined ? Number(updatedData.current) : currentGoal.current;
        const target = updatedData.target !== undefined ? Number(updatedData.target) : currentGoal.target;
        
        // Calculate new percentage
        const percentage = target > 0 ? Math.floor((current / target) * 100) : 0;
        
        // Create updated goal data
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
    // First get the current goal
    fetchGoalById(id)
      .then(goal => {
        // Calculate new values
        const newCurrent = goal.current + Number(amount);
        const percentage = goal.target > 0 ? Math.floor((newCurrent / goal.target) * 100) : 0;
        
        // Update the goal
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
    // Since MockAPI doesn't support complex structures well, we're returning a hardcoded list
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

// Seed initial data
function seedInitialData() {
  return new Promise((resolve, reject) => {
    // Check if we already have goals
    fetchGoals()
      .then(existingGoals => {
        if (existingGoals.length === 0) {
          const initialGoals = [
            {
              name: "Emergency Fund",
              current: 12500,
              target: 50000,
              startDate: "2025-01-01",
              targetDate: "2025-12-31",
              category: "emergency"
            },
            {
              name: "New Laptop",
              current: 45000,
              target: 90000,
              startDate: "2025-02-15",
              targetDate: "2025-07-15",
              category: "electronics"
            },
            {
              name: "Holiday Trip",
              current: 30000,
              target: 100000,
              startDate: "2025-03-01",
              targetDate: "2025-10-01",
              category: "travel"
            },
            {
              name: "Wedding Fund",
              current: 150000,
              target: 300000,
              startDate: "2024-12-01",
              targetDate: "2026-06-01",
              category: "events"
            }
          ];
          
          // Create each goal sequentially
          let promise = Promise.resolve();
          initialGoals.forEach(goal => {
            promise = promise.then(() => createGoal(goal));
          });
          
          promise
            .then(() => {
              console.log('Initial data seeded successfully');
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        } else {
          resolve();
        }
      })
      .catch(error => {
        console.error('Error seeding initial data:', error);
        reject(error);
      });
  });
}

// Export all functions
module.exports = {
  fetchGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  addContribution,
  deleteGoal,
  fetchCategories,
  seedInitialData
};