# Pool App
This Billiards pool App is a mobile application designed to streamline pool tournament management. It allows users to create, manage, and participate in tournaments with ease. The app provides features such as skill-based filtering, distance-based tournament searches, and a user-friendly interface for scheduling and managing events.

## Features
- **Tournament Creation**: Easily set up pool tournaments with customizable rules and schedules.
- **Skill-Based Filtering**: Filter participants based on their skill levels to ensure fair competition.
- **Distance-Based Search**: Locate tournaments near your location using the haversine distance formula.
- **User-Friendly Interface**: Simple and intuitive design for managing tournaments and participants.
- **Join Requests**: Manage team join requests conditionally based on user associations and request statuses.

## Technologies Used
### Frontend:
- React Native: For building a cross-platform mobile application.
- Expo: Simplifies the development and deployment process.

### Backend:
- Express.js: Node.js framework for API development.
- SendGrid: For sending email notifications.
- Haversine Formula: Used to calculate distances between coordinates for filtering tournaments by proximity.

## Setup and Installation

### Prerequisites
- Node.js and npm/yarn installed.
- Expo CLI installed globally:
```
npm install -g expo-cli
```
### Steps

1. Clone the Repository:
```
git clone https://github.com/ryanmarando/pool-app.git
cd pool-app
```
2. Install Dependencies:
```
npm install
```
3. Run the Application:
```
npx expo start
```
*     
  * Use the Expo Go app on your mobile device to scan the QR code and view the app.

## Usage
- **Create a Tournament**: Use the app to create tournaments by specifying details like date, time, and location.
- **Filter by Skill Level**: Find players or teams matching the required skill level.
- **Search Nearby Tournaments**: Locate tournaments based on your current location.
- **Manage Requests**: Handle join requests for teams effectively.

## Future Enhancements
- Add real-time chat functionality for participants.
- Integrate a ranking system based on player performance.
- Expand features to support other competitive games.
- Enhance UI for better user experience on mobile devices.

## Contact
For questions or support, please contact:
Ryan MarandoGitHub: @ryanmarando

