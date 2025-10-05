# Air Quality Monitoring Application - README

## Overview
The Air Quality Monitoring Application is a user-centric, responsive web tool designed to provide real-time air quality data, personalized health recommendations, and 7-day forecasts. Built with React and Material-UI, the app delivers actionable insights tailored to individual user profiles (e.g., general population, sensitive groups like asthma patients) while maintaining a clean, intuitive interface.


## Key Features
The application includes four core modules, each focused on delivering specific value to users:

### 1. Personalized Health Recommendations
Delivers tailored advice by combining real-time air quality data with user-specific attributes (age, health conditions, risk group).  
- **Core Functionality**: Maps user profiles to air quality risks (e.g., asthma patients → PM2.5/Ozone sensitivity) and generates context-aware guidance.  
- **UI Highlights**:  
  - Color-coded risk badges (e.g., "Moderate Risk" in amber, "Urgent" in red) aligned with AQI status.  
  - Actionable categories: "Can Do" (safe activities), "Limit" (reduced activities), "Avoid" (high-risk activities).  
  - Conditional content (only shows sensitive pollutants or health tips when relevant to the user).  
- **Data Integration**: Pulls real-time AQI data from trusted sources (e.g., WAQI API) and user profile data from the backend.


### 2. Air Quality Alerts
Keeps users informed of current, upcoming, and forecasted air quality changes with customizable notifications.  
- **Core Functionality**:  
  - Real-time alert fetching (auto-refreshes every 5 minutes) with read/unread tracking.  
  - SMS notifications for critical alerts ("Unhealthy" or "Urgent" severity) when enabled.  
  - Filtering options: "All Alerts", "Unread", "Moderate", "Unhealthy", "Urgent".  
- **UI Highlights**:  
  - Card-based alert design with severity-specific border accents (e.g., red for urgent alerts).  
  - Hover effects (card lift + shadow) for interactivity.  
  - Empty-state handling (friendly message when no alerts match filters).  
  - Notification toggle with snackbar feedback (confirms enable/disable status).


### 3. 7-Day Air Quality Forecast
Visualizes upcoming air quality trends to help users plan activities in advance.  
- **Core Functionality**:  
  - Live forecast data fetching (auto-refreshes every hour) with fallback to static data if API fails.  
  - Dynamic day labels (matches current date to avoid static "Mon-Sun" mapping).  
  - Weekly summary (calculates average/max/min AQI for the week).  
- **UI Highlights**:  
  - Interactive line chart with custom tooltips (shows AQI value, status, and health tips).  
  - Reference lines for AQI thresholds ("Good" = 50, "Moderate" = 100) for quick context.  
  - Responsive daily forecast cards (2 per row on mobile, 6 on desktop) with hover scaling.  
  - Loading states (spinner overlay on chart, faded cards) for seamless data updates.


### 4. Side Navigation Bar
Provides consistent, accessible navigation across all app modules.  
- **Core Functionality**: Persistent navigation between "Dashboard", "Alerts", "Forecast", and "Profile" pages.  
- **UI Highlights**: Collapsible on mobile (optional) and aligned with the app’s color scheme. Active page indicator for clear user orientation.


## Tech Stack
| Layer               | Tools & Libraries                                                                 |
|---------------------|-----------------------------------------------------------------------------------|
| Frontend Framework  | React 18 (with "use client" for Next.js compatibility)                            |
| UI Component Library| Material-UI (MUI) v5 (for responsive, accessible components)                      |
| Data Visualization  | Recharts (for interactive line charts in the Forecast module)                     |
| State Management    | React Hooks (useState, useEffect, useCallback)                                    |
| API Integration     | Fetch API (for real-time data from backend/air quality services)                  |
| Notifications       | Backend SMS service integration (triggers for critical alerts)                    |


## Installation & Setup
### Prerequisites
- Node.js 16+ or Yarn 1.22+  
- Access to a backend API (for air quality data, user profiles, and SMS notifications)  
- API key for air quality data (e.g., WAQI API)  


### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/air-quality-monitor.git
cd air-quality-monitor
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```env
# Database configuration
DB_USER=root
DB_PASSWORD=your_db_password_here
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nasa_space

# JWT secret key for authentication
JWT_SECRET=your_jwt_secret_here

# WAQI API token for air quality data
WAQI_API_TOKEN=your_waqi_api_token_here
```

### Step 4: Run the Development Server
```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```
The app will be available at `http://localhost:3000`.


## Usage Guide
### For End Users
1. **Sign Up/Log In**: Create an account to save your profile (age, health conditions, notification preferences).  
2. **View Dashboard**: Check personalized health recommendations based on current air quality.  
3. **Manage Alerts**: Enable SMS notifications for critical alerts and filter alerts by severity.  
4. **Plan with Forecast**: Use the 7-day forecast to schedule outdoor activities (e.g., avoid days with "Unhealthy" AQI).  


### For Developers
#### Customization Tips
- **Update AQI Thresholds**: Modify the `getAqiConfig` function in the Forecast module to adjust status ranges (e.g., change "Moderate" to 51-110).  
- **Add Pollutant Data**: Extend the `pollutantConfig` in the Forecast module to include additional pollutants (e.g., NO2, SO2) and update the chart to display multiple lines.  
- **Adjust Refresh Intervals**: Modify the `setInterval` duration in the Alerts/Forecast modules to change how often data updates (e.g., 10 minutes for alerts).  

#### API Requirements
The backend must return data in the following formats for each module:
- **Personalization**: See [Appendix A](#appendix-a-sample-personalization-data)  
- **Alerts**: See [Appendix B](#appendix-b-sample-alerts-data)  
- **Forecast**: See [Appendix C](#appendix-c-sample-forecast-data)  


## Accessibility Features
- **Color Contrast**: All text meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).  
- **Screen Reader Support**: Semantic HTML (headings, buttons) and ARIA labels for interactive elements.  
- **Keyboard Navigation**: All buttons/filters are accessible via keyboard (Tab/Enter keys).  
- **Responsive Design**: Works on mobile, tablet, and desktop (no horizontal scrolling, readable text on small screens).  


## Known Limitations & Future Improvements
- **Limitation**: SMS notifications require a backend service (e.g., Twilio, Plivo) and user phone number verification.  
- **Future Improvements**:  
  - Add location-based air quality (allow users to select multiple locations).  
  - Integrate weather data (e.g., rain, wind) to explain AQI changes.  
  - Add a "Activity Planner" tool (lets users input an activity and get a recommendation based on forecast).  


## Appendix
### Appendix A: Sample Personalization Data
```json
{
  "personalization": {
    "userInfo": {
      "userId": "1",
      "riskGroup": "General population",
      "age": 24,
      "sensitivePollutants": []
    },
    "aqiRisk": "Moderate Risk",
    "shortAdvice": "General population notice: Moderate air quality, sensitive groups should limit high-intensity outdoor activities",
    "actions": {
      "canDo": ["Short outdoor activities (under 1 hour)", "Light indoor exercises"],
      "limit": ["Prolonged high-intensity workouts", "Staying in traffic-heavy areas"],
      "avoid": []
    },
    "pollutantHarmTips": [],
    "updateTime": "2025-10-05T09:28:56.025Z"
  }
}
```

### Appendix B: Sample Alerts Data
```json
[
  {
    "id": 1,
    "date": "2025-10-05T10:30:00Z",
    "title": "Moderate Air Quality",
    "message": "AQI is currently moderate (78). Sensitive groups should reduce prolonged outdoor activity.",
    "severity": "moderate",
    "type": "current",
    "isRead": false
  },
  {
    "id": 2,
    "date": "2025-10-06T06:00:00Z",
    "title": "Unhealthy for Sensitive Groups",
    "message": "AQI expected to reach 115 tomorrow morning. Elderly and children should avoid outdoor exercise.",
    "severity": "high",
    "type": "upcoming",
    "isRead": false
  }
]
```

### Appendix C: Sample Forecast Data
```json
[
  { "aqiValue": 70 },
  { "aqiValue": 80 },
  { "aqiValue": 90 },
  { "aqiValue": 65 },
  { "aqiValue": 75 },
  { "aqiValue": 85 },
  { "aqiValue": 60 }
]
```




## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.