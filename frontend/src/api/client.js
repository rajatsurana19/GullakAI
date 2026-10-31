const BASE_URL = '/api/v1';

export const apiClient = {
  getToken() {
    return localStorage.getItem('gullak_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('gullak_token', token);
    } else {
      localStorage.removeItem('gullak_token');
    }
  },

  getMerchant() {
    const data = localStorage.getItem('gullak_merchant');
    return data ? JSON.parse(data) : null;
  },

  setMerchant(merchant) {
    if (merchant) {
      localStorage.setItem('gullak_merchant', JSON.stringify(merchant));
    } else {
      localStorage.removeItem('gullak_merchant');
    }
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { detail: 'Server communication error' };
        }

        // Convert technical errors to layman-friendly explanations (Gap Add-on Requirement 9)
        let friendlyMessage = errData.detail || errData.error || 'Unable to complete request';
        if (response.status === 401) {
          friendlyMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 403) {
          friendlyMessage = 'You do not have permission to perform this action.';
        } else if (response.status === 500) {
          friendlyMessage = 'We could not complete this right now. Please try again in a few moments.';
        }

        const error = new Error(friendlyMessage);
        error.status = response.status;
        error.raw = errData;
        throw error;
      }

      return await response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Could not connect to Gullak AI servers. Please check your internet connection.');
      }
      throw err;
    }
  },

  // Auth
  login(phone_number, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone_number, password })
    });
  },

  demoLogin() {
    return this.request('/auth/demo-login', {
      method: 'POST'
    });
  },

  register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Dashboard & Analytics
  getDashboardSummary(lang) {
    const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return this.request(`/dashboard/summary${q}`);
  },

  getSalesAnalytics() {
    return this.request('/analytics/sales');
  },

  // Transactions
  getTransactions(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/transactions?${q}`);
  },

  // Inventory & Suppliers
  getInventory() {
    return this.request('/inventory');
  },

  getInventoryAlerts() {
    return this.request('/inventory/alerts');
  },

  createReorderDraft(data) {
    return this.request('/inventory/reorder-drafts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getSuppliers() {
    return this.request('/suppliers');
  },

  // Customers & Campaigns
  getCustomers(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/customers?${q}`);
  },

  getCustomerSegments() {
    return this.request('/customers/segments');
  },

  getCampaigns() {
    return this.request('/campaigns');
  },

  generateCampaign(data) {
    return this.request('/campaigns/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Voice & Agent
  processVoice(data) {
    return this.request('/voice/process', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  askGullak(query, language = 'auto') {
    return this.request('/gullak/ask', {
      method: 'POST',
      body: JSON.stringify({ query, language })
    });
  },

  sendVoice(audioBase64, language = 'auto') {
    return this.request('/gullak/voice', {
      method: 'POST',
      body: JSON.stringify({ audio_base64: audioBase64, language })
    });
  },

  synthesizeTTS(text, language = 'hi-IN') {
    return this.request('/gullak/tts', {
      method: 'POST',
      body: JSON.stringify({ text, language })
    });
  },

  chatAgent(data) {
    return this.request('/agent/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Approvals & Governance
  getApprovals(status) {
    const q = status ? `?status=${status}` : '';
    return this.request(`/approvals${q}`);
  },

  takeApprovalAction(approvalId, action, rejectionReason) {
    return this.request(`/approvals/${approvalId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason: rejectionReason })
    });
  },

  // Consents & Audit
  getConsents() {
    return this.request('/consent');
  },

  withdrawConsent(consentId) {
    return this.request(`/consent/${consentId}/withdraw`, {
      method: 'POST'
    });
  },

  getAuditLogs() {
    return this.request('/audit/events');
  },

  // Finance & Hyperlocal
  getWorkingCapital() {
    return this.request('/finance/working-capital');
  },

  getHyperlocalTrends() {
    return this.request('/hyperlocal/trends');
  },

  getIntegrationsStatus() {
    return this.request('/integrations/status');
  },

  // --- Unified Recommendations & Top 3 ---
  getTop3Actions(lang = 'mr') {
    return this.request(`/recommendations/top3?lang=${lang}`);
  },

  dismissRecommendation(recId) {
    return this.request(`/recommendations/${recId}/dismiss`, { method: 'POST' });
  },

  // --- Closed-Loop Outcomes & Measured Earnings ---
  getOutcomes() {
    return this.request('/outcomes/');
  },

  getEarnings() {
    return this.request('/outcomes/earnings');
  },

  // --- Proactive Daily Brief & Soundbox Script ---
  getDailyBrief(lang = 'mr') {
    return this.request(`/brief/?lang=${lang}`);
  },

  triggerDailyBrief(lang = 'mr') {
    return this.request(`/brief/trigger?lang=${lang}`, { method: 'POST' });
  },

  // --- Cryptographic Audit Verification & Demo Tamper ---
  verifyAuditChain() {
    return this.request('/audit/verify');
  },

  toggleAuditTamper(tamper = true) {
    return this.request(`/audit/tamper?tamper=${tamper}`, { method: 'POST' });
  },

  // --- Demo Environment Control & AI Eval ---
  resetDemo(state = 'before') {
    return this.resetDemoState(state);
  },

  resetDemoState(state = 'before') {
    return this.request(`/eval/demo/reset?state=${state}`, { method: 'POST' });
  },

  getEvaluationMetrics() {
    return this.request('/eval/');
  },

  // --- Gullak What-If Lab ---
  getWhatIfPresets(lang = 'mr') {
    return this.request(`/what-if/presets?lang=${lang}`);
  },

  getWhatIfCommodities(lang = 'mr') {
    return this.request(`/what-if/commodities?lang=${lang}`);
  },

  simulateWhatIf(scenario, params = {}, lang = 'mr', mode = 'KHULA') {
    return this.request(`/what-if/simulate?lang=${lang}`, {
      method: 'POST',
      body: JSON.stringify({ scenario, params, mode })
    });
  },

  // --- Gullak Stock Rescue ---
  getStockRescueOverview(lang = 'mr') {
    return this.request(`/stock-rescue/overview?lang=${lang}`);
  },

  executeStockRescue(itemId, strategy, discountPercent = 15.0) {
    return this.request('/stock-rescue/execute', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        strategy,
        discount_percent: discountPercent
      })
    });
  }
};
