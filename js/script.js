// === Currency Exchange Rates ===
const exchangeRates = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    CAD: { symbol: 'C$', rate: 1.35 },
    AUD: { symbol: 'A$', rate: 1.52 },
    JPY: { symbol: '¥', rate: 150 }
};

let currentCurrency = 'USD';

// === Data Management ===
let subscriptions = [];

// Popular Services with Real Prices (USD) - REMOVED FREE ONES
const popularServices = {
    // Streaming (30 services)
    'Netflix Basic': { cost: 9.99, category: 'Streaming' },
    'Netflix Standard': { cost: 15.49, category: 'Streaming' },
    'Netflix Premium': { cost: 22.99, category: 'Streaming' },
    'Disney+': { cost: 13.99, category: 'Streaming' },
    'Hulu': { cost: 7.99, category: 'Streaming' },
    'Hulu No Ads': { cost: 17.99, category: 'Streaming' },
    'Amazon Prime': { cost: 14.99, category: 'Streaming' },
    'HBO Max': { cost: 15.99, category: 'Streaming' },
    'Paramount+': { cost: 7.99, category: 'Streaming' },
    'Paramount+ Premium': { cost: 11.99, category: 'Streaming' },
    'Peacock': { cost: 5.99, category: 'Streaming' },
    'Peacock Premium': { cost: 11.99, category: 'Streaming' },
    'Apple TV+': { cost: 9.99, category: 'Streaming' },
    'Starz': { cost: 10.99, category: 'Streaming' },
    'Showtime': { cost: 10.99, category: 'Streaming' },
    'Discovery+': { cost: 4.99, category: 'Streaming' },
    'Criterion Channel': { cost: 10.99, category: 'Streaming' },
    'Mubi': { cost: 10.99, category: 'Streaming' },
    'Shudder': { cost: 5.99, category: 'Streaming' },
    'AMC+': { cost: 8.99, category: 'Streaming' },
    'BritBox': { cost: 8.99, category: 'Streaming' },
    'Acorn TV': { cost: 6.99, category: 'Streaming' },
    'Crunchyroll': { cost: 9.99, category: 'Streaming' },
    'Funimation': { cost: 7.99, category: 'Streaming' },
    'Viki': { cost: 9.99, category: 'Streaming' },
    'Sling TV Orange': { cost: 35, category: 'Streaming' },
    'Sling TV Blue': { cost: 35, category: 'Streaming' },
    'YouTube TV': { cost: 72.99, category: 'Streaming' },
    'Philo': { cost: 25, category: 'Streaming' },
    'fuboTV': { cost: 74.99, category: 'Streaming' },
    
    // Music (25 services)
    'Spotify': { cost: 10.99, category: 'Music' },
    'Spotify Family': { cost: 16.99, category: 'Music' },
    'Spotify Student': { cost: 5.99, category: 'Music' },
    'Apple Music': { cost: 10.99, category: 'Music' },
    'Apple Music Family': { cost: 16.99, category: 'Music' },
    'YouTube Music': { cost: 10.99, category: 'Music' },
    'YouTube Music Family': { cost: 16.99, category: 'Music' },
    'YouTube Premium': { cost: 13.99, category: 'Music' },
    'Tidal': { cost: 10.99, category: 'Music' },
    'Tidal HiFi': { cost: 19.99, category: 'Music' },
    'Amazon Music Unlimited': { cost: 10.99, category: 'Music' },
    'Pandora Plus': { cost: 5.99, category: 'Music' },
    'Pandora Premium': { cost: 9.99, category: 'Music' },
    'Deezer': { cost: 10.99, category: 'Music' },
    'SiriusXM': { cost: 10.99, category: 'Music' },
    'Qobuz': { cost: 12.99, category: 'Music' },
    'SoundCloud Go': { cost: 4.99, category: 'Music' },
    'SoundCloud Go+': { cost: 9.99, category: 'Music' },
    'Spotify+Apple TV': { cost: 10.99, category: 'Music' },
    'Prime Music HD': { cost: 7.99, category: 'Music' },
    'Qello Concerts': { cost: 7.99, category: 'Music' },
    'Resonance': { cost: 9.99, category: 'Music' },
    'Napster': { cost: 10.99, category: 'Music' },
    'iHeartRadio Premium': { cost: 9.99, category: 'Music' },
    'KKBox': { cost: 6.99, category: 'Music' },
    
    // Cloud Storage (20 services)
    'Apple iCloud 50GB': { cost: 0.99, category: 'Cloud Storage' },
    'Apple iCloud 200GB': { cost: 2.99, category: 'Cloud Storage' },
    'Apple iCloud 2TB': { cost: 9.99, category: 'Cloud Storage' },
    'Dropbox Plus': { cost: 9.99, category: 'Cloud Storage' },
    'Dropbox Professional': { cost: 19.99, category: 'Cloud Storage' },
    'Google Drive 100GB': { cost: 1.99, category: 'Cloud Storage' },
    'Google Drive 200GB': { cost: 2.99, category: 'Cloud Storage' },
    'Google Drive 2TB': { cost: 9.99, category: 'Cloud Storage' },
    'OneDrive 100GB': { cost: 1.99, category: 'Cloud Storage' },
    'OneDrive 1TB': { cost: 6.99, category: 'Cloud Storage' },
    'Box Personal': { cost: 14, category: 'Cloud Storage' },
    'pCloud': { cost: 4.99, category: 'Cloud Storage' },
    'Tresorit': { cost: 10.42, category: 'Cloud Storage' },
    'Sync': { cost: 8, category: 'Cloud Storage' },
    'Mega Pro': { cost: 6.99, category: 'Cloud Storage' },
    'IceDrive': { cost: 4.17, category: 'Cloud Storage' },
    'Internxt': { cost: 4.17, category: 'Cloud Storage' },
    'Koofr': { cost: 5.99, category: 'Cloud Storage' },
    'Syncplicity': { cost: 15, category: 'Cloud Storage' },
    'Filen': { cost: 11.99, category: 'Cloud Storage' },
    
    // Productivity (30 services)
    'Microsoft 365 Personal': { cost: 6.99, category: 'Productivity' },
    'Microsoft 365 Family': { cost: 9.99, category: 'Productivity' },
    'Microsoft 365 Business': { cost: 12.50, category: 'Productivity' },
    'Adobe Creative Cloud': { cost: 52.99, category: 'Productivity' },
    'Adobe Photoshop': { cost: 22.99, category: 'Productivity' },
    'Adobe Illustrator': { cost: 22.99, category: 'Productivity' },
    'Adobe Premiere Pro': { cost: 22.99, category: 'Productivity' },
    'Notion Plus': { cost: 8, category: 'Productivity' },
    'Notion AI': { cost: 20, category: 'Productivity' },
    'Evernote Premium': { cost: 7.99, category: 'Productivity' },
    'Todoist Premium': { cost: 4, category: 'Productivity' },
    'Grammarly Premium': { cost: 12, category: 'Productivity' },
    '1Password': { cost: 2.99, category: 'Productivity' },
    'LastPass Premium': { cost: 3, category: 'Productivity' },
    'Dashlane': { cost: 4.99, category: 'Productivity' },
    'Calendly Premium': { cost: 10, category: 'Productivity' },
    'Zoom Pro': { cost: 14.99, category: 'Productivity' },
    'Canva Pro': { cost: 14.99, category: 'Productivity' },
    'Figma Professional': { cost: 12, category: 'Productivity' },
    'Slack Pro': { cost: 7.25, category: 'Productivity' },
    'Asana Premium': { cost: 10.99, category: 'Productivity' },
    'Monday.com': { cost: 8, category: 'Productivity' },
    'ClickUp': { cost: 5, category: 'Productivity' },
    'Trello': { cost: 5, category: 'Productivity' },
    'Wrike': { cost: 9.80, category: 'Productivity' },
    'Airtable': { cost: 10, category: 'Productivity' },
    'Monday.com Business': { cost: 16, category: 'Productivity' },
    'Teamwork': { cost: 10, category: 'Productivity' },
    'Basecamp': { cost: 15, category: 'Productivity' },
    'Smartsheet': { cost: 14, category: 'Productivity' },
    
    // Gaming (25 services)
    'Xbox Game Pass': { cost: 10.99, category: 'Gaming' },
    'Xbox Game Pass Ultimate': { cost: 16.99, category: 'Gaming' },
    'PlayStation Plus Essential': { cost: 9.99, category: 'Gaming' },
    'PlayStation Plus Extra': { cost: 14.99, category: 'Gaming' },
    'PlayStation Plus Premium': { cost: 17.99, category: 'Gaming' },
    'Nintendo Switch Online': { cost: 3.99, category: 'Gaming' },
    'Nintendo Switch Online + Expansion': { cost: 49.99, category: 'Gaming' },
    'EA Play': { cost: 4.99, category: 'Gaming' },
    'GeForce Now Priority': { cost: 9.99, category: 'Gaming' },
    'GeForce Now Ultimate': { cost: 19.99, category: 'Gaming' },
    'Roblox Premium': { cost: 4.99, category: 'Gaming' },
    'Ubisoft+': { cost: 14.99, category: 'Gaming' },
    'GameFly': { cost: 15.95, category: 'Gaming' },
    'Shadow': { cost: 29.99, category: 'Gaming' },
    'Boosteroid': { cost: 9.99, category: 'Gaming' },
    'Blacknut': { cost: 12.99, category: 'Gaming' },
    'Jump': { cost: 5.99, category: 'Gaming' },
    'Luna Plus': { cost: 9.99, category: 'Gaming' },
    'Steam': { cost: 5.99, category: 'Gaming' },
    'Origin Access': { cost: 4.99, category: 'Gaming' },
    'Google Stadia Pro': { cost: 9.99, category: 'Gaming' },
    'Playstation Now': { cost: 9.99, category: 'Gaming' },
    'Twitch Turbo': { cost: 8.99, category: 'Gaming' },
    'Discord Nitro': { cost: 9.99, category: 'Gaming' },
    'CBS All Access': { cost: 5.99, category: 'Gaming' },
    
    // Fitness (25 services)
    'Peloton App': { cost: 12.99, category: 'Fitness' },
    'Peloton All Access': { cost: 44, category: 'Fitness' },
    'Apple Fitness+': { cost: 9.99, category: 'Fitness' },
    'Headspace': { cost: 12.99, category: 'Fitness' },
    'Calm': { cost: 14.99, category: 'Fitness' },
    'MyFitnessPal Premium': { cost: 9.99, category: 'Fitness' },
    'Strava': { cost: 11.99, category: 'Fitness' },
    'Noom': { cost: 59, category: 'Fitness' },
    'NordicTrack': { cost: 39.99, category: 'Fitness' },
    'Fitbit Premium': { cost: 9.99, category: 'Fitness' },
    'Beachbody': { cost: 9.99, category: 'Fitness' },
    'Alo Moves': { cost: 20, category: 'Fitness' },
    'Centr': { cost: 29.99, category: 'Fitness' },
    'Daily Burn': { cost: 19, category: 'Fitness' },
    'ClassPass': { cost: 79, category: 'Fitness' },
    'Aaptiv': { cost: 14.99, category: 'Fitness' },
    'Barre3': { cost: 29, category: 'Fitness' },
    'Fiton': { cost: 19.99, category: 'Fitness' },
    'NTC': { cost: 10, category: 'Fitness' },
    'YogaGlo': { cost: 18, category: 'Fitness' },
    'Glo': { cost: 18, category: 'Fitness' },
    'P.T. Club': { cost: 9.99, category: 'Fitness' },
    'Fitness Blender': { cost: 9.99, category: 'Fitness' },
    'Fiit': { cost: 19.99, category: 'Fitness' },
    'Obé': { cost: 27, category: 'Fitness' },
    
    // Learning (25 services)
    'MasterClass': { cost: 15, category: 'Learning' },
    'Skillshare': { cost: 32, category: 'Learning' },
    'LinkedIn Learning': { cost: 39.99, category: 'Learning' },
    'Udemy Personal': { cost: 16.99, category: 'Learning' },
    'Udemy Business': { cost: 199, category: 'Learning' },
    'Duolingo Super': { cost: 6.99, category: 'Learning' },
    'Duolingo Max': { cost: 83.99, category: 'Learning' },
    'Babbel': { cost: 13.99, category: 'Learning' },
    'Rosetta Stone': { cost: 35.97, category: 'Learning' },
    'Coursera Plus': { cost: 59, category: 'Learning' },
    'Brilliant': { cost: 24.99, category: 'Learning' },
    'Codecademy Pro': { cost: 39.99, category: 'Learning' },
    'Pluralsight': { cost: 29, category: 'Learning' },
    'Treehouse': { cost: 25, category: 'Learning' },
    'General Assembly': { cost: 150, category: 'Learning' },
    'BrainPOP': { cost: 14.95, category: 'Learning' },
    'Great Courses Plus': { cost: 12.99, category: 'Learning' },
    'Study.com': { cost: 59.99, category: 'Learning' },
    'Udacity': { cost: 249, category: 'Learning' },
    'DataCamp': { cost: 29, category: 'Learning' },
    'Lynda': { cost: 19.99, category: 'Learning' },
    'Chegg Study': { cost: 15.95, category: 'Learning' },
    'Grammarly Business': { cost: 12, category: 'Learning' },
    'Scribbr': { cost: 19.95, category: 'Learning' },
    'ProWritingAid': { cost: 20, category: 'Learning' },
    
    // Food & Delivery (20 services)
    'Uber Eats Pass': { cost: 9.99, category: 'Food & Delivery' },
    'DoorDash DashPass': { cost: 9.99, category: 'Food & Delivery' },
    'Grubhub+': { cost: 9.99, category: 'Food & Delivery' },
    'Instacart Express': { cost: 9.99, category: 'Food & Delivery' },
    'Shipt': { cost: 9.99, category: 'Food & Delivery' },
    'HelloFresh': { cost: 69.99, category: 'Food & Delivery' },
    'Blue Apron': { cost: 59.99, category: 'Food & Delivery' },
    'Sunbasket': { cost: 11.99, category: 'Food & Delivery' },
    'Home Chef': { cost: 59.99, category: 'Food & Delivery' },
    'EveryPlate': { cost: 4.99, category: 'Food & Delivery' },
    'Marley Spoon': { cost: 89.99, category: 'Food & Delivery' },
    'Freshly': { cost: 60.99, category: 'Food & Delivery' },
    'Factor': { cost: 69.99, category: 'Food & Delivery' },
    'Green Chef': { cost: 79.99, category: 'Food & Delivery' },
    'Purple Carrot': { cost: 11.99, category: 'Food & Delivery' },
    'Sakara': { cost: 170, category: 'Food & Delivery' },
    'Territory Foods': { cost: 59, category: 'Food & Delivery' },
    'Gobble': { cost: 84.99, category: 'Food & Delivery' },
    'Daily Harvest': { cost: 59, category: 'Food & Delivery' },
    'ButcherBox': { cost: 149, category: 'Food & Delivery' },
    
    // News & Reading (20 services)
    'The New York Times': { cost: 6.25, category: 'News' },
    'The Wall Street Journal': { cost: 18.99, category: 'News' },
    'The Washington Post': { cost: 10, category: 'News' },
    'The Athletic': { cost: 9.99, category: 'News' },
    'Kindle Unlimited': { cost: 11.99, category: 'Reading' },
    'Scribd': { cost: 11.99, category: 'Reading' },
    'Audible': { cost: 14.95, category: 'Reading' },
    'Pocket': { cost: 4.99, category: 'Reading' },
    'Medium Member': { cost: 5, category: 'Reading' },
    'Blinkist': { cost: 14.99, category: 'Reading' },
    'Bookwire': { cost: 7.99, category: 'Reading' },
    'Marvel Unlimited': { cost: 9.99, category: 'Reading' },
    'Comixology Unlimited': { cost: 5.99, category: 'Reading' },
    'Spiegel Plus': { cost: 5.99, category: 'News' },
    'Reader\'s Digest': { cost: 19.99, category: 'Reading' },
    'The Economist': { cost: 13.99, category: 'News' },
    'Financial Times': { cost: 4.99, category: 'News' },
    'The Atlantic': { cost: 49.99, category: 'News' },
    'Politico Pro': { cost: 29, category: 'News' },
    'Bloomberg': { cost: 35, category: 'News' },
    
    // Software & Tools (20 services)
    'Scrivener': { cost: 49, category: 'Software' },
    'OmniFocus': { cost: 9.99, category: 'Software' },
    'Things': { cost: 9.99, category: 'Software' },
    'Bear': { cost: 1.49, category: 'Software' },
    'Fantastical': { cost: 4.99, category: 'Software' },
    'Day One': { cost: 2.92, category: 'Software' },
    'Ulysses': { cost: 5.99, category: 'Software' },
    'DEVONthink': { cost: 49, category: 'Software' },
    'Alfred': { cost: 19, category: 'Software' },
    'Bartender': { cost: 15, category: 'Software' },
    'CleanMyMac': { cost: 10, category: 'Software' },
    'Parallels': { cost: 49.99, category: 'Software' },
    'VMware Fusion': { cost: 39.99, category: 'Software' },
    'Sketch': { cost: 9, category: 'Software' },
    'Pixelmator': { cost: 4.99, category: 'Software' },
    'Affinity Designer': { cost: 54.99, category: 'Software' },
    'Reeder': { cost: 9.99, category: 'Software' },
    'NetNewsWire': { cost: 9.99, category: 'Software' },
    'MailButler': { cost: 9.95, category: 'Software' },
    'Clean Email': { cost: 9.99, category: 'Software' },
    
    // Development (20 services)
    'GitHub Pro': { cost: 4, category: 'Development' },
    'GitLab Premium': { cost: 19, category: 'Development' },
    'Bitbucket Premium': { cost: 6, category: 'Development' },
    'Heroku': { cost: 7, category: 'Development' },
    'DigitalOcean': { cost: 6, category: 'Development' },
    'AWS Lambda': { cost: 29, category: 'Development' },
    'Railway': { cost: 5, category: 'Development' },
    'Netlify': { cost: 9, category: 'Development' },
    'Vercel Pro': { cost: 20, category: 'Development' },
    'JetBrains': { cost: 149, category: 'Development' },
    'Linode': { cost: 5, category: 'Development' },
    'Lightsail': { cost: 3.50, category: 'Development' },
    'Cloudflare Workers': { cost: 5, category: 'Development' },
    'MongoDB Atlas': { cost: 9, category: 'Development' },
    'Redis Cloud': { cost: 10, category: 'Development' },
    'Database.com': { cost: 18, category: 'Development' },
    'Stripe': { cost: 2.9, category: 'Development' },
    'Twilio': { cost: 10, category: 'Development' },
    'Zapier': { cost: 20, category: 'Development' },
    'Ifttt Pro': { cost: 5, category: 'Development' },
    
    // Security (15 services)
    'NordVPN': { cost: 12.95, category: 'Security' },
    'ExpressVPN': { cost: 12.95, category: 'Security' },
    'Surfshark': { cost: 12.95, category: 'Security' },
    'ProtonVPN': { cost: 9.99, category: 'Security' },
    'ProtonMail': { cost: 4.99, category: 'Security' },
    'TunnelBear': { cost: 9.99, category: 'Security' },
    'CyberGhost': { cost: 12.99, category: 'Security' },
    'Private Internet Access': { cost: 11.95, category: 'Security' },
    'IPVanish': { cost: 10.99, category: 'Security' },
    'VyprVPN': { cost: 12.95, category: 'Security' },
    'Windscribe': { cost: 4.08, category: 'Security' },
    'Mullvad': { cost: 5.71, category: 'Security' },
    'StrongVPN': { cost: 10, category: 'Security' },
    'Kaspersky': { cost: 14.99, category: 'Security' },
    'McAfee': { cost: 89.99, category: 'Security' },
    
    // Creative (15 services)
    'Adobe Stock': { cost: 29.99, category: 'Creative' },
    'Shutterstock': { cost: 29.99, category: 'Creative' },
    'Getty Images': { cost: 175, category: 'Creative' },
    'Envato Elements': { cost: 16.50, category: 'Creative' },
    'Storyblocks': { cost: 15, category: 'Creative' },
    'Pond5': { cost: 49, category: 'Creative' },
    'Videvo': { cost: 29.99, category: 'Creative' },
    'AudioJungle': { cost: 16.50, category: 'Creative' },
    'Design Cuts': { cost: 19, category: 'Creative' },
    'Creative Market': { cost: 9.99, category: 'Creative' },
    'Dribbble Pro': { cost: 12, category: 'Creative' },
    'Behance Pro': { cost: 9.99, category: 'Creative' },
    'Adobe Portfolio': { cost: 9.99, category: 'Creative' },
    'Procreate': { cost: 9.99, category: 'Creative' },
    'Notebloc': { cost: 2.99, category: 'Creative' },
    
    // Dating (10 services)
    'Tinder Plus': { cost: 9.99, category: 'Dating' },
    'Tinder Gold': { cost: 29.99, category: 'Dating' },
    'Bumble Premium': { cost: 32.99, category: 'Dating' },
    'Hinge Preferred': { cost: 29.99, category: 'Dating' },
    'Match': { cost: 35.99, category: 'Dating' },
    'eHarmony': { cost: 35.90, category: 'Dating' },
    'Elite Singles': { cost: 44.95, category: 'Dating' },
    'Coffee Meets Bagel': { cost: 34.99, category: 'Dating' },
    'OkCupid A-List': { cost: 19.99, category: 'Dating' },
    'JDate': { cost: 29.99, category: 'Dating' },
    
    // Social Media (10 services)
    'Snapchat+': { cost: 3.99, category: 'Social Media' },
    'Discord Nitro': { cost: 9.99, category: 'Social Media' },
    'Twitter Blue': { cost: 8, category: 'Social Media' },
    'Reddit Premium': { cost: 5.99, category: 'Social Media' },
    'Facebook Stars': { cost: 99.99, category: 'Social Media' },
    'Instagram Blue': { cost: 11.99, category: 'Social Media' },
    'LinkedIn Premium': { cost: 29.99, category: 'Social Media' },
    'Telegram Premium': { cost: 3.99, category: 'Social Media' },
    'Viber Out': { cost: 1.99, category: 'Social Media' },
    'WhatsApp Business': { cost: 9.99, category: 'Social Media' },
    
    // Photo Editing (10 services)
    'Adobe Lightroom': { cost: 9.99, category: 'Photo Editing' },
    'VSCO': { cost: 19.99, category: 'Photo Editing' },
    'VSCO X': { cost: 7.99, category: 'Photo Editing' },
    'Lightroom Classic': { cost: 9.99, category: 'Photo Editing' },
    'Photoshop Express': { cost: 9.99, category: 'Photo Editing' },
    'Capture One': { cost: 24, category: 'Photo Editing' },
    'Skylum Luminar': { cost: 79, category: 'Photo Editing' },
    'DxO Photolab': { cost: 149, category: 'Photo Editing' },
    'On1 Photo RAW': { cost: 89.99, category: 'Photo Editing' },
    'Topaz Labs': { cost: 79, category: 'Photo Editing' }
};

function convertPrice(usdPrice) {
    return usdPrice * exchangeRates[currentCurrency].rate;
}

function formatCurrency(amount) {
    return `${exchangeRates[currentCurrency].symbol}${amount.toFixed(2)}`;
}

// Load subscriptions from localStorage
function loadSubscriptions() {
    try {
        const saved = localStorage.getItem('subscriblytics-data');
        if (saved) {
            subscriptions = JSON.parse(saved);
            render();
        }
        
        // Load saved currency
        const savedCurrency = localStorage.getItem('subscriblytics-currency');
        if (savedCurrency && exchangeRates[savedCurrency]) {
            currentCurrency = savedCurrency;
            currencySelector.value = savedCurrency;
        }
    } catch (error) {
        console.error('Error loading subscriptions:', error);
        subscriptions = [];
    }
}

function saveSubscriptions() {
    try {
        localStorage.setItem('subscriblytics-data', JSON.stringify(subscriptions));
    } catch (error) {
        console.error('Error saving subscriptions:', error);
    }
}

// === DOM Elements ===
const form = document.getElementById('subscription-form');
const subscriptionList = document.getElementById('subscription-list');
const summaryView = document.getElementById('summary-view');
const chartContainer = document.getElementById('chart-container');
const quickAddGrid = document.getElementById('quick-add-grid');
const serviceSearch = document.getElementById('service-search');
const currencySelector = document.getElementById('currency-selector');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');

// === Event Listeners ===
form.addEventListener('submit', handleFormSubmit);
subscriptionList.addEventListener('click', handleListClick);
serviceSearch.addEventListener('input', handleServiceSearch);
currencySelector.addEventListener('change', handleCurrencyChange);
categoryFilter.addEventListener('change', handleCategoryFilter);
sortFilter.addEventListener('change', handleSortFilter);

// Initialize
let filteredServices = { ...popularServices };
let selectedCategory = '';
let sortBy = 'name';

function initializeQuickAdd() {
    // Populate category filter
    const categories = [...new Set(Object.values(popularServices).map(s => s.category))].sort();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Add staggered animation to items
    document.addEventListener('DOMContentLoaded', () => {
        const items = document.querySelectorAll('.quick-add-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.02}s`;
        });
    });
    
    renderQuickAdd();
}

function handleServiceSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    let filtered = {};
    
    Object.keys(popularServices).forEach(name => {
        const service = popularServices[name];
        const matchesSearch = query === '' || 
            name.toLowerCase().includes(query) || 
            service.category.toLowerCase().includes(query);
        const matchesCategory = selectedCategory === '' || service.category === selectedCategory;
        
        if (matchesSearch && matchesCategory) {
            filtered[name] = service;
        }
    });
    
    filteredServices = filtered;
    renderQuickAdd();
}

function handleCurrencyChange(e) {
    currentCurrency = e.target.value;
    // Save to localStorage
    localStorage.setItem('subscriblytics-currency', currentCurrency);
    render();
    renderQuickAdd();
}

function handleCategoryFilter(e) {
    selectedCategory = e.target.value;
    handleServiceSearch({ target: { value: serviceSearch.value } });
}

function handleSortFilter(e) {
    sortBy = e.target.value;
    renderQuickAdd();
}

function renderQuickAdd() {
    quickAddGrid.innerHTML = '';
    
    let sortedServices = Object.entries(filteredServices);
    
    // Apply sorting
    switch(sortBy) {
        case 'name':
            sortedServices.sort(([aName], [bName]) => aName.localeCompare(bName));
            break;
        case 'price-low':
            sortedServices.sort(([, a], [, b]) => a.cost - b.cost);
            break;
        case 'price-high':
            sortedServices.sort(([, a], [, b]) => b.cost - a.cost);
            break;
        case 'category':
            sortedServices.sort(([aName, a], [bName, b]) => {
                const categoryCompare = a.category.localeCompare(b.category);
                return categoryCompare !== 0 ? categoryCompare : aName.localeCompare(bName);
            });
            break;
    }
    
    sortedServices.forEach(([name, data]) => {
        const item = document.createElement('div');
        item.className = 'quick-add-item';
        
        const displayPrice = convertPrice(data.cost);
        
        item.innerHTML = `
            <div class="quick-add-name">${name}</div>
            <div class="quick-add-price">${formatCurrency(displayPrice)}/mo</div>
            <span class="quick-add-category">${data.category}</span>
        `;
        
        item.addEventListener('click', () => showUsageModal(name, data));
        quickAddGrid.appendChild(item);
    });
}

function showUsageModal(name, data) {
    if (subscriptions.find(sub => sub.name === name)) {
        showNotification(`${name} is already in your subscriptions!`, 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add ${name}</h3>
            <p class="modal-price">${formatCurrency(convertPrice(data.cost))}/month</p>
            <form id="usage-form">
                <div class="form-group">
                    <label for="modal-usage">How many times do you use this per month?</label>
                    <input type="number" id="modal-usage" min="0" step="0.1" value="1" required>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-primary">Add</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    modal.querySelector('#usage-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const usage = parseFloat(modal.querySelector('#modal-usage').value);
        
        const subscription = {
            id: Date.now().toString(),
            name: name,
            cost: data.cost,
            billingCycle: 'monthly',
            usage: usage,
            usageFrequency: 'per-month'
        };

        subscriptions.push(subscription);
        saveSubscriptions();
        render();
        modal.remove();
        showNotification(`${name} added successfully!`, 'success');
    });
}

function calculateCostPerUse(subscription) {
    let monthlyCost = subscription.billingCycle === 'annually' ? subscription.cost / 12 : subscription.cost;
    
    let monthlyUsage;
    switch (subscription.usageFrequency) {
        case 'per-day':
            monthlyUsage = subscription.usage * 30.44;
            break;
        case 'per-week':
            monthlyUsage = subscription.usage * 4.345;
            break;
        case 'per-month':
            monthlyUsage = subscription.usage;
            break;
        default:
            monthlyUsage = 0;
    }

    return monthlyUsage === 0 ? monthlyCost : monthlyCost / monthlyUsage;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const cost = parseFloat(formData.get('cost'));
        const usage = parseFloat(formData.get('usage'));
        
        if (!name || isNaN(cost) || cost < 0 || isNaN(usage) || usage < 0) {
            throw new Error('Invalid input data');
        }
        
        const subscription = {
            id: Date.now().toString(),
            name: name,
            cost: cost,
            billingCycle: formData.get('billing-cycle'),
            usage: usage,
            usageFrequency: formData.get('usage-frequency')
        };

        subscriptions.push(subscription);
        saveSubscriptions();
        render();
        form.reset();
        showNotification('Subscription added successfully!', 'success');
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error adding subscription. Please check your inputs.', 'error');
    }
}

function handleListClick(e) {
    if (e.target.classList.contains('btn-delete')) {
        const card = e.target.closest('.subscription-card');
        if (!card) return;
        
        const subscriptionId = card.dataset.id;
        const subscription = subscriptions.find(sub => sub.id === subscriptionId);
        
        if (subscription && confirm(`Remove ${subscription.name}?`)) {
            subscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
            saveSubscriptions();
            render();
            showNotification('Subscription removed', 'success');
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function render() {
    clearView();
    
    if (subscriptions.length === 0) {
        renderEmptyState();
    } else {
        renderSummary();
        renderChart();
        renderComparison();
        renderSubscriptionList();
    }
}

function clearView() {
    subscriptionList.innerHTML = '';
    summaryView.innerHTML = '';
    chartContainer.innerHTML = '';
}

function renderEmptyState() {
    summaryView.innerHTML = `
        <div class="empty-state">
            <h3>No subscriptions yet</h3>
            <p>Add subscriptions to get started!</p>
        </div>
    `;
}

function renderSummary() {
    let totalMonthlyCost = 0;
    subscriptions.forEach(sub => {
        const monthlyCost = sub.billingCycle === 'annually' ? sub.cost / 12 : sub.cost;
        totalMonthlyCost += monthlyCost;
    });

    const yearlyCost = totalMonthlyCost * 12;
    const dailyCost = totalMonthlyCost / 30;

    summaryView.innerHTML = `
        <h2>Overview</h2>
        <div class="summary-stats">
            <div class="stat-box">
                <strong>${formatCurrency(convertPrice(totalMonthlyCost))}</strong>
                <span>Monthly Cost</span>
            </div>
            <div class="stat-box">
                <strong>${formatCurrency(convertPrice(yearlyCost))}</strong>
                <span>Yearly Cost</span>
            </div>
            <div class="stat-box">
                <strong>${formatCurrency(convertPrice(dailyCost))}</strong>
                <span>Daily Cost</span>
            </div>
            <div class="stat-box">
                <strong>${subscriptions.length}</strong>
                <span>Subscriptions</span>
            </div>
        </div>
    `;
}

function renderChart() {
    if (subscriptions.length === 0) return;

    chartContainer.innerHTML = `
        <h3>Monthly Cost Distribution</h3>
        <div class="chart-wrapper">
            <canvas id="cost-chart"></canvas>
        </div>
    `;

    setTimeout(() => {
        try {
            const canvas = document.getElementById('cost-chart');
            if (!canvas) return;
            
            const wrapper = canvas.parentElement;
            canvas.width = wrapper.clientWidth - 2;
            canvas.height = 250;
            
            const context = canvas.getContext('2d');
            
            const monthlyCosts = subscriptions.map(sub => ({
                name: sub.name,
                cost: sub.billingCycle === 'annually' ? sub.cost / 12 : sub.cost
            })).sort((a, b) => b.cost - a.cost);
            
            if (monthlyCosts.length === 0) return;
            
            const maxCost = Math.max(...monthlyCosts.map(item => item.cost));
            const padding = 80;
            const chartWidth = canvas.width - padding * 2;
            const chartHeight = canvas.height - padding * 2;
            const itemCount = monthlyCosts.length;
            const barSpacing = Math.min(12, chartWidth / itemCount / 2);
            const barWidth = Math.max(20, (chartWidth / itemCount) - barSpacing * 2);
            
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            monthlyCosts.forEach((item, index) => {
                const barHeight = Math.max(5, (item.cost / maxCost) * chartHeight);
                const x = padding + index * (barWidth + barSpacing);
                const y = canvas.height - padding - barHeight;
                
                context.fillStyle = 'rgba(0, 0, 0, 0.85)';
                context.fillRect(x, y, barWidth, barHeight);
                
                if (barHeight > 30) {
                    const displayCost = convertPrice(item.cost);
                    context.fillStyle = '#fff';
                    context.font = 'bold 10px Inter';
                    context.textAlign = 'center';
                    context.fillText(formatCurrency(displayCost), x + barWidth / 2, y + barHeight / 2 + 3);
                }
                
                context.fillStyle = '#666';
                context.font = '9px Inter';
                context.textAlign = 'center';
                const label = item.name.substring(0, Math.min(12, 40 / barWidth));
                context.fillText(label, x + barWidth / 2, canvas.height - padding / 2 + 3);
            });
            
            context.strokeStyle = '#e5e5e5';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(padding, padding / 2);
            context.lineTo(padding, canvas.height - padding);
            context.lineTo(canvas.width - padding, canvas.height - padding);
            context.stroke();
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    }, 50);
}

function renderComparison() {
    if (subscriptions.length < 2) return;

    const costsPerUse = subscriptions.map(sub => ({
        name: sub.name,
        costPerUse: calculateCostPerUse(sub)
    }));

    const sorted = [...costsPerUse].sort((a, b) => a.costPerUse - b.costPerUse);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const comparisonHTML = `
        <div class="comparison-section">
            <h3>Value Comparison</h3>
            <div class="comparison-grid">
                <div class="comparison-item best">
                    <div class="comparison-item-label">Best Value</div>
                    <div class="comparison-item-name">${best.name}</div>
                    <div class="comparison-item-value">${formatCurrency(convertPrice(best.costPerUse))} per use</div>
                </div>
                <div class="comparison-item worst">
                    <div class="comparison-item-label">Worst Value</div>
                    <div class="comparison-item-name">${worst.name}</div>
                    <div class="comparison-item-value">${formatCurrency(convertPrice(worst.costPerUse))} per use</div>
                </div>
            </div>
        </div>
    `;
    
    chartContainer.insertAdjacentHTML('beforeend', comparisonHTML);
}

function renderSubscriptionList() {
    subscriptionList.innerHTML = '';
    
    const sortedSubs = [...subscriptions].sort((a, b) => 
        calculateCostPerUse(a) - calculateCostPerUse(b)
    );
    
    sortedSubs.forEach((subscription, index) => {
        const costPerUse = calculateCostPerUse(subscription);
        const valueCategory = getValueCategory(costPerUse);
        
        const card = document.createElement('div');
        card.className = `subscription-card ${valueCategory}`;
        card.dataset.id = subscription.id;
        card.style.animationDelay = `${index * 0.05}s`;
        
        const monthlyCost = subscription.billingCycle === 'annually' 
            ? subscription.cost / 12 
            : subscription.cost;
        
        const displayMonthlyCost = convertPrice(monthlyCost);
        const displayCostPerUse = convertPrice(costPerUse);
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(subscription.name)}</h3>
                <span class="card-cost">${formatCurrency(displayMonthlyCost)}/mo</span>
            </div>
            <div class="card-details">
                <div class="card-metric">
                    <div class="card-metric-label">Cost Per Use</div>
                    <div class="card-metric-value">${formatCurrency(displayCostPerUse)}</div>
                </div>
                <div class="card-metric">
                    <div class="card-metric-label">Usage</div>
                    <div class="card-metric-value">${formatUsage(subscription)}</div>
                </div>
                <div class="card-metric">
                    <div class="card-metric-label">Monthly Cost</div>
                    <div class="card-metric-value">${formatCurrency(displayMonthlyCost)}</div>
                </div>
            </div>
            <div class="card-footer">
                <span>${getValueDescription(valueCategory)}</span>
                <button class="btn-delete"><span>Delete</span></button>
            </div>
        `;
        
        subscriptionList.appendChild(card);
    });
}

function getValueCategory(costPerUse) {
    if (costPerUse < 0.1) return 'excellent';
    if (costPerUse < 0.5) return 'good';
    if (costPerUse < 1.0) return 'moderate';
    return 'poor';
}

function getValueDescription(category) {
    const descriptions = {
        'excellent': '✓ Excellent',
        'good': '✓ Good',
        'moderate': '⚠ Moderate',
        'poor': '✗ Poor Value'
    };
    return descriptions[category] || '';
}

function formatUsage(subscription) {
    const usage = subscription.usage;
    switch (subscription.usageFrequency) {
        case 'per-day':
            return `${usage}x/day`;
        case 'per-week':
            return `${usage}x/week`;
        case 'per-month':
            return `${usage}x/month`;
        default:
            return 'N/A';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

initializeQuickAdd();
loadSubscriptions();
