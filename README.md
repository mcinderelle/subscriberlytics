# Subscriblytics

A modern subscription tracking and analytics tool designed by **Mayukhjit Chakraborty**. Track and analyze your subscriptions with real-time currency conversion and comprehensive insights.

## What's New

### Latest Design Enhancements
- **Monospace Branding**: Professional JetBrains Mono typography throughout the interface
- **Enhanced 3D Grid Background**: Animated multi-layer grid effect with subtle glow
- **Company Logos**: Visual logos for 200+ services automatically displayed
- **Edit Feature**: In-place editing of subscription details
- **Real-time Updates**: Automatic graph refresh every 5 seconds
- **30+ Currencies**: Auto-detect currency based on IP location

### Dark Mode
- Toggle between light and dark themes
- Automatic theme persistence
- Smooth transitions
- Battery-friendly dark interface

### Export & Import
- Export your subscription data as JSON files
- Import your data from previous exports
- Backup and restore your subscriptions
- Keyboard shortcut: `Ctrl+E` (export), `Ctrl+I` (import)

### Keyboard Shortcuts
- `Ctrl+E` - Export your data
- `Ctrl+I` - Import data
- `Ctrl+K` or `/` - Focus search bar
- `?` - Show keyboard shortcuts
- `Esc` - Close any modal

### Enhanced Analytics
- Cost breakdown by category
- Category-based spending analysis
- Improved visualizations
- Better insights into your subscription habits

### Accessibility Improvements
- ARIA labels throughout
- Screen reader support
- Semantic HTML structure
- Keyboard navigation support
- Focus indicators

### Progressive Web App (PWA)
- Install as a standalone app
- Offline functionality
- Fast loading with service worker
- App-like experience

## Key Features

### Advanced Analytics
- **Value Analysis**: Calculate cost per use for each subscription
- **Cost Tracking**: Track daily, monthly, and yearly subscription costs
- **Smart Metrics**: Automatically identify best and worst value subscriptions
- **Visual Charts**: Interactive bar charts showing cost distribution
- **Value Comparison**: Side-by-side comparison of subscription values

### Currency Conversion
- **Multi-Currency Support**: USD, EUR, GBP, CAD, AUD, JPY
- **Real-Time Conversion**: Automatically converts all prices
- **Easy Switching**: Change currency with a single click

### OpenAI Design Language
- Clean, minimal interface inspired by OpenAI
- Translucent frosted glass effects
- Subtle grid pattern background
- Professional typography using Inter font
- No gradient backgrounds - pure clean aesthetic

### 100+ Pre-loaded Services
**Streaming**: Netflix, Disney+, Hulu, Amazon Prime, HBO Max, Paramount+, Peacock, Apple TV+, Starz, Showtime, Discovery+

**Music**: Spotify, Apple Music, YouTube Music, Tidal, Amazon Music, Pandora, Deezer

**Cloud Storage**: iCloud, Dropbox, Google Drive, OneDrive, Box

**Productivity**: Microsoft 365, Adobe Creative Cloud, Notion, Evernote, Todoist, Grammarly, 1Password, LastPass

**Gaming**: Xbox Game Pass, PlayStation Plus, Nintendo Switch Online, EA Play, GeForce Now, Roblox

**Fitness**: Peloton, Apple Fitness+, Headspace, Calm, MyFitnessPal, Strava

**Learning**: MasterClass, Skillshare, LinkedIn Learning, Coursera, Duolingo, Babbel

**Food & Delivery**: Uber Eats Pass, DoorDash, Grubhub+, Instacart

**And many more!**

### Smart Search
- Search through 100+ services instantly
- Filter by category
- Quick-add with one click
- Real pricing included

### Interactive Features
- Color-coded value indicators (Excellent, Good, Moderate, Poor)
- Dynamic animations and transitions
- Responsive design for all devices
- Real-time cost calculations
- Visual cost distribution charts
- Search functionality
- Delete with confirmation

### Data Management
- Local storage - all data saved in your browser
- Export/Import functionality
- Backup and restore capabilities
- Persistent sessions
- No server required
- Privacy-first approach
- Error handling and validation

## Usage

1. Open `index.html` in your web browser
2. **Toggle Theme**: Click the moon/sun icon in the header to switch between light and dark modes
3. **Select Currency**: Choose your preferred currency from the dropdown
4. **Search & Add**: Search for services (press `/` to focus) or scroll through the list and click to add
5. **Custom Subscription**: Use the form to add any subscription with custom pricing
6. **Analyze**: View charts, comparisons, and detailed metrics including category breakdown
7. **Export/Import**: Click the export button to save your data or import button to restore
8. **Optimize**: Make informed decisions about which subscriptions to keep

### Keyboard Shortcuts
- **`Ctrl+E`**: Export your subscription data
- **`Ctrl+I`**: Import subscription data
- **`Ctrl+K`** or **`/`**: Focus the search bar
- **`?`**: Show keyboard shortcuts help
- **`Esc`**: Close any open modal

## Design Features

- **OpenAI-inspired**: Clean, minimal design with professional typography
- **Translucent Elements**: Beautiful frosted glass effects
- **Subtle Patterns**: Grid background pattern (no gradients)
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished interactions throughout
- **Color-Coded Cards**: Visual indicators for value assessment

## Technologies

- Vanilla JavaScript (ES6+)
- HTML5 with semantic elements and ARIA
- CSS3 with custom properties, dark mode, and backdrop-filter
- Canvas API for charts
- LocalStorage API for data persistence
- Service Worker for PWA capabilities
- Inter font family
- Web App Manifest for installable PWA

## How It Works

1. **Quick Add**: Search or browse 100+ services and add them with one click (includes real pricing)
2. **Custom Add**: Use the form to add any subscription with custom pricing and usage
3. **Analyze**: View your cost distribution, value comparison, and detailed metrics
4. **Optimize**: Make informed decisions about which subscriptions to keep or cancel

## Value Categories

- **Excellent Value**: Cost per use under $0.10
- **Good Value**: Cost per use under $0.50
- **Moderate Value**: Cost per use under $1.00
- **Poor Value**: Cost per use over $1.00 - Consider Canceling

## Supported Currencies

- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- JPY (¥) - Japanese Yen

*Exchange rates are approximate and updated periodically.*

## Notes

- All calculations are done client-side in your browser
- No data is sent to any server
- Your data is stored locally using localStorage
- Works completely offline after first load
- Can be installed as a Progressive Web App (PWA)
- Dark mode preference is saved and restored
- Export your data anytime for backup
- Exchange rates are approximate

## Accessibility Features

- **Screen Reader Support**: ARIA labels and semantic HTML throughout
- **Keyboard Navigation**: Full keyboard support for all features
- **Focus Indicators**: Clear visual focus states
- **Color Contrast**: WCAG AA compliant color combinations
- **Responsive Design**: Works on all screen sizes and devices
- **No JavaScript**: Graceful degradation with noscript message

## Installation as PWA

1. Visit the website in your browser
2. Look for the "Add to Home Screen" prompt or browser menu option
3. Click "Install" to add Subscriblytics to your home screen
4. Launch it like a native app!

## Credits

**Designed and Developed by:** Mayukhjit Chakraborty

## License

MIT License - feel free to use this project for personal or commercial purposes.
