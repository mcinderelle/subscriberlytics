// === Data Management ===
let subscriptions = [];

// Load subscriptions from localStorage on startup
function loadSubscriptions() {
    const saved = localStorage.getItem('subscriblytics-data');
    if (saved) {
        try {
            subscriptions = JSON.parse(saved);
            render();
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            subscriptions = [];
        }
    }
}

// Save subscriptions to localStorage
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

// === Event Listeners ===
form.addEventListener('submit', handleFormSubmit);
subscriptionList.addEventListener('click', handleListClick);

// === Core Calculation Logic ===
function calculateCostPerUse(subscription) {
    // Normalize cost to monthly
    let monthlyCost;
    if (subscription.billingCycle === 'annually') {
        monthlyCost = subscription.cost / 12;
    } else {
        monthlyCost = subscription.cost;
    }

    // Normalize usage to monthly
    let monthlyUsage;
    const usagePerDay = subscription.usage;
    
    switch (subscription.usageFrequency) {
        case 'per-day':
            monthlyUsage = usagePerDay * 30.44; // Average days per month
            break;
        case 'per-week':
            monthlyUsage = usagePerDay * 4.345; // Average weeks per month
            break;
        case 'per-month':
            monthlyUsage = usagePerDay;
            break;
        default:
            monthlyUsage = 0;
    }

    // Calculate cost per use
    if (monthlyUsage === 0) {
        return monthlyCost; // Return total monthly cost if no usage
    }
    
    return monthlyCost / monthlyUsage;
}

// === Event Handlers ===
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);
    
    const subscription = {
        id: Date.now().toString(),
        name: formData.get('name'),
        cost: parseFloat(formData.get('cost')),
        billingCycle: formData.get('billing-cycle'),
        usage: parseFloat(formData.get('usage')),
        usageFrequency: formData.get('usage-frequency')
    };

    subscriptions.push(subscription);
    saveSubscriptions();
    render();
    form.reset();
}

function handleListClick(e) {
    if (e.target.classList.contains('btn-delete')) {
        const card = e.target.closest('.subscription-card');
        const subscriptionId = card.dataset.id;
        
        subscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
        saveSubscriptions();
        render();
    }
}

// === Rendering Logic ===
function render() {
    clearView();
    
    if (subscriptions.length === 0) {
        renderEmptyState();
    } else {
        renderSummary();
        renderSubscriptionList();
    }
}

function clearView() {
    subscriptionList.innerHTML = '';
    summaryView.innerHTML = '';
}

function renderEmptyState() {
    summaryView.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>No subscriptions yet</h3>
            <p>Add your first subscription to get started!</p>
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

    // Find best and worst value
    const costsPerUse = subscriptions.map(sub => ({
        id: sub.id,
        costPerUse: calculateCostPerUse(sub)
    }));

    const sorted = [...costsPerUse].sort((a, b) => a.costPerUse - b.costPerUse);
    const bestValue = sorted[0];
    const worstValue = sorted[sorted.length - 1];

    const bestSub = subscriptions.find(sub => sub.id === bestValue.id);
    const worstSub = subscriptions.find(sub => sub.id === worstValue.id);

    summaryView.innerHTML = `
        <h2>Your Subscription Overview</h2>
        <div class="summary-stats">
            <div class="stat-box">
                <strong>$${totalMonthlyCost.toFixed(2)}</strong>
                <span>Total Monthly Cost</span>
            </div>
            <div class="stat-box">
                <strong>$${yearlyCost.toFixed(2)}</strong>
                <span>Total Yearly Cost</span>
            </div>
            <div class="stat-box">
                <strong>${subscriptions.length}</strong>
                <span>Total Subscriptions</span>
            </div>
        </div>
        ${bestSub && worstSub ? `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <p style="margin-bottom: 0.5rem;"><strong>Best Value:</strong> ${bestSub.name} - $${bestValue.costPerUse.toFixed(4)} per use</p>
            <p><strong>Worst Value:</strong> ${worstSub.name} - $${worstValue.costPerUse.toFixed(4)} per use</p>
        </div>
        ` : ''}
    `;
}

function renderSubscriptionList() {
    subscriptionList.innerHTML = '';
    
    subscriptions.forEach(subscription => {
        const costPerUse = calculateCostPerUse(subscription);
        const valueCategory = getValueCategory(costPerUse);
        
        const card = document.createElement('div');
        card.className = `subscription-card ${valueCategory}`;
        card.dataset.id = subscription.id;
        
        const monthlyCost = subscription.billingCycle === 'annually' 
            ? subscription.cost / 12 
            : subscription.cost;
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(subscription.name)}</h3>
                <span class="card-cost">$${monthlyCost.toFixed(2)}/mo</span>
            </div>
            <div class="card-details">
                <div class="card-metric">
                    <div class="card-metric-label">Cost Per Use</div>
                    <div class="card-metric-value">$${costPerUse.toFixed(4)}</div>
                </div>
                <div class="card-metric">
                    <div class="card-metric-label">Usage</div>
                    <div class="card-metric-value">${formatUsage(subscription)}</div>
                </div>
            </div>
            <div class="card-footer">
                <span style="font-size: 0.875rem; color: var(--text-secondary);">
                    ${getValueDescription(valueCategory)}
                </span>
                <button class="btn-delete">Delete</button>
            </div>
        `;
        
        subscriptionList.appendChild(card);
    });
}

// === Helper Functions ===
function getValueCategory(costPerUse) {
    if (costPerUse < 0.1) return 'excellent';
    if (costPerUse < 0.5) return 'good';
    if (costPerUse < 1.0) return 'moderate';
    return 'poor';
}

function getValueDescription(category) {
    const descriptions = {
        'excellent': 'Excellent Value ✓',
        'good': 'Good Value ✓',
        'moderate': 'Moderate Value',
        'poor': 'Poor Value - Consider Canceling'
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

// === Initialize ===
loadSubscriptions();

