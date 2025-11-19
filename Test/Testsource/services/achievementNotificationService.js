class AchievementNotificationService {
  constructor() {
    this.previousAchievements = new Set();
    this.listeners = [];
  }

  // Set previous achievements (call this when loading achievements)
  setPreviousAchievements(achievements) {
    this.previousAchievements = new Set(achievements.map(a => a.id));
  }

  // Check for new achievements and notify listeners
  checkNewAchievements(currentAchievements) {
    const currentIds = new Set(currentAchievements.map(a => a.id));
    const newAchievements = currentAchievements.filter(a => 
      !this.previousAchievements.has(a.id)
    );

    if (newAchievements.length > 0) {
      // Notify listeners about new achievements
      this.listeners.forEach(listener => {
        newAchievements.forEach(achievement => {
          listener(achievement);
        });
      });
    }

    // Update previous achievements
    this.previousAchievements = currentIds;
  }

  // Add listener for new achievements
  addListener(listener) {
    this.listeners.push(listener);
  }

  // Remove listener
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

// Create singleton instance
const achievementNotificationService = new AchievementNotificationService();

export default achievementNotificationService; 