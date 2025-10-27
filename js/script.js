// === Currency Exchange Rates ===
let exchangeRates = {
    USD: { symbol: '$', rate: 1, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
    CAD: { symbol: 'C$', rate: 1.35, name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
    JPY: { symbol: '¥', rate: 150, name: 'Japanese Yen' },
    CHF: { symbol: 'CHF', rate: 0.87, name: 'Swiss Franc' },
    CNY: { symbol: '¥', rate: 7.12, name: 'Chinese Yuan' },
    INR: { symbol: '₹', rate: 83.25, name: 'Indian Rupee' },
    BRL: { symbol: 'R$', rate: 5.01, name: 'Brazilian Real' },
    MXN: { symbol: '$', rate: 18.52, name: 'Mexican Peso' },
    KRW: { symbol: '₩', rate: 1338, name: 'South Korean Won' },
    SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
    NZD: { symbol: 'NZ$', rate: 1.62, name: 'New Zealand Dollar' },
    HKD: { symbol: 'HK$', rate: 7.82, name: 'Hong Kong Dollar' },
    NOK: { symbol: 'kr', rate: 10.52, name: 'Norwegian Krone' },
    SEK: { symbol: 'kr', rate: 10.34, name: 'Swedish Krona' },
    DKK: { symbol: 'kr', rate: 6.86, name: 'Danish Krone' },
    PLN: { symbol: 'zł', rate: 4.04, name: 'Polish Zloty' },
    TRY: { symbol: '₺', rate: 32.45, name: 'Turkish Lira' },
    RUB: { symbol: '₽', rate: 91.25, name: 'Russian Ruble' },
    ZAR: { symbol: 'R', rate: 18.92, name: 'South African Rand' },
    THB: { symbol: '฿', rate: 35.82, name: 'Thai Baht' },
    AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
    SAR: { symbol: '﷼', rate: 3.75, name: 'Saudi Riyal' },
    IDR: { symbol: 'Rp', rate: 15650, name: 'Indonesian Rupiah' },
    MYR: { symbol: 'RM', rate: 4.71, name: 'Malaysian Ringgit' },
    PHP: { symbol: '₱', rate: 55.62, name: 'Philippine Peso' }
};

let currentCurrency = 'USD';

// Fetch live exchange rates every 5 seconds (using free keyless API)
let rateUpdateTimer = null;
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate.host/latest?base=USD');
        const data = await response.json();

        if (data.success && data.rates) {
            const oldRates = { ...exchangeRates };
            // Update rates for all currencies
            Object.keys(exchangeRates).forEach(currency => {
                if (data.rates[currency]) {
                    exchangeRates[currency].rate = data.rates[currency];
                }
            });
            
            // Only re-render if rates actually changed
            let ratesChanged = false;
            for (let key in exchangeRates) {
                if (oldRates[key] && Math.abs(exchangeRates[key].rate - oldRates[key].rate) > 0.001) {
                    ratesChanged = true;
                    break;
                }
            }

            if (ratesChanged && subscriptions.length > 0) {
                render();
                renderQuickAdd();
                renderChart(); // Update chart in real-time
            }
        }
    } catch (error) {
        console.log('Exchange rate fetch failed, using cached rates:', error);
        // Continue with existing rates
    }
}

// Start fetching rates every 5 seconds
rateUpdateTimer = setInterval(fetchExchangeRates, 5000);

// Initial fetch
fetchExchangeRates();

// Detect user's country and set default currency
async function detectUserCurrency() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Country to currency mapping
        const countryToCurrency = {
            'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'AU': 'AUD',
            'JP': 'JPY', 'CH': 'CHF', 'CN': 'CNY', 'IN': 'INR',
            'BR': 'BRL', 'MX': 'MXN', 'KR': 'KRW', 'SG': 'SGD',
            'NZ': 'NZD', 'HK': 'HKD', 'NO': 'NOK', 'SE': 'SEK',
            'DK': 'DKK', 'PL': 'PLN', 'TR': 'TRY', 'RU': 'RUB',
            'ZA': 'ZAR', 'TH': 'THB', 'AE': 'AED', 'SA': 'SAR',
            'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP', 'DE': 'EUR',
            'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
            'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'FI': 'EUR',
            'GR': 'EUR', 'IE': 'EUR'
        };
        
        const detectedCurrency = countryToCurrency[data.country_code] || 'USD';
        
        // Only set if user hasn't manually set a currency
        if (!localStorage.getItem('selected-currency')) {
            currentCurrency = detectedCurrency;
            const currencySelector = document.getElementById('currency-selector');
            if (currencySelector) {
                currencySelector.value = detectedCurrency;
            }
            render();
        }
    } catch (error) {
        console.log('Could not detect location, using USD as default');
    }
}

detectUserCurrency();

// === Data Management ===
let subscriptions = [];
let logoCache = {};

// Comprehensive logo mapping using Wikipedia Commons (CORS-friendly, no API needed)
const logoMapping = {
    // Streaming Services
    'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    'Disney+': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    'Hulu': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg',
    'Amazon Prime': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video_logo.svg',
    'HBO Max': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/HBO_Max_logo.svg',
    'Paramount': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount%2B_logo.svg',
    'Peacock': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/NBCUniversal_Peacock_logo.svg',
    'Apple TV': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Apple_TV_Plus.svg',
    'Crunchyroll': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Crunchyroll_Logo.svg',
    'YouTube TV': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon.svg',
    
    // Music Services
    'Spotify': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    'Apple Music': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Apple_Music_Logo.svg',
    'YouTube Music': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon.svg',
    'Tidal': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Tidal_logo.svg',
    'Pandora': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Pandora_media_logo.svg',
    'SoundCloud': 'https://upload.wikimedia.org/wikipedia/commons/1/17/SoundCloud_Logo.svg',
    
    // Cloud Storage
    'Dropbox': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg',
    'Google Drive': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon.svg',
    'OneDrive': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/OneDrive_logo.svg',
    'Box': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Box_logo.svg',
    'iCloud': 'https://upload.wikimedia.org/wikipedia/commons/a/a1/iCloud_logo.svg',
    
    // Productivity
    'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    'Adobe': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Adobe_Systems_logo_and_wordmark.svg',
    'Notion': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    'Evernote': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Evernote_logo.svg',
    'Todoist': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Todoist_Logo.svg',
    'Grammarly': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Grammarly_logo.svg',
    'Zoom': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom.Communications_logo.svg',
    'Canva': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Canva_logo.svg',
    'Figma': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
    'Slack': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg',
    'Asana': 'https://upload.wikimedia.org/wikipedia/commons/8/83/Asana_logo.svg',
    'Monday': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Monday.com_logo.svg',
    'Trello': 'https://upload.wikimedia.org/wikipedia/commons/7/73/Trello_logo.svg',
    
    // Gaming
    'Xbox': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_game_logo.svg',
    'PlayStation': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo.svg',
    'Nintendo': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Nintendo_logo.svg',
    'Steam': 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
    'Discord': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Discord_logo.svg',
    'Twitch': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg',
    'Roblox': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Roblox_Logo.svg',
    'Epic Games': 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg',
    'Ubisoft': 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Ubisoft_logo.svg',
    'EA': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/EA_logo.svg',
    
    // Fitness
    'Peloton': 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Peloton_logo.svg',
    'MyFitnessPal': 'https://upload.wikimedia.org/wikipedia/commons/1/13/MyFitnessPal_Logo.svg',
    'Strava': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Strava_Logo.svg',
    'Calm': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Calm_logo.svg',
    'Headspace': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Headspace_logo.svg',
    
    // Learning
    'MasterClass': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/MasterClass_Logo.svg',
    'Duolingo': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Duolingo_logo.svg',
    'Coursera': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
    'Skillshare': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Skillshare_logo.svg',
    'LinkedIn': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    'Udemy': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Udemy_logo.svg',
    
    // Food & Delivery
    'Uber Eats': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Uber_Eats_2018_logo.svg',
    'DoorDash': 'https://upload.wikimedia.org/wikipedia/commons/b/be/DoorDash_Logo.svg',
    'Grubhub': 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Grubhub_logo.svg',
    'Instacart': 'https://upload.wikimedia.org/wikipedia/commons/9/99/Instacart_logo.svg',
    'HelloFresh': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/HelloFresh_logo.svg',
    
    // Security
    'NordVPN': 'https://upload.wikimedia.org/wikipedia/commons/9/95/NordVPN_logo_icon.svg',
    'ExpressVPN': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/ExpressVPN_logo.svg',
    '1Password': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/1Password_company_logo.svg',
    'LastPass': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/LastPass_logo.svg',
    
    // News
    'New York Times': 'https://upload.wikimedia.org/wikipedia/commons/7/77/The_New_York_Times_logo.png',
    'Wall Street Journal': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/The_Wall_Street_Journal_logo.svg',
    'Washington Post': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Washington_Post_Logo.svg'
};

function getCompanyLogo(companyName) {
    // Try exact match first
    if (logoMapping[companyName]) {
        return logoMapping[companyName];
    }
    
    // Try partial matches
    for (const [serviceName, logoUrl] of Object.entries(logoMapping)) {
        if (companyName.toLowerCase().includes(serviceName.toLowerCase()) || 
            serviceName.toLowerCase().includes(companyName.toLowerCase())) {
            return logoUrl;
        }
    }
    
    // Try getting company name from subscription (handle tier suffixes)
    const baseName = companyName.split(' - ')[0].split(' Basic')[0].split(' Standard')[0].split(' Premium')[0];
    if (logoMapping[baseName]) {
        return logoMapping[baseName];
    }
    
    return null;
}

// Preload logos for faster display
function preloadLogos() {
    const logosToPreload = Object.values(logoMapping).filter(url => url);
    logosToPreload.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Start preloading logos on page load
preloadLogos();

// Popular Services with Real Prices (USD) - grouped by company with tiers
const popularServices = {
    // Streaming
    'Netflix': { 
        options: [
            { tier: 'Basic', cost: 9.99 },
            { tier: 'Standard', cost: 15.49 },
            { tier: 'Premium', cost: 22.99 }
        ],
        category: 'Streaming'
    },
    'Disney+': { 
        options: [
            { tier: 'Monthly', cost: 13.99 },
            { tier: 'Annual', cost: 139.99 }
        ],
        category: 'Streaming'
    },
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
    'Spotify': {
        options: [
            { tier: 'Individual', cost: 10.99 },
            { tier: 'Family', cost: 16.99 },
            { tier: 'Student', cost: 5.99 }
        ],
        category: 'Music'
    },
    'Apple Music': {
        options: [
            { tier: 'Individual', cost: 10.99 },
            { tier: 'Family', cost: 16.99 }
        ],
        category: 'Music'
    },
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
    'iCloud': {
        options: [
            { tier: '50GB', cost: 0.99 },
            { tier: '200GB', cost: 2.99 },
            { tier: '2TB', cost: 9.99 }
        ],
        category: 'Cloud Storage'
    },
    'Dropbox': {
        options: [
            { tier: 'Plus', cost: 9.99 },
            { tier: 'Professional', cost: 19.99 }
        ],
        category: 'Cloud Storage'
    },
    'Google Drive': {
        options: [
            { tier: '100GB', cost: 1.99 },
            { tier: '200GB', cost: 2.99 },
            { tier: '2TB', cost: 9.99 }
        ],
        category: 'Cloud Storage'
    },
    'OneDrive': {
        options: [
            { tier: '100GB', cost: 1.99 },
            { tier: '1TB', cost: 6.99 }
        ],
        category: 'Cloud Storage'
    },
    'Box': {
        options: [
            { tier: 'Personal', cost: 14 },
            { tier: 'Business', cost: 20 }
        ],
        category: 'Cloud Storage'
    },
    'pCloud': { cost: 4.99, category: 'Cloud Storage' },
    'Tresorit': { cost: 10.42, category: 'Cloud Storage' },
    'Sync': { cost: 8, category: 'Cloud Storage' },
    'Mega': {
        options: [
            { tier: 'Pro', cost: 6.99 },
            { tier: 'Business', cost: 12.99 }
        ],
        category: 'Cloud Storage'
    },
    'IceDrive': { cost: 4.17, category: 'Cloud Storage' },
    'Internxt': { cost: 4.17, category: 'Cloud Storage' },
    'Koofr': { cost: 5.99, category: 'Cloud Storage' },
    'Syncplicity': { cost: 15, category: 'Cloud Storage' },
    'Filen': { cost: 11.99, category: 'Cloud Storage' },
    
    // Productivity (30 services)
    'Microsoft 365': {
        options: [
            { tier: 'Personal', cost: 6.99 },
            { tier: 'Family', cost: 9.99 },
            { tier: 'Business', cost: 12.50 }
        ],
        category: 'Productivity'
    },
    'Adobe Creative Cloud': {
        options: [
            { tier: 'Single App', cost: 22.99 },
            { tier: 'All Apps', cost: 52.99 },
            { tier: 'Students', cost: 19.99 }
        ],
        category: 'Productivity'
    },
    'Adobe Photoshop': { cost: 22.99, category: 'Productivity' },
    'Adobe Illustrator': { cost: 22.99, category: 'Productivity' },
    'Adobe Premiere Pro': { cost: 22.99, category: 'Productivity' },
    'Notion': {
        options: [
            { tier: 'Plus', cost: 8 },
            { tier: 'Business', cost: 15 },
            { tier: 'Enterprise', cost: 20 }
        ],
        category: 'Productivity'
    },
    'Evernote': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Personal', cost: 7.99 },
            { tier: 'Professional', cost: 14.99 }
        ],
        category: 'Productivity'
    },
    'Todoist': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Pro', cost: 4 },
            { tier: 'Business', cost: 6 }
        ],
        category: 'Productivity'
    },
    'Grammarly': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Premium', cost: 12 },
            { tier: 'Business', cost: 15 }
        ],
        category: 'Productivity'
    },
    '1Password': {
        options: [
            { tier: 'Individual', cost: 2.99 },
            { tier: 'Family', cost: 4.99 }
        ],
        category: 'Productivity'
    },
    'LastPass': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Premium', cost: 3 },
            { tier: 'Business', cost: 7 }
        ],
        category: 'Productivity'
    },
    'Dashlane': { cost: 4.99, category: 'Productivity' },
    'Calendly Premium': { cost: 10, category: 'Productivity' },
    'Zoom': {
        options: [
            { tier: 'Basic', cost: 0 },
            { tier: 'Pro', cost: 14.99 },
            { tier: 'Business', cost: 19.99 }
        ],
        category: 'Productivity'
    },
    'Canva': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Pro', cost: 14.99 },
            { tier: 'Enterprise', cost: 30 }
        ],
        category: 'Productivity'
    },
    'Figma': {
        options: [
            { tier: 'Starter', cost: 0 },
            { tier: 'Professional', cost: 12 },
            { tier: 'Enterprise', cost: 45 }
        ],
        category: 'Productivity'
    },
    'Slack': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Pro', cost: 7.25 },
            { tier: 'Business', cost: 12.50 }
        ],
        category: 'Productivity'
    },
    'Asana': {
        options: [
            { tier: 'Personal', cost: 0 },
            { tier: 'Starter', cost: 10.99 },
            { tier: 'Advanced', cost: 24.99 }
        ],
        category: 'Productivity'
    },
    'Monday': {
        options: [
            { tier: 'Individual', cost: 0 },
            { tier: 'Basic', cost: 8 },
            { tier: 'Standard', cost: 10 },
            { tier: 'Pro', cost: 16 }
        ],
        category: 'Productivity'
    },
    'ClickUp': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Unlimited', cost: 5 },
            { tier: 'Business', cost: 12 }
        ],
        category: 'Productivity'
    },
    'Trello': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Standard', cost: 5 },
            { tier: 'Premium', cost: 10 }
        ],
        category: 'Productivity'
    },
    'Wrike': { cost: 9.80, category: 'Productivity' },
    'Airtable': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Plus', cost: 10 },
            { tier: 'Pro', cost: 20 }
        ],
        category: 'Productivity'
    },
    'Monday.com Business': { cost: 16, category: 'Productivity' },
    'Teamwork': { cost: 10, category: 'Productivity' },
    'Basecamp': { cost: 15, category: 'Productivity' },
    'Smartsheet': { cost: 14, category: 'Productivity' },
    
    // Gaming (25 services)
    'Xbox Game Pass': {
        options: [
            { tier: 'Standard', cost: 10.99 },
            { tier: 'Ultimate', cost: 16.99 }
        ],
        category: 'Gaming'
    },
    'PlayStation Plus': {
        options: [
            { tier: 'Essential', cost: 9.99 },
            { tier: 'Extra', cost: 14.99 },
            { tier: 'Premium', cost: 17.99 }
        ],
        category: 'Gaming'
    },
    'Nintendo Switch Online': {
        options: [
            { tier: 'Individual', cost: 3.99 },
            { tier: 'Family', cost: 7.99 },
            { tier: 'Expansion Pack', cost: 49.99 }
        ],
        category: 'Gaming'
    },
    'EA Play': { cost: 4.99, category: 'Gaming' },
    'GeForce Now': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Priority', cost: 9.99 },
            { tier: 'Ultimate', cost: 19.99 }
        ],
        category: 'Gaming'
    },
    'Roblox': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Premium $5', cost: 4.99 },
            { tier: 'Premium $10', cost: 9.99 }
        ],
        category: 'Gaming'
    },
    'Ubisoft+': {
        options: [
            { tier: 'Essentials', cost: 7.99 },
            { tier: 'Multi Access', cost: 14.99 }
        ],
        category: 'Gaming'
    },
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
    'Peloton': {
        options: [
            { tier: 'App', cost: 12.99 },
            { tier: 'All Access', cost: 44 }
        ],
        category: 'Fitness'
    },
    'Apple Fitness+': { cost: 9.99, category: 'Fitness' },
    'Headspace': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Plus', cost: 12.99 }
        ],
        category: 'Fitness'
    },
    'Calm': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Premium', cost: 14.99 }
        ],
        category: 'Fitness'
    },
    'MyFitnessPal': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Premium', cost: 9.99 },
            { tier: 'Premium+', cost: 19.99 }
        ],
        category: 'Fitness'
    },
    'Strava': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Subscription', cost: 11.99 }
        ],
        category: 'Fitness'
    },
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
    'MasterClass': {
        options: [
            { tier: 'Standard', cost: 15 },
            { tier: 'Duo', cost: 20 },
            { tier: 'Family', cost: 23 }
        ],
        category: 'Learning'
    },
    'Skillshare': {
        options: [
            { tier: 'Monthly', cost: 32 },
            { tier: 'Annual', cost: 168 }
        ],
        category: 'Learning'
    },
    'LinkedIn Learning': {
        options: [
            { tier: 'Monthly', cost: 39.99 },
            { tier: 'Annual', cost: 292.80 }
        ],
        category: 'Learning'
    },
    'Udemy': {
        options: [
            { tier: 'Free Courses', cost: 0 },
            { tier: 'Personal', cost: 16.99 },
            { tier: 'Business', cost: 199 }
        ],
        category: 'Learning'
    },
    'Duolingo': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Super', cost: 6.99 },
            { tier: 'Max', cost: 12.99 }
        ],
        category: 'Learning'
    },
    'Babbel': { cost: 13.99, category: 'Learning' },
    'Rosetta Stone': { cost: 35.97, category: 'Learning' },
    'Coursera': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Plus', cost: 59 },
            { tier: 'Guided', cost: 399 }
        ],
        category: 'Learning'
    },
    'Brilliant': { cost: 24.99, category: 'Learning' },
    'Codecademy': {
        options: [
            { tier: 'Free', cost: 0 },
            { tier: 'Pro', cost: 39.99 }
        ],
        category: 'Learning'
    },
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
    'Uber Eats': {
        options: [
            { tier: 'Pass', cost: 9.99 },
            { tier: 'Eats Pass +', cost: 15.99 }
        ],
        category: 'Food & Delivery'
    },
    'DoorDash': {
        options: [
            { tier: 'DashPass', cost: 9.99 }
        ],
        category: 'Food & Delivery'
    },
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
    if (!usdPrice || isNaN(usdPrice)) return 0;
    const rate = exchangeRates[currentCurrency]?.rate || 1;
    return usdPrice * rate;
}

function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return `${exchangeRates[currentCurrency].symbol}0.00`;
    const symbol = exchangeRates[currentCurrency]?.symbol || '$';
    return `${symbol}${amount.toFixed(2)}`;
}

function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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
    // Force re-render everything to update currency
    render();
    renderQuickAdd();
    
    // Re-render chart if it exists
    renderChart();
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
        
        // Get cost - either direct or from options
        let cost = data.cost || (data.options && data.options[0].cost);
        const displayPrice = convertPrice(cost);
        
        // Get company logo
        const baseName = name.split(' ')[0]; // Get first word for logo matching
        const logoUrl = getCompanyLogo(name);
        const logoHTML = logoUrl ? `<img src="${logoUrl}" alt="${name}" class="company-logo-small" onerror="this.style.display='none'">` : '';
        
        // Show price range if multiple tiers
        let priceText = `${formatCurrency(displayPrice)}/mo`;
        if (data.options && data.options.length > 1) {
            const minCost = Math.min(...data.options.map(o => o.cost));
            const maxCost = Math.max(...data.options.map(o => o.cost));
            priceText = `${formatCurrency(convertPrice(minCost))} - ${formatCurrency(convertPrice(maxCost))}/mo`;
        }
        
        item.innerHTML = `
            ${logoHTML}
            <div style="flex: 1;">
            <div class="quick-add-name">${name}</div>
                <div class="quick-add-price">${priceText}</div>
            <span class="quick-add-category">${data.category}</span>
            </div>
        `;
        
        item.addEventListener('click', () => showUsageModal(name, data));
        quickAddGrid.appendChild(item);
    });
}

function showUsageModal(name, data) {
    // Check if already exists (considering tiers)
    const checkName = data.options ? name : name.split(' - ')[0];
    if (subscriptions.find(sub => sub.name.split(' - ')[0] === checkName)) {
        showNotification(`${name} is already in your subscriptions!`, 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    let cost = data.cost || (data.options && data.options[0].cost);
    let optionsHTML = '';
    
    if (data.options && data.options.length > 0) {
        optionsHTML = `
            <div class="form-group">
                <label for="modal-tier">Select Tier/Plan</label>
                <select id="modal-tier" required>
                    ${data.options.map((option, idx) => `
                        <option value="${idx}" ${idx === 0 ? 'selected' : ''}>
                            ${option.tier} - ${formatCurrency(convertPrice(option.cost))}/mo
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
        cost = data.options[0].cost;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add ${name}</h3>
            <p class="modal-price">${formatCurrency(convertPrice(cost))}/month</p>
            <form id="usage-form">
                ${optionsHTML}
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
    
    // Update price when tier changes
    if (data.options) {
        const tierSelect = modal.querySelector('#modal-tier');
        const priceDisplay = modal.querySelector('.modal-price');
        tierSelect.addEventListener('change', () => {
            const selectedIdx = parseInt(tierSelect.value);
            const selectedOption = data.options[selectedIdx];
            cost = selectedOption.cost;
            priceDisplay.textContent = `${formatCurrency(convertPrice(cost))}/month`;
        });
    }
    
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    modal.querySelector('#usage-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const usage = parseFloat(modal.querySelector('#modal-usage').value);
        let finalName = name;
        let finalCost = cost;
        
        if (data.options) {
            const tierSelect = modal.querySelector('#modal-tier');
            const selectedIdx = parseInt(tierSelect.value);
            const selectedOption = data.options[selectedIdx];
            finalName = `${name} - ${selectedOption.tier}`;
            finalCost = selectedOption.cost;
        }
        
        const subscription = {
            id: Date.now().toString(),
            name: finalName,
            cost: finalCost,
            billingCycle: 'monthly',
            usage: usage,
            usageFrequency: 'per-month'
        };

        subscriptions.push(subscription);
        saveSubscriptions();
        render();
        modal.remove();
        showNotification(`${finalName} added successfully!`, 'success');
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
    
    if (e.target.classList.contains('btn-edit')) {
        const card = e.target.closest('.subscription-card');
        if (!card) return;
        
        const subscriptionId = card.dataset.id;
        const subscription = subscriptions.find(sub => sub.id === subscriptionId);
        
        if (subscription) {
            showEditModal(subscription);
        }
    }
}

function showEditModal(subscription) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h3>Edit Subscription</h3>
            <form id="edit-form">
                <div class="form-group">
                    <label for="edit-name">Subscription Name</label>
                    <input type="text" id="edit-name" name="name" value="${escapeHtml(subscription.name)}" required>
                </div>
                <div class="form-group">
                    <label for="edit-cost">Cost</label>
                    <input type="number" id="edit-cost" name="cost" value="${subscription.cost}" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="edit-billing">Billing Cycle</label>
                    <select id="edit-billing" name="billing-cycle" required>
                        <option value="monthly" ${subscription.billingCycle === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="annually" ${subscription.billingCycle === 'annually' ? 'selected' : ''}>Annually</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-usage">Usage Amount</label>
                    <input type="number" id="edit-usage" name="usage" value="${subscription.usage}" min="0" step="0.1" required>
                </div>
                <div class="form-group">
                    <label for="edit-frequency">Usage Frequency</label>
                    <select id="edit-frequency" name="usage-frequency" required>
                        <option value="per-day" ${subscription.usageFrequency === 'per-day' ? 'selected' : ''}>Times per Day</option>
                        <option value="per-week" ${subscription.usageFrequency === 'per-week' ? 'selected' : ''}>Times per Week</option>
                        <option value="per-month" ${subscription.usageFrequency === 'per-month' ? 'selected' : ''}>Times per Month</option>
                    </select>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    modal.querySelector('#edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const cost = parseFloat(formData.get('cost'));
        const usage = parseFloat(formData.get('usage'));
        
        if (!cost || cost < 0 || !usage || usage < 0) {
            showNotification('Invalid input values', 'error');
            return;
        }
        
        subscription.name = formData.get('name').trim();
        subscription.cost = cost;
        subscription.billingCycle = formData.get('billing-cycle');
        subscription.usage = usage;
        subscription.usageFrequency = formData.get('usage-frequency');
        
        saveSubscriptions();
        render();
        modal.remove();
        showNotification('Subscription updated successfully!', 'success');
    });
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

    // Calculate costs in different currencies
    const currencyCosts = {};
    Object.keys(exchangeRates).forEach(currency => {
        if (currency !== currentCurrency) {
            currencyCosts[currency] = {
                monthly: totalMonthlyCost * exchangeRates[currency].rate,
                yearly: yearlyCost * exchangeRates[currency].rate,
                daily: dailyCost * exchangeRates[currency].rate
            };
        }
    });

    let otherCurrenciesHTML = '';
    if (Object.keys(currencyCosts).length > 0) {
        otherCurrenciesHTML = `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <h3 style="font-size: 1rem; margin-bottom: 1rem; font-weight: 600; color: var(--text-primary);">Other Currencies</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem;">
                    ${Object.entries(currencyCosts).slice(0, 3).map(([currency, costs]) => `
                        <div style="padding: 0.75rem; background: rgba(255, 255, 255, 0.5); border-radius: 6px; border: 1px solid var(--border-color);">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">${currency}</div>
                            <div style="font-weight: 600; color: var(--text-primary);">${exchangeRates[currency].symbol}${costs.monthly.toFixed(2)}/mo</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

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
        ${otherCurrenciesHTML}
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
            
            // Get theme-aware colors
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const textColor = isDark ? '#1a1a1a' : '#fff';
            const labelColor = isDark ? '#a0a0a0' : '#666';
            
            // Soft pastel colors for better visibility
            const pastelColors = [
                '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
                '#E4BAFF', '#FFCBA4', '#FFB3D1', '#C8E6C9', '#BBDEFB',
                '#FFF9C4', '#F8BBD9', '#CE93D8', '#90CAF9', '#A5D6A7',
                '#FFCCBC', '#D1C4E9', '#C5E1A5', '#FFE082', '#F5B7B1'
            ];
            
            monthlyCosts.forEach((item, index) => {
                const barHeight = Math.max(5, (item.cost / maxCost) * chartHeight);
                const x = padding + index * (barWidth + barSpacing);
                const y = canvas.height - padding - barHeight;
                
                // Use soft pastel color for each bar
                const colorIndex = index % pastelColors.length;
                context.fillStyle = pastelColors[colorIndex];
                context.fillRect(x, y, barWidth, barHeight);
                
                // Subtle border for definition
                context.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                context.lineWidth = 1.5;
                context.strokeRect(x, y, barWidth, barHeight);
                
                // Show cost on top of bar with background for visibility
                    const displayCost = convertPrice(item.cost);
                const costText = formatCurrency(displayCost);
                const textMetrics = context.measureText(costText);
                const bgWidth = textMetrics.width + 6;
                const bgHeight = 16;
                
                // Background for text
                context.fillStyle = isDark ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                context.fillRect(x + barWidth / 2 - bgWidth / 2, y - 22, bgWidth, bgHeight);
                
                // Text on bar
                context.fillStyle = textColor;
                    context.font = 'bold 10px Inter';
                    context.textAlign = 'center';
                context.fillText(costText, x + barWidth / 2, y - 8);
                
                // Company name label below bar (no rotation, centered)
                context.fillStyle = labelColor;
                context.font = '9px Inter';
                context.textAlign = 'center';
                context.textBaseline = 'top';
                const label = item.name.substring(0, Math.min(20, 60 / barWidth));
                context.fillText(label, x + barWidth / 2, canvas.height - padding / 2 + 3);
            });
            
            // Get theme-aware stroke color
            const strokeColor = isDark ? '#3a3a3a' : '#e5e5e5';
            context.strokeStyle = strokeColor;
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
        
        // Get company logo
        const baseName = subscription.name.split(' - ')[0];
        const logoUrl = getCompanyLogo(baseName);
        const logoHTML = logoUrl ? `<img src="${logoUrl}" alt="${baseName}" class="company-logo" onerror="this.style.display='none'">` : '';
        
        card.innerHTML = `
            <div class="card-header">
                ${logoHTML}
                <div class="card-title-wrapper">
                <h3 class="card-title">${escapeHtml(subscription.name)}</h3>
                <span class="card-cost">${formatCurrency(displayMonthlyCost)}/mo</span>
                </div>
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
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-edit" title="Edit subscription">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>
                    </button>
                <button class="btn-delete"><span>Delete</span></button>
                </div>
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
        'excellent': '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg> Excellent',
        'good': '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg> Good',
        'moderate': '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg> Moderate',
        'poor': '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708z"/></svg> Poor Value'
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

// Initialize currency selector with all currencies
function initializeCurrencySelector() {
    const currencySelector = document.getElementById('currency-selector');
    if (!currencySelector) return;
    
    // Clear existing options
    currencySelector.innerHTML = '';
    
    // Add all currency options
    Object.keys(exchangeRates).forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = `${currency} (${exchangeRates[currency].symbol}) ${exchangeRates[currency].name}`;
        currencySelector.appendChild(option);
    });
    
    // Set current currency
    const savedCurrency = localStorage.getItem('subscriblytics-currency');
    if (savedCurrency && exchangeRates[savedCurrency]) {
        currentCurrency = savedCurrency;
        currencySelector.value = savedCurrency;
    }
}

// Call on initialization
setTimeout(initializeCurrencySelector, 0);

// === Dark Mode Functionality ===
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('.theme-icon');
let currentTheme = localStorage.getItem('subscriblytics-theme') || 'light';
// Force light mode as default
if (!localStorage.getItem('subscriblytics-theme')) {
    localStorage.setItem('subscriblytics-theme', 'light');
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('subscriblytics-theme', currentTheme);
    updateThemeIcon();
    // Re-render chart if needed for theme change
    if (subscriptions.length > 0) {
        renderChart();
    }
}

function updateThemeIcon() {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    if (currentTheme === 'dark') {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    } else {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    }
}

themeToggle?.addEventListener('click', toggleTheme);
initTheme();

// === Export/Import Functionality ===
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');

exportBtn?.addEventListener('click', () => {
    try {
        const dataToExport = {
            subscriptions: subscriptions,
            currency: currentCurrency,
            theme: currentTheme,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscriblytics-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data', 'error');
    }
});

importBtn?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!confirm('This will replace your current data. Are you sure?')) {
                e.target.value = '';
                return;
            }
            
            if (data.subscriptions) {
                subscriptions = data.subscriptions;
                saveSubscriptions();
                render();
            }
            
            if (data.currency && exchangeRates[data.currency]) {
                currentCurrency = data.currency;
                currencySelector.value = currentCurrency;
                localStorage.setItem('subscriblytics-currency', currentCurrency);
            }
            
            if (data.theme && ['light', 'dark'].includes(data.theme)) {
                currentTheme = data.theme;
                initTheme();
            }
            
            showNotification('Data imported successfully!', 'success');
            e.target.value = '';
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import data. Invalid file format.', 'error');
            e.target.value = '';
        }
    };
    reader.readAsText(file);
});

// === Keyboard Shortcuts ===
const shortcutsModal = document.getElementById('shortcuts-modal');
const shortcutsModalClose = shortcutsModal?.querySelector('.btn-close');

function openShortcutsModal() {
    if (shortcutsModal) {
        shortcutsModal.classList.remove('hidden');
        shortcutsModal.addEventListener('click', handleShortcutsModalClick);
        shortcutsModal.querySelector('.shortcuts-content')?.addEventListener('click', (e) => e.stopPropagation());
    }
}

function closeShortcutsModal() {
    if (shortcutsModal) {
        shortcutsModal.classList.add('hidden');
        shortcutsModal.removeEventListener('click', handleShortcutsModalClick);
    }
}

function handleShortcutsModalClick(e) {
    if (e.target === shortcutsModal) {
        closeShortcutsModal();
    }
}

shortcutsModalClose?.addEventListener('click', closeShortcutsModal);

document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    // Ctrl/Cmd + E - Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportBtn?.click();
    }
    
    // Ctrl/Cmd + I - Import
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        importBtn?.click();
    }
    
    // Ctrl/Cmd + K or / - Focus search
    if (((e.ctrlKey || e.metaKey) && e.key === 'k') || e.key === '/') {
        e.preventDefault();
        serviceSearch?.focus();
    }
    
    // ? - Show shortcuts
    if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        openShortcutsModal();
    }
    
    // Esc - Close modal
    if (e.key === 'Escape') {
        closeShortcutsModal();
    }
});

// Focus search on / key (even when typing)
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        serviceSearch?.focus();
    }
});

// === Improved Analytics Features ===
function getCategoryBreakdown() {
    const breakdown = {};
    subscriptions.forEach(sub => {
        const monthlyCost = sub.billingCycle === 'annually' ? sub.cost / 12 : sub.cost;
        const category = popularServices[sub.name]?.category || 'Other';
        breakdown[category] = (breakdown[category] || 0) + monthlyCost;
    });
    return breakdown;
}

function getTrendingUpSubscriptions() {
    return subscriptions.filter(sub => {
        const costPerUse = calculateCostPerUse(sub);
        return costPerUse > 1.0;
    }).slice(0, 3);
}

function getBestValueSubscriptions() {
    return subscriptions.map(sub => ({
        name: sub.name,
        costPerUse: calculateCostPerUse(sub)
    })).sort((a, b) => a.costPerUse - b.costPerUse).slice(0, 3);
}

// === Update Summary with Better Analytics ===
const originalRenderSummary = renderSummary;
renderSummary = function() {
    originalRenderSummary();
    
    if (subscriptions.length === 0) return;
    
    const categoryBreakdown = getCategoryBreakdown();
    const categories = Object.keys(categoryBreakdown);
    
    if (categories.length > 0) {
        const breakdownHTML = `
            <div class="category-breakdown" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <h3 style="font-size: 1rem; margin-bottom: 1rem; font-weight: 600; color: var(--text-primary);">Cost by Category</h3>
                <div class="category-list" style="display: grid; gap: 0.5rem;">
                    ${categories.map(cat => {
                        const cost = categoryBreakdown[cat];
                        return `
                            <div class="category-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255, 255, 255, 0.5); border-radius: 6px; border: 1px solid var(--border-color);">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">${cat}</span>
                                <strong style="font-size: 0.875rem; color: var(--text-primary);">${formatCurrency(convertPrice(cost))}</strong>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        summaryView.insertAdjacentHTML('beforeend', breakdownHTML);
    }
};
