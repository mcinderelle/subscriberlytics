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
let history = []; // For undo/redo
let historyIndex = -1;
const MAX_HISTORY = 50;
let selectedSubscriptionIds = new Set(); // For bulk selection

// Debounce utility for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// History management for undo/redo
function addToHistory() {
    const currentState = JSON.parse(JSON.stringify(subscriptions));
    history = history.slice(0, historyIndex + 1);
    history.push(currentState);
    history = history.slice(-MAX_HISTORY);
    historyIndex = history.length - 1;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        subscriptions = JSON.parse(JSON.stringify(history[historyIndex]));
        saveSubscriptions();
        render();
        showNotification('Undone', 'info');
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        subscriptions = JSON.parse(JSON.stringify(history[historyIndex]));
        saveSubscriptions();
        render();
        showNotification('Redone', 'info');
    }
}

// Comprehensive logo mapping using Clearbit Logo API (most reliable)
const logoMapping = {
    // Streaming Services - Using Clearbit API
    'Netflix': 'https://logo.clearbit.com/netflix.com',
    'Disney+': 'https://logo.clearbit.com/disney.com',
    'Hulu': 'https://logo.clearbit.com/hulu.com',
    'Amazon Prime': 'https://logo.clearbit.com/amazon.com',
    'HBO Max': 'https://logo.clearbit.com/hbomax.com',
    'Max': 'https://logo.clearbit.com/hbomax.com',
    'Paramount': 'https://logo.clearbit.com/paramountplus.com',
    'Peacock': 'https://logo.clearbit.com/peacocktv.com',
    'Apple TV+': 'https://logo.clearbit.com/apple.com',
    'Crunchyroll': 'https://logo.clearbit.com/crunchyroll.com',
    'YouTube TV': 'https://logo.clearbit.com/youtube.com',
    'YouTube Premium': 'https://logo.clearbit.com/youtube.com',
    'Sling TV': 'https://logo.clearbit.com/sling.com',
    'Sling TV Orange': 'https://logo.clearbit.com/sling.com',
    'Sling TV Blue': 'https://logo.clearbit.com/sling.com',
    'Philo': 'https://logo.clearbit.com/philo.com',
    'fuboTV': 'https://logo.clearbit.com/fubo.tv',
    
    // Music Services
    'Spotify': 'https://logo.clearbit.com/spotify.com',
    'Apple Music': 'https://logo.clearbit.com/apple.com',
    'YouTube Music': 'https://logo.clearbit.com/youtube.com',
    'Tidal': 'https://logo.clearbit.com/tidal.com',
    'Pandora': 'https://logo.clearbit.com/pandora.com',
    'SoundCloud': 'https://logo.clearbit.com/soundcloud.com',
    
    // Cloud Storage
    'Dropbox': 'https://logo.clearbit.com/dropbox.com',
    'Google Drive': 'https://logo.clearbit.com/google.com',
    'OneDrive': 'https://logo.clearbit.com/onedrive.live.com',
    'Box': 'https://logo.clearbit.com/box.com',
    'iCloud': 'https://logo.clearbit.com/icloud.com',
    
    // Productivity
    'Microsoft': 'https://logo.clearbit.com/microsoft.com',
    'Adobe': 'https://logo.clearbit.com/adobe.com',
    'Notion': 'https://logo.clearbit.com/notion.so',
    'Evernote': 'https://logo.clearbit.com/evernote.com',
    'Todoist': 'https://logo.clearbit.com/todoist.com',
    'Grammarly': 'https://logo.clearbit.com/grammarly.com',
    'Zoom': 'https://logo.clearbit.com/zoom.us',
    'Canva': 'https://logo.clearbit.com/canva.com',
    'Figma': 'https://logo.clearbit.com/figma.com',
    'Slack': 'https://logo.clearbit.com/slack.com',
    'Asana': 'https://logo.clearbit.com/asana.com',
    'Monday': 'https://logo.clearbit.com/monday.com',
    'Trello': 'https://logo.clearbit.com/trello.com',
    
    // Gaming
    'Xbox': 'https://logo.clearbit.com/xbox.com',
    'PlayStation': 'https://logo.clearbit.com/playstation.com',
    'Nintendo': 'https://logo.clearbit.com/nintendo.com',
    'Steam': 'https://logo.clearbit.com/steampowered.com',
    'Discord': 'https://logo.clearbit.com/discord.com',
    'Twitch': 'https://logo.clearbit.com/twitch.tv',
    'Roblox': 'https://logo.clearbit.com/roblox.com',
    'Epic Games': 'https://logo.clearbit.com/epicgames.com',
    'Ubisoft': 'https://logo.clearbit.com/ubisoft.com',
    'EA': 'https://logo.clearbit.com/ea.com',
    
    // Fitness
    'Peloton': 'https://logo.clearbit.com/onepeloton.com',
    'MyFitnessPal': 'https://logo.clearbit.com/myfitnesspal.com',
    'Strava': 'https://logo.clearbit.com/strava.com',
    'Calm': 'https://logo.clearbit.com/calm.com',
    'Headspace': 'https://logo.clearbit.com/headspace.com',
    
    // Learning
    'MasterClass': 'https://logo.clearbit.com/masterclass.com',
    'Duolingo': 'https://logo.clearbit.com/duolingo.com',
    'Coursera': 'https://logo.clearbit.com/coursera.org',
    'Skillshare': 'https://logo.clearbit.com/skillshare.com',
    'LinkedIn Learning': 'https://logo.clearbit.com/linkedin.com',
    'Udemy': 'https://logo.clearbit.com/udemy.com',
    'Codecademy': 'https://logo.clearbit.com/codecademy.com',
    'Pluralsight': 'https://logo.clearbit.com/pluralsight.com',
    'DataCamp': 'https://logo.clearbit.com/datacamp.com',
    'Brilliant': 'https://logo.clearbit.com/brilliant.org',
    'Babbel': 'https://logo.clearbit.com/babbel.com',
    'Rosetta Stone': 'https://logo.clearbit.com/rosettastone.com',
    'Treehouse': 'https://logo.clearbit.com/teamtreehouse.com',
    'Khan Academy': 'https://logo.clearbit.com/khanacademy.org',
    'Chegg Study': 'https://logo.clearbit.com/chegg.com',
    
    // Food & Delivery
    'Uber Eats': 'https://logo.clearbit.com/ubereats.com',
    'DoorDash': 'https://logo.clearbit.com/doordash.com',
    'Grubhub': 'https://logo.clearbit.com/grubhub.com',
    'Instacart': 'https://logo.clearbit.com/instacart.com',
    'HelloFresh': 'https://logo.clearbit.com/hellofresh.com',
    'Blue Apron': 'https://logo.clearbit.com/blueapron.com',
    'Sunbasket': 'https://logo.clearbit.com/sunbasket.com',
    'Home Chef': 'https://logo.clearbit.com/homechef.com',
    'EveryPlate': 'https://logo.clearbit.com/everyplate.com',
    'Marley Spoon': 'https://logo.clearbit.com/marleyspoon.com',
    'Freshly': 'https://logo.clearbit.com/freshly.com',
    'Factor': 'https://logo.clearbit.com/factor75.com',
    'Green Chef': 'https://logo.clearbit.com/greenchef.com',
    'Purple Carrot': 'https://logo.clearbit.com/purplecarrot.com',
    'Gobble': 'https://logo.clearbit.com/gobble.com',
    'Daily Harvest': 'https://logo.clearbit.com/daily-harvest.com',
    'ButcherBox': 'https://logo.clearbit.com/butcherbox.com',
    
    // Security
    'NordVPN': 'https://logo.clearbit.com/nordvpn.com',
    'ExpressVPN': 'https://logo.clearbit.com/expressvpn.com',
    '1Password': 'https://logo.clearbit.com/1password.com',
    'LastPass': 'https://logo.clearbit.com/lastpass.com',
    'Bitwarden': 'https://logo.clearbit.com/bitwarden.com',
    'Dashlane': 'https://logo.clearbit.com/dashlane.com',
    
    // News
    'The New York Times': 'https://logo.clearbit.com/nytimes.com',
    'New York Times': 'https://logo.clearbit.com/nytimes.com',
    'The Wall Street Journal': 'https://logo.clearbit.com/wsj.com',
    'Wall Street Journal': 'https://logo.clearbit.com/wsj.com',
    'The Washington Post': 'https://logo.clearbit.com/washingtonpost.com',
    'Washington Post': 'https://logo.clearbit.com/washingtonpost.com',
    'The Athletic': 'https://logo.clearbit.com/theathletic.com',
    'The Atlantic': 'https://logo.clearbit.com/theatlantic.com',
    'The Economist': 'https://logo.clearbit.com/economist.com',
    
    // Social Media
    'Snapchat': 'https://logo.clearbit.com/snapchat.com',
    'Twitter': 'https://logo.clearbit.com/twitter.com',
    'Reddit': 'https://logo.clearbit.com/reddit.com',
    'LinkedIn': 'https://logo.clearbit.com/linkedin.com',
    'Instagram': 'https://logo.clearbit.com/instagram.com',
    'Facebook': 'https://logo.clearbit.com/facebook.com',
    'Telegram': 'https://logo.clearbit.com/telegram.org',
    'WhatsApp': 'https://logo.clearbit.com/whatsapp.com',
    'WeChat': 'https://logo.clearbit.com/wechat.com',
    'TikTok': 'https://logo.clearbit.com/tiktok.com',
    
    // Software & Productivity
    'Google Workspace': 'https://logo.clearbit.com/google.com',
    'Microsoft 365': 'https://logo.clearbit.com/microsoft.com',
    'Office 365': 'https://logo.clearbit.com/microsoft.com',
    'Dropbox Plus': 'https://logo.clearbit.com/dropbox.com',
    'Dropbox Professional': 'https://logo.clearbit.com/dropbox.com',
    'Google': 'https://logo.clearbit.com/google.com',
    'Amazon': 'https://logo.clearbit.com/amazon.com',
    'Apple': 'https://logo.clearbit.com/apple.com',
    
    // Additional services with logo mappings
    'ClickUp': 'https://logo.clearbit.com/clickup.com',
    'Wrike': 'https://logo.clearbit.com/wrike.com',
    'Airtable': 'https://logo.clearbit.com/airtable.com',
    'Smartsheet': 'https://logo.clearbit.com/smartsheet.com',
    'Basecamp': 'https://logo.clearbit.com/basecamp.com',
    'Teamwork': 'https://logo.clearbit.com/teamwork.com',
    'Linear': 'https://logo.clearbit.com/linear.app',
    'Loom': 'https://logo.clearbit.com/loom.com',
    'HubSpot': 'https://logo.clearbit.com/hubspot.com',
    'Mailchimp': 'https://logo.clearbit.com/mailchimp.com',
    
    // Development
    'GitHub': 'https://logo.clearbit.com/github.com',
    'GitLab': 'https://logo.clearbit.com/gitlab.com',
    'Bitbucket': 'https://logo.clearbit.com/bitbucket.org',
    'Jira': 'https://logo.clearbit.com/atlassian.com',
    'Confluence': 'https://logo.clearbit.com/atlassian.com',
    'Vercel': 'https://logo.clearbit.com/vercel.com',
    'Netlify': 'https://logo.clearbit.com/netlify.com',
    'Heroku': 'https://logo.clearbit.com/heroku.com',
    'DigitalOcean': 'https://logo.clearbit.com/digitalocean.com',
    'AWS': 'https://logo.clearbit.com/amazonaws.com',
    'Cloudflare': 'https://logo.clearbit.com/cloudflare.com',
    
    // Communication
    'Telegram': 'https://logo.clearbit.com/telegram.org',
    'Signal': 'https://logo.clearbit.com/signal.org',
    'LINE': 'https://logo.clearbit.com/line.me',
    'Viber': 'https://logo.clearbit.com/viber.com',
    'WeChat': 'https://logo.clearbit.com/wechat.com',
    'Skype': 'https://logo.clearbit.com/skype.com',
    
    // Additional Streaming
    'Showtime': 'https://logo.clearbit.com/showtime.com',
    'Starz': 'https://logo.clearbit.com/starz.com',
    'Shudder': 'https://logo.clearbit.com/shudder.com',
    'AMC+': 'https://logo.clearbit.com/amcplus.com',
    'Mubi': 'https://logo.clearbit.com/mubi.com',
    'Criterion Channel': 'https://logo.clearbit.com/criterionchannel.com',
    'Sundance Now': 'PLACEHOLDER: Add Sundance Now logo URL',
    'Acorn TV': 'PLACEHOLDER: Add Acorn TV logo URL',
    'BritBox': 'PLACEHOLDER: Add BritBox logo URL',
    
    // Music additions
    'Deezer': 'https://logo.clearbit.com/deezer.com',
    'SiriusXM': 'https://logo.clearbit.com/siriusxm.com',
    'Pandora': 'https://logo.clearbit.com/pandora.com',
    'Qobuz': 'https://logo.clearbit.com/qobuz.com',
    'SoundCloud': 'https://logo.clearbit.com/soundcloud.com',
    'Napster': 'PLACEHOLDER: Add Napster logo URL',
    'KKBox': 'PLACEHOLDER: Add KKBox logo URL',
    'iHeartRadio': 'https://logo.clearbit.com/iheart.com',
    'Audible': 'https://logo.clearbit.com/audible.com',
    
    // Photo/Video
    'VSCO': 'https://logo.clearbit.com/vsco.co',
    'Adobe Lightroom': 'https://logo.clearbit.com/adobe.com',
    'Capture One': 'PLACEHOLDER: Add Capture One logo URL',
    'Pixelmator': 'PLACEHOLDER: Add Pixelmator logo URL',
    'Affinity': 'PLACEHOLDER: Add Affinity logo URL',
    
    // VPN additions
    'Surfshark': 'https://logo.clearbit.com/surfshark.com',
    'ProtonVPN': 'https://logo.clearbit.com/protonvpn.com',
    'CyberGhost': 'PLACEHOLDER: Add CyberGhost logo URL',
    'Private Internet Access': 'PLACEHOLDER: Add PIA logo URL',
    'IPVanish': 'PLACEHOLDER: Add IPVanish logo URL',
    
    // Finance
    'YNAB': 'PLACEHOLDER: Add YNAB logo URL',
    'Mint': 'PLACEHOLDER: Add Mint logo URL',
    'Personal Capital': 'PLACEHOLDER: Add Personal Capital logo URL',
    'Credit Karma': 'https://logo.clearbit.com/creditkarma.com',
    
    // Email
    'ProtonMail': 'https://logo.clearbit.com/protonmail.com',
    'Tutanota': 'PLACEHOLDER: Add Tutanota logo URL',
    'FastMail': 'PLACEHOLDER: Add FastMail logo URL',
    
    // News additions
    'Financial Times': 'https://logo.clearbit.com/ft.com',
    'Bloomberg': 'https://logo.clearbit.com/bloomberg.com',
    'Politico': 'https://logo.clearbit.com/politico.com',
    'Reuters': 'https://logo.clearbit.com/reuters.com',
    'CNN': 'https://logo.clearbit.com/cnn.com',
    'The Guardian': 'https://logo.clearbit.com/theguardian.com',
    
    // Read/audiobooks
    'Kindle Unlimited': 'https://logo.clearbit.com/amazon.com',
    'Scribd': 'https://logo.clearbit.com/scribd.com',
    'Audible': 'https://logo.clearbit.com/audible.com',
    'Blinkist': 'https://logo.clearbit.com/blinkist.com',
    'Medium': 'https://logo.clearbit.com/medium.com',
    'Pocket': 'https://logo.clearbit.com/getpocket.com'
};

function getCompanyLogo(companyName) {
    if (!companyName) return null;
    
    // Try exact match first
    if (logoMapping[companyName]) {
        const url = logoMapping[companyName];
        // Handle PLACEHOLDER entries
        if (url.startsWith('PLACEHOLDER:')) {
            return null; // Return null so it doesn't try to load an invalid URL
        }
        return url;
    }
    
    // Try partial matches
    for (const [serviceName, logoUrl] of Object.entries(logoMapping)) {
        if (companyName.toLowerCase().includes(serviceName.toLowerCase()) || 
            serviceName.toLowerCase().includes(companyName.toLowerCase())) {
            if (logoUrl && !logoUrl.startsWith('PLACEHOLDER:')) {
                return logoUrl;
            }
        }
    }
    
    // Try getting company name from subscription (handle tier suffixes)
    const baseName = companyName.split(' - ')[0]
        .split(' Basic')[0].split(' Standard')[0].split(' Premium')[0]
        .split(' Individual')[0].split(' Family')[0].split(' Business')[0]
        .split(' Pro')[0].split(' Plus')[0].split(' Max')[0].split('+')[0];
    if (logoMapping[baseName]) {
        const url = logoMapping[baseName];
        if (url && !url.startsWith('PLACEHOLDER:')) {
            return url;
        }
    }
    
    return null;
}

// Preload logos for faster display (skip placeholders)
function preloadLogos() {
    const logosToPreload = Object.values(logoMapping)
        .filter(url => url && !url.startsWith('PLACEHOLDER:'));
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
    'Calendly': { cost: 10, category: 'Productivity' },
    'Calendly Premium': { cost: 10, category: 'Productivity' },
    'Zoom': {
        options: [
            { tier: 'Basic', cost: 0 },
            { tier: 'Pro', cost: 14.99 },
            { tier: 'Business', cost: 19.99 }
        ],
        category: 'Productivity'
    },
    'Zoom Pro': { cost: 14.99, category: 'Productivity' },
    'Zoom Business': { cost: 19.99, category: 'Productivity' },
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

function convertPrice(price, fromCurrency = 'USD') {
    if (!price || isNaN(price)) return 0;
    // First convert to USD (base currency), then to display currency
    const fromRate = exchangeRates[fromCurrency]?.rate || 1;
    const toRate = exchangeRates[currentCurrency]?.rate || 1;
    
    const usdPrice = price / fromRate;
    return usdPrice * toRate;
}

function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return `${exchangeRates[currentCurrency]?.symbol || '$'}0.00`;
    const symbol = exchangeRates[currentCurrency]?.symbol || '$';
    return `${symbol}${amount.toFixed(2)}`;
}

// Add smooth update class to currency display elements
function addCurrencyUpdateAnimation() {
    const elements = document.querySelectorAll('.card-cost, .quick-add-price, .card-metric-value, .stat-box strong, .currency-value, .modal-price, .comparison-item-value');
    elements.forEach(el => {
        if (el) {
            el.classList.add('currency-updating');
            setTimeout(() => {
                if (el) el.classList.remove('currency-updating');
            }, 600);
        }
    });
    
    // Also animate bar chart
    const canvas = document.getElementById('subscription-chart');
    if (canvas) {
        canvas.classList.add('currency-updating');
        setTimeout(() => {
            canvas.classList.remove('currency-updating');
        }, 600);
    }
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
            // Set default currency for old subscriptions that don't have one
            subscriptions.forEach(sub => {
                if (!sub.currency) sub.currency = 'USD';
            });
            render();
        }
        
        // Load saved display currency
        const savedCurrency = localStorage.getItem('subscriblytics-display-currency');
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
serviceSearch.addEventListener('input', debounce(handleServiceSearch, 150));
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
    
    // Show loading state
    quickAddGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Searching...</div>';
    
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
    
    // Small delay for better UX
    setTimeout(() => {
        renderQuickAdd();
    }, 50);
}

function handleCurrencyChange(e) {
    const newCurrency = e.target.value;
    
    // Add smooth transition effect
    document.body.classList.add('currency-updating');
    
    // Update currency
    currentCurrency = newCurrency;
    localStorage.setItem('subscriblytics-display-currency', currentCurrency);
    
    // Smoothly animate currency change
    setTimeout(() => {
        // Force re-render everything to update currency
        render();
        renderQuickAdd();
        renderChart();
        addCurrencyUpdateAnimation();
        
        // Remove transition class
        setTimeout(() => {
            document.body.classList.remove('currency-updating');
        }, 600);
    }, 50);
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
        const baseName = name.split(' - ')[0].split(' Basic')[0].split(' Standard')[0].split(' Premium')[0].split(' Pro')[0].split(' Plus')[0].split(' Max')[0].split('+')[0];
        const logoUrl = getCompanyLogo(name);
        // Always show a logo container (placeholder if no logo) to maintain uniform card heights
        const logoHTML = logoUrl && !logoUrl.startsWith('PLACEHOLDER:') 
            ? `<img src="${logoUrl}" alt="${name}" class="company-logo-small" loading="lazy" onerror="this.style.display='none'; this.onerror=null;">` 
            : '<div class="company-logo-small" style="background: rgba(0,0,0,0.05);"></div>';
        
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
    const existing = subscriptions.find(sub => sub.name.split(' - ')[0] === checkName);
    if (existing) {
        const modal = confirm(`${name} is already in your subscriptions!\n\nWould you like to view it?`);
        if (modal) {
            // Scroll to existing subscription
            setTimeout(() => {
                const card = document.querySelector(`[data-id="${existing.id}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.animation = 'none';
                    card.offsetHeight; // Trigger reflow
                    card.style.animation = 'pulse 0.6s ease-out';
                }
            }, 100);
        }
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
            currency: currentCurrency, // Use current display currency for quick-add
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
        
        const subscriptionCurrency = formData.get('subscription-currency') || 'USD';
        
        const subscription = {
            id: Date.now().toString(),
            name: name,
            cost: cost,
            currency: subscriptionCurrency,
            billingCycle: formData.get('billing-cycle'),
            usage: usage,
            usageFrequency: formData.get('usage-frequency')
        };

        addToHistory();
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
    // Handle bulk delete
    if (e.target.id === 'bulk-delete-btn') {
        if (selectedSubscriptionIds.size === 0) return;
        
        const count = selectedSubscriptionIds.size;
        if (confirm(`Delete ${count} subscription${count > 1 ? 's' : ''}?`)) {
            addToHistory();
            subscriptions = subscriptions.filter(sub => !selectedSubscriptionIds.has(sub.id));
            selectedSubscriptionIds.clear();
            saveSubscriptions();
            render();
            showNotification(`${count} subscription${count > 1 ? 's' : ''} deleted`, 'success');
        }
        return;
    }
    
    // Handle select all checkbox
    if (e.target.id === 'select-all') {
        const isChecked = e.target.checked;
        if (isChecked) {
            subscriptions.forEach(sub => selectedSubscriptionIds.add(sub.id));
        } else {
            selectedSubscriptionIds.clear();
        }
        render();
        return;
    }
    
    // Handle individual subscription checkboxes
    if (e.target.classList.contains('subscription-checkbox')) {
        const subscriptionId = e.target.dataset.subscriptionId;
        if (e.target.checked) {
            selectedSubscriptionIds.add(subscriptionId);
        } else {
            selectedSubscriptionIds.delete(subscriptionId);
        }
        render();
        return;
    }
    
    if (e.target.classList.contains('btn-delete')) {
        const card = e.target.closest('.subscription-card');
        if (!card) return;
        
        const subscriptionId = card.dataset.id;
        const subscription = subscriptions.find(sub => sub.id === subscriptionId);
        
        if (subscription && confirm(`Remove ${subscription.name}?`)) {
            addToHistory();
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
        
        addToHistory();
        saveSubscriptions();
        render();
        modal.remove();
        showNotification('Subscription updated successfully!', 'success');
    });
}

function showNotification(message, type = 'info') {
    const colors = {
        success: { bg: '#10b981', icon: '✓' },
        error: { bg: '#ef4444', icon: '✕' },
        warning: { bg: '#f59e0b', icon: '⚠' },
        info: { bg: '#3b82f6', icon: 'ℹ' }
    };
    
    const color = colors[type] || colors.info;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span style="margin-right: 8px; font-weight: bold;">${color.icon}</span>${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${color.bg};
        color: white;
        border-radius: 12px;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        font-weight: 500;
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'info' ? 2500 : 3000);
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
            <p>Add subscriptions from the popular services below or use the custom form to get started!</p>
        </div>
    `;
}

function renderSummary() {
    let totalMonthlyCost = 0;
    let totalValue = 0; // Sum of cost per use
    let monthlyByCycle = { monthly: 0, annual: 0 };
    
    subscriptions.forEach(sub => {
        const subMonthlyCost = sub.billingCycle === 'annually' ? sub.cost / 12 : sub.cost;
        // Convert each subscription's cost to display currency
        const displayCost = convertPrice(subMonthlyCost, sub.currency || 'USD');
        totalMonthlyCost += displayCost;
        
        const costPerUse = calculateCostPerUse(sub);
        const displayCostPerUse = convertPrice(costPerUse, sub.currency || 'USD');
        totalValue += displayCostPerUse;
        
        if (sub.billingCycle === 'monthly') {
            monthlyByCycle.monthly += displayCost;
        } else {
            monthlyByCycle.annual += displayCost;
        }
    });

    const yearlyCost = totalMonthlyCost * 12;
    const dailyCost = totalMonthlyCost / 30;
    const avgCostPerUse = subscriptions.length > 0 ? totalValue / subscriptions.length : 0;

    // Advanced statistics
    const categories = {};
    subscriptions.forEach(sub => {
        const category = popularServices[sub.name]?.category || 'Other';
        if (!categories[category]) categories[category] = 0;
        const subMonthlyCost = sub.billingCycle === 'annually' ? sub.cost / 12 : sub.cost;
        const displayCost = convertPrice(subMonthlyCost, sub.currency || 'USD');
        categories[category] += displayCost;
    });

    let categoryBreakdown = '';
    if (Object.keys(categories).length > 0) {
        categoryBreakdown = `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <h3 style="font-size: 1rem; margin-bottom: 1rem; font-weight: 600; color: var(--text-primary);">Cost by Category</h3>
                <div style="display: grid; gap: 0.5rem;">
                    ${Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, cost]) => {
                        const percentage = ((cost / totalMonthlyCost) * 100).toFixed(1);
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255, 255, 255, 0.5); border-radius: 6px; border: 1px solid var(--border-color);">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">${cat}</span>
                                <div style="display: flex; gap: 1rem; align-items: center;">
                                    <span style="font-weight: 600; font-size: 0.875rem; color: var(--text-primary);">${formatCurrency(cost)}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">${percentage}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Format currency values with smooth transitions
    const formatCurrencySmooth = (value) => {
        return formatCurrency(value);
    };
    
    summaryView.innerHTML = `
        <div class="summary-header">
            <h2>Overview</h2>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <span>Currency:</span>
                <select id="overview-currency-selector">
                    <!-- Options populated dynamically -->
                </select>
            </div>
        </div>
        <div class="summary-stats">
            <div class="stat-box">
                <strong class="currency-value">${formatCurrencySmooth(totalMonthlyCost)}</strong>
                <span>Monthly Cost</span>
            </div>
            <div class="stat-box">
                <strong class="currency-value">${formatCurrencySmooth(yearlyCost)}</strong>
                <span>Yearly Cost</span>
            </div>
            <div class="stat-box">
                <strong class="currency-value">${formatCurrencySmooth(dailyCost)}</strong>
                <span>Daily Cost</span>
            </div>
            <div class="stat-box">
                <strong>${subscriptions.length}</strong>
                <span>Subscriptions</span>
            </div>
        </div>
        ${categoryBreakdown}
    `;
    
    // Initialize overview currency selector
    const overviewSelector = document.getElementById('overview-currency-selector');
    if (overviewSelector) {
        overviewSelector.innerHTML = '';
        Object.keys(exchangeRates).forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = `${currency} (${exchangeRates[currency].symbol})`;
            if (currency === currentCurrency) option.selected = true;
            overviewSelector.appendChild(option);
        });
        
        overviewSelector.addEventListener('change', (e) => {
            const newCurrency = e.target.value;
            currentCurrency = newCurrency;
            localStorage.setItem('subscriblytics-display-currency', currentCurrency);
            
            // Update main currency selector
            const mainSelector = document.getElementById('currency-selector');
            if (mainSelector) mainSelector.value = newCurrency;
            
            // Trigger currency update
            handleCurrencyChange({ target: { value: newCurrency } });
        });
    }
}

function renderChart() {
    if (subscriptions.length === 0) return;

    chartContainer.innerHTML = `
        <h3>Monthly Cost Distribution</h3>
        <div class="chart-wrapper">
            <canvas id="cost-chart"></canvas>
        </div>
    `;

    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        try {
            const canvas = document.getElementById('cost-chart');
            if (!canvas) return;
            
            const wrapper = canvas.parentElement;
            canvas.width = wrapper.clientWidth - 2;

            canvas.height = 280; // Increased height to prevent axis cutoff
            
            const context = canvas.getContext('2d');
            
            const monthlyCosts = subscriptions.map(sub => ({
                name: sub.name,
                cost: sub.billingCycle === 'annually' ? sub.cost / 12 : sub.cost
            })).sort((a, b) => b.cost - a.cost);
            
            if (monthlyCosts.length === 0) return;
            
            const maxCost = Math.max(...monthlyCosts.map(item => item.cost));
            const padding = 90; // Increased padding to prevent axis cutoff
            const chartWidth = canvas.width - padding * 2;
            const chartHeight = canvas.height - padding - 20; // Extra space for labels
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
                    context.font = 'bold 10px "OpenAI Sans", sans-serif';
                    context.textAlign = 'center';
                context.fillText(costText, x + barWidth / 2, y - 8);
                
                // Company name label below bar (truncated if too long)
                context.fillStyle = labelColor;
                context.font = '9px "OpenAI Sans", sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'top';
                let label = item.name.split(' - ')[0]; // Get company name without tier
                if (label.length > 15) label = label.substring(0, 12) + '...';
                context.fillText(label, x + barWidth / 2, canvas.height - padding / 2 + 3);
            });
            
            // Get theme-aware stroke color
            const strokeColor = isDark ? '#3a3a3a' : '#e5e5e5';
            
            // Draw axes
            context.strokeStyle = strokeColor;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(padding, padding / 2);
            context.lineTo(padding, canvas.height - padding);
            context.lineTo(canvas.width - padding, canvas.height - padding);
            context.stroke();
            
            // Add Y-axis label (Cost)
            context.save();
            context.translate(15, canvas.height / 2);
            context.rotate(-Math.PI / 2);
            context.fillStyle = labelColor;
            context.font = 'bold 11px "OpenAI Sans", sans-serif';
            context.textAlign = 'center';
            context.fillText('Monthly Cost', 0, 0);
            context.restore();
            
            // Add X-axis label (Service)
            context.fillStyle = labelColor;
            context.font = 'bold 11px "OpenAI Sans", sans-serif';
            context.textAlign = 'center';
            context.fillText('Service', canvas.width / 2, canvas.height - 15);
            
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
    });
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
    const sortedSubs = [...subscriptions].sort((a, b) => 
        calculateCostPerUse(a) - calculateCostPerUse(b)
    );
    
    // Clear and add bulk controls
    subscriptionList.innerHTML = '';
    
    // Add bulk selection controls if we have subscriptions
    if (sortedSubs.length > 0) {
        const bulkControlsHTML = `
            <div class="bulk-controls" style="margin-bottom: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(20px); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.3); display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="select-all" style="width: 18px; height: 18px; cursor: pointer;">
                    <label for="select-all" style="font-weight: 600; cursor: pointer;">Select All</label>
                </div>
                <span id="selected-count" style="color: var(--text-secondary);">
                    ${selectedSubscriptionIds.size} selected
                </span>
                <button id="bulk-delete-btn" class="btn-delete" ${selectedSubscriptionIds.size === 0 ? 'disabled' : ''} style="opacity: ${selectedSubscriptionIds.size === 0 ? '0.5' : '1'};">
                    Delete Selected
                </button>
            </div>
        `;
        subscriptionList.innerHTML = bulkControlsHTML;
    }
    
    sortedSubs.forEach((subscription, index) => {
        const costPerUse = calculateCostPerUse(subscription);
        const valueCategory = getValueCategory(costPerUse);
        
        const card = document.createElement('div');
        card.className = `subscription-card ${valueCategory}`;
        card.dataset.id = subscription.id;
        card.style.animationDelay = `${index * 0.05}s`;
        
        const subMonthlyCost = subscription.billingCycle === 'annually' 
            ? subscription.cost / 12 
            : subscription.cost;
        
        const subscriptionCurrency = subscription.currency || 'USD';
        const displayMonthlyCost = convertPrice(subMonthlyCost, subscriptionCurrency);
        const displayCostPerUse = convertPrice(costPerUse, subscriptionCurrency);
        
        // Get company logo - extract base name by removing tier suffixes
        const baseName = subscription.name
            .split(' - ')[0]
            .split(' Basic')[0].split(' Standard')[0].split(' Premium')[0]
            .split(' Individual')[0].split(' Family')[0].split(' Business')[0]
            .split(' Pro')[0].split(' Plus')[0].split(' Max')[0].split('+')[0];
        const logoUrl = getCompanyLogo(baseName) || getCompanyLogo(subscription.name);
        // Always show a logo container (placeholder if no logo) to maintain uniform card heights
        const logoHTML = logoUrl && !logoUrl.startsWith('PLACEHOLDER:') 
            ? `<img src="${logoUrl}" alt="${baseName}" class="company-logo" loading="lazy" onerror="this.style.display='none'; this.onerror=null;">` 
            : '<div class="company-logo" style="background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 10px;">No logo</div>';
        
        const isSelected = selectedSubscriptionIds.has(subscription.id);
        card.innerHTML = `
            <div class="card-header">
                <input type="checkbox" class="subscription-checkbox" data-subscription-id="${subscription.id}" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
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
    const subscriptionCurrencySelector = document.getElementById('subscription-currency');
    
    if (!currencySelector) return;
    
    // Clear existing options
    currencySelector.innerHTML = '';
    
    // Helper function to add options
    const addOptions = (selector) => {
        Object.keys(exchangeRates).forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = `${currency} (${exchangeRates[currency].symbol}) ${exchangeRates[currency].name}`;
            selector.appendChild(option);
        });
    };
    
    addOptions(currencySelector);
    
    // Also add to subscription currency selector
    if (subscriptionCurrencySelector) {
        subscriptionCurrencySelector.innerHTML = '';
        addOptions(subscriptionCurrencySelector);
        subscriptionCurrencySelector.value = currentCurrency;
    }
    
    // Set current currency
    const savedCurrency = localStorage.getItem('subscriblytics-display-currency');
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

// Initialize history
addToHistory();

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
    
    // Ctrl/Cmd + Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
    }
    
    // Ctrl/Cmd + Shift + Z - Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
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
    
    // Shift + ? - Show shortcuts
    if (e.key === '?' && e.shiftKey) {
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

// === Enhanced Glassmorphic Mouse Tracking Effect ===
let mouseX = 0;
let mouseY = 0;
let shimmerElement = null;
let gridInteractionElement = null;
let refractionElement = null;
let isActive = false;
let rafId = null;
let lastUpdate = 0;

// Throttle for smooth 60fps updates
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

function initGlassmorphicEffects() {
    // Create shimmer element
    shimmerElement = document.createElement('div');
    shimmerElement.className = 'mouse-shimmer';
    document.body.appendChild(shimmerElement);
    
    // Create grid interaction element
    gridInteractionElement = document.createElement('div');
    gridInteractionElement.className = 'grid-interaction';
    document.body.appendChild(gridInteractionElement);
    
    // Create refraction effect
    refractionElement = document.createElement('div');
    refractionElement.className = 'glass-refraction';
    document.body.appendChild(refractionElement);
    
    // Smooth animation function using requestAnimationFrame
    const smoothUpdate = () => {
        const now = performance.now();
        if (now - lastUpdate < 16) {
            rafId = requestAnimationFrame(smoothUpdate);
            return;
        }
        lastUpdate = now;
        
        if (shimmerElement && isActive) {
            shimmerElement.style.left = mouseX + 'px';
            shimmerElement.style.top = mouseY + 'px';
            shimmerElement.classList.add('active');
        }
        
        if (gridInteractionElement && isActive) {
            gridInteractionElement.style.left = mouseX + 'px';
            gridInteractionElement.style.top = mouseY + 'px';
            gridInteractionElement.classList.add('active');
        }
        
        if (refractionElement && isActive) {
            refractionElement.style.left = mouseX + 'px';
            refractionElement.style.top = mouseY + 'px';
            refractionElement.classList.add('active');
        }
        
        rafId = requestAnimationFrame(smoothUpdate);
    };
    
    // Start animation loop
    smoothUpdate();
    
    // Track mouse movement with throttling
    document.addEventListener('mousemove', throttle((e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isActive = true;
    }, 8));
    
    // Deactivate when mouse leaves window
    document.addEventListener('mouseleave', () => {
        isActive = false;
        if (shimmerElement) shimmerElement.classList.remove('active');
        if (gridInteractionElement) gridInteractionElement.classList.remove('active');
        if (refractionElement) refractionElement.classList.remove('active');
    });
    
    // Add enhanced ripple effect on click
    document.addEventListener('click', (e) => {
        createRipple(e.clientX, e.clientY);
    });
}

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(150, 200, 255, 0.2) 50%, transparent 100%);
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        animation: rippleExpand 0.8s ease-out;
        mix-blend-mode: overlay;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
}

// Add enhanced ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleExpand {
        from {
            width: 0;
            height: 0;
            opacity: 1;
        }
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', initGlassmorphicEffects);

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
