// Common utilities and shared functions for MemberCommons

// Base path detection utility
function getBasePath() {
    // Get the current script's path or the current page path
    const currentPath = window.location.pathname;
    
    // Check if we're in a webroot container (has '/team/' in path)
    if (currentPath.includes('/team/')) {
        // Extract base path up to /team/
        const teamIndex = currentPath.indexOf('/team/');
        return currentPath.substring(0, teamIndex + 6); // Include '/team/'
    }
    
    // For direct repo serving, determine depth based on current location
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    // Remove the current file if it's an HTML file
    if (pathSegments.length > 0 && pathSegments[pathSegments.length - 1].includes('.html')) {
        pathSegments.pop();
    }
    
    // Calculate relative path to repo root
    const depth = pathSegments.length;
    return depth > 0 ? '../'.repeat(depth) : './';
}

// Global base path
const BASE_PATH = getBasePath();

// Function to fix relative paths dynamically
function fixRelativePath(relativePath) {
    if (relativePath.startsWith('../') || relativePath.startsWith('./')) {
        // Already relative, keep as is for direct serving
        if (!window.location.pathname.includes('/team/')) {
            return relativePath;
        }
    }
    
    // For webroot container, use absolute path from webroot
    if (window.location.pathname.includes('/team/')) {
        return '/team/' + relativePath.replace(/^\.\.\/+/, '');
    }
    
    return relativePath;
}

// Function to update favicon dynamically
function updateFaviconPath() {
    const faviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    faviconLinks.forEach(faviconLink => {
        const originalHref = faviconLink.getAttribute('href');
        if (originalHref && !originalHref.startsWith('http')) {
            // Fix any incorrect /team/ paths for direct serving
            if (originalHref.includes('/team/') && !window.location.pathname.includes('/team/')) {
                faviconLink.href = originalHref.replace('/team/', '');
            } else {
                faviconLink.href = fixRelativePath(originalHref);
            }
        }
    });
}

// API Configuration
const API_BASE = 'http://localhost:8081/api';

// OS Detection functionality
function detectOS() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    let detectedOS = '';
    let osDetails = '';
    
    if (userAgent.includes('Mac') || platform.includes('Mac')) {
        detectedOS = 'Mac';
        osDetails = `Detected: macOS (${platform})`;
    } else if (userAgent.includes('Windows') || platform.includes('Win')) {
        detectedOS = 'PC';
        osDetails = `Detected: Windows (${platform})`;
    } else if (userAgent.includes('Linux') || platform.includes('Linux')) {
        detectedOS = 'Linux';
        osDetails = `Detected: Linux (${platform})`;
    } else {
        detectedOS = 'Other';
        osDetails = `Detected: Unknown OS (${platform})`;
    }
    
    return { os: detectedOS, details: osDetails };
}

// Function to create collapsible sections with Done/Show toggle
function makeCollapsible(divId) {
    const targetDiv = document.getElementById(divId);
    if (!targetDiv) return;
    
    // Check if already made collapsible
    if (targetDiv.querySelector('.collapse-toggle-btn')) return;
    
    // Get stored state
    const isCollapsed = localStorage.getItem(`${divId}-collapsed`) === 'true';
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = isCollapsed ? 'collapse-toggle-btn btn btn-secondary' : 'collapse-toggle-btn btn btn-primary';
    toggleBtn.style.cssText = 'position: absolute; top: 16px; right: 16px; padding: 6px 12px; font-size: 12px; z-index: 10;';
    toggleBtn.textContent = isCollapsed ? 'Show' : 'Done';
    
    // Create status div (hidden by default)
    const statusDiv = document.createElement('div');
    statusDiv.className = 'collapse-status';
    statusDiv.style.cssText = 'display: none; color: var(--text-secondary); font-size: 14px; font-style: italic;';
    statusDiv.textContent = 'Section completed and collapsed';
    
    // Wrap existing content
    const originalContent = targetDiv.innerHTML;
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'collapse-content';
    contentWrapper.innerHTML = originalContent;
    
    // Make target div position relative for absolute positioning of button
    targetDiv.style.position = 'relative';
    
    // Clear and rebuild div structure
    targetDiv.innerHTML = '';
    targetDiv.appendChild(toggleBtn);
    targetDiv.appendChild(contentWrapper);
    targetDiv.appendChild(statusDiv);
    
    // Apply initial state
    if (isCollapsed) {
        contentWrapper.style.display = 'none';
        statusDiv.style.display = 'block';
    }
    
    // Add click handler
    toggleBtn.addEventListener('click', function() {
        const isCurrentlyCollapsed = contentWrapper.style.display === 'none';
        
        if (isCurrentlyCollapsed) {
            // Show content
            contentWrapper.style.display = 'block';
            statusDiv.style.display = 'none';
            toggleBtn.textContent = 'Done';
            toggleBtn.className = 'collapse-toggle-btn btn btn-primary';
            localStorage.setItem(`${divId}-collapsed`, 'false');
        } else {
            // Hide content
            contentWrapper.style.display = 'none';
            statusDiv.style.display = 'block';
            toggleBtn.textContent = 'Show';
            toggleBtn.className = 'collapse-toggle-btn btn btn-secondary';
            localStorage.setItem(`${divId}-collapsed`, 'true');
        }
    });
}

// Function to create and render OS detection panel
function createOSDetectionPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }
    
    const panelHTML = `
        <div class="card" id="os-detection-panel">
            <h2 class="card-title" id="cli-tools-title">My Command Line Tool</h2>
            <div style="display: flex; gap: 32px; margin-bottom: 16px;">
                <div>
                    <select id="os" style="padding: 8px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); font-size: 14px; min-width: 150px;">
                        <option value="">Select OS...</option>
                        <option value="Mac">Mac</option>
                        <option value="PC">PC</option>
                        <option value="Linux">Linux</option>
                        <option value="Other">Other</option>
                    </select>
                    <div id="os-info" style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;"></div>
                </div>
                <div>
                    <span style="font-weight: 500; margin-right: 12px;">I'll be coding with...</span><br>
                    <div style="margin-bottom: 4px;"></div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                            <input type="checkbox" id="claude-code-cli" style="margin: 0;">
                            <span>Claude Code CLI (Recommended)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                            <input type="checkbox" id="gemini-cli" style="margin: 0;">
                            <span>Gemini CLI (Not mature yet)</span>
                        </label>
                    </div>
                </div>
            </div>
            <div id="cli-commands" style="display: none;">
                <div id="claude-code-commands" style="display: none;">
                    <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">Claude Code CLI Installation:</h4>
                    <div style="margin: 8px 0 16px 0;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 4px;">
                            <input type="radio" name="claude-install-status" value="initial" style="margin: 0;" checked>
                            <span>Initial install</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                            <input type="radio" name="claude-install-status" value="already" style="margin: 0;">
                            <span>Already installed</span>
                        </label>
                    </div>
                    <div id="claude-install-text" style="display: block; margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
                        If you haven't installed Claude yet, install <a href="https://nodejs.org/en/download" target="_blank" style="color: var(--accent-blue); text-decoration: none;">NodeJS 18+</a>, then install Claude Code CLI with:<br>
                        <pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); font-family: monospace; font-size: 13px; margin: 8px 0 0 0; display: inline-block;"><code>npm install -g @anthropic-ai/claude-code</code></pre>
                    </div>

                    <div id="cli-instructions" style="margin-bottom: 16px;">
                        Right-click on your "<span id="repo-name">team</span>" repo, open a New Terminal at Folder, and run a virtual environment with Claude Code CLI.
                    </div>
                    
                    <div id="command-display" style="font-family: monospace; font-size: 13px; line-height: 1.4; margin: 0;">python3 -m venv env
source env/bin/activate
npx @anthropic-ai/claude-code</div>
                    <div style="font-size: .8em;">
                        Starting a fresh terminal can help save tokens. Claude Pro reserves the right to throttle you after 50 sessions/month, but if sessions are small we assume they'll avoid throttling a fresh-session approach.
                    </div>
                </div>
            </div>
            <div class="cardsection" id="gemini-installation" style="display: none;">
                <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">Gemini CLI Installation:</h4>
                <pre style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); font-family: monospace; font-size: 13px; line-height: 1.4; margin: 0; overflow-x: auto;"><code>python3 -m venv env
source env/bin/activate
npm install -g @google/generative-ai</code></pre>
            </div>
            <div class="cardsection" id="gemini-resources">
                <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">AI Insights Key:</h4>
                <a href="https://ai.google.dev/gemini-api/docs/quickstart">Gemini quickstart</a> - Add your Gemini API key in .env
            </div>
        </div>
    `;
    
    container.innerHTML = panelHTML;
    
    // Initialize the panel after creating it
    initializeOSDetectionPanel();
}

// Function to initialize OS detection panel functionality
function initializeOSDetectionPanel() {
    const osSelect = document.getElementById('os');
    const osInfo = document.getElementById('os-info');
    const claudeCodeCli = document.getElementById('claude-code-cli');
    const geminiCli = document.getElementById('gemini-cli');
    const cliCommands = document.getElementById('cli-commands');
    const claudeCodeCommands = document.getElementById('claude-code-commands');
    const geminiInstallation = document.getElementById('gemini-installation');
    const geminiResources = document.getElementById('gemini-resources');
    const claudeInstallText = document.getElementById('claude-install-text');
    const repoNameSpan = document.getElementById('repo-name');
    
    if (!osSelect || !osInfo) return;
    
    // Auto-detect OS and set initial values
    const osInfo_detected = detectOS();
    const detectedOS = osInfo_detected.os;
    const osDetails = osInfo_detected.details;
    
    osSelect.value = detectedOS;
    osInfo.textContent = osDetails;
    
    // Update repo name from current URL
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    const repoName = pathSegments.length > 0 ? pathSegments[0] : 'webroot';
    if (repoNameSpan) {
        repoNameSpan.textContent = repoName;
    }
    
    // Load saved CLI preferences
    const savedClaudeCode = localStorage.getItem('claude-code-cli-installed');
    const savedGemini = localStorage.getItem('gemini-cli-installed');
    const savedInstallStatus = localStorage.getItem('claude-install-status');
    
    // Check Claude by default if no saved preference exists
    if (claudeCodeCli) {
        if (savedClaudeCode === null) {
            claudeCodeCli.checked = true;
        } else if (savedClaudeCode === 'true') {
            claudeCodeCli.checked = true;
        }
    }
    if (geminiCli && savedGemini === 'true') {
        geminiCli.checked = true;
    }
    
    // Set radio button based on saved preference, default to "initial"
    const initialRadio = document.querySelector('input[name="claude-install-status"][value="initial"]');
    const alreadyRadio = document.querySelector('input[name="claude-install-status"][value="already"]');
    
    if (savedInstallStatus === 'already' && alreadyRadio) {
        alreadyRadio.checked = true;
        initialRadio.checked = false;
    } else {
        // Default to "initial" if no saved preference or if saved preference is "initial"
        if (initialRadio) {
            initialRadio.checked = true;
        }
        if (alreadyRadio) {
            alreadyRadio.checked = false;
        }
    }
    
    // Function to update CLI commands display
    function updateCliCommands() {
        const selectedOS = osSelect.value;
        const claudeCodeChecked = claudeCodeCli ? claudeCodeCli.checked : false;
        const geminiChecked = geminiCli ? geminiCli.checked : false;
        
        // Update title based on number of checked tools
        const cliToolsTitle = document.getElementById('cli-tools-title');
        if (cliToolsTitle) {
            const checkedCount = (claudeCodeChecked ? 1 : 0) + (geminiChecked ? 1 : 0);
            if (checkedCount === 2) {
                cliToolsTitle.textContent = 'My Command Line Tools';
            } else {
                cliToolsTitle.textContent = 'My Command Line Tool';
            }
        }
        
        // Show/hide Claude install text based on radio button selection
        const initialInstallRadio = document.querySelector('input[name="claude-install-status"][value="initial"]');
        if (claudeInstallText && initialInstallRadio) {
            if (initialInstallRadio.checked) {
                claudeInstallText.style.display = 'block';
            } else {
                claudeInstallText.style.display = 'none';
            }
        }
        
        // Show CLI commands only when Claude Code CLI is checked
        if (cliCommands) {
            if (claudeCodeChecked) {
                cliCommands.style.display = 'block';
            } else {
                cliCommands.style.display = 'none';
                return;
            }
        }
        
        // Update Claude Code CLI commands based on OS
        if (claudeCodeCommands) {
            if (claudeCodeChecked) {
                claudeCodeCommands.style.display = 'block';
                updateCommandsForOS(selectedOS);
            } else {
                claudeCodeCommands.style.display = 'none';
            }
        }
    }
    
    // Separate function to update commands - called after DOM is ready
    function updateCommandsForOS(selectedOS) {
        // Find the command display div
        let commandDisplay = document.getElementById('command-display');
        
        // If not found directly, look for it within collapsed content
        if (!commandDisplay) {
            const claudeCodeCommands = document.getElementById('claude-code-commands');
            if (claudeCodeCommands) {
                commandDisplay = claudeCodeCommands.querySelector('#command-display') || 
                               claudeCodeCommands.querySelector('.collapse-content #command-display');
            }
        }
        
        if (commandDisplay) {
            let newContent = '';
            
            if (selectedOS === 'Mac' || selectedOS === 'Linux') {
                newContent = `<pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); margin: 8px 0;"><code>python3 -m venv env
source env/bin/activate
npx @anthropic-ai/claude-code</code></pre>`;
            } else if (selectedOS === 'PC') {
                // Check if Initial install radio button is selected
                const initialInstallRadio = document.querySelector('input[name="claude-install-status"][value="initial"]');
                const isInitialInstall = initialInstallRadio && initialInstallRadio.checked;
                
                if (isInitialInstall) {
                    // Show only first time instructions for initial install
                    newContent = `WindowsOS (first time)

<pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); margin: 8px 0;"><code>python -m venv env && env\\Scripts\\activate.bat && npx @anthropic-ai/claude-code</code></pre>

Install Node.js if this <a href="https://nodejs.org/" target="_blank" style="color: var(--accent-blue); text-decoration: none;">https://nodejs.org/</a>

<pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); margin: 8px 0;"><code>npx @anthropic-ai/claude-code</code></pre>`;
                } else {
                    // Show only subsequent times for already installed
                    newContent = `WindowsOS (subsequent times)

<pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); margin: 8px 0;"><code>python -m venv env && env\\Scripts\\activate.bat && npx @anthropic-ai/claude-code</code></pre>`;
                }
            } else {
                newContent = `# For Unix/Linux/Mac:
<pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); margin: 8px 0;"><code>python3 -m venv env
source env/bin/activate
npx @anthropic-ai/claude-code</code></pre>

# For Windows:
<pre style="background: var(--bg-primary); padding: 8px 12px; border-radius: var(--radius-sm); margin: 8px 0;"><code>python -m venv env
env\\Scripts\\activate.bat
npx @anthropic-ai/claude-code</code></pre>`;
            }
            
            commandDisplay.innerHTML = newContent;
            console.log('Updated commands for', selectedOS, '- Element in DOM:', document.contains(commandDisplay));
        } else {
            console.log('Could not find command-display element for OS:', selectedOS);
        }
        
        // Update Gemini installation section (only show when Gemini CLI is checked)
        if (geminiInstallation) {
            if (geminiChecked) {
                geminiInstallation.style.display = 'block';
            } else {
                geminiInstallation.style.display = 'none';
            }
        }
        
        // Gemini resources section is always visible (no conditional display)
    }
    
    // Add OS select change event listener
    osSelect.addEventListener('change', function() {
        const selectedOS = this.value;
        if (selectedOS) {
            osInfo.textContent = `Selected: ${selectedOS}`;
        } else {
            osInfo.textContent = osDetails; // Show detection again if blank is selected
        }
        updateCliCommands();
    });
    
    // Add checkbox event listeners
    if (claudeCodeCli) {
        claudeCodeCli.addEventListener('change', function() {
            localStorage.setItem('claude-code-cli-installed', this.checked);
            updateCliCommands();
        });
    }
    
    if (geminiCli) {
        geminiCli.addEventListener('change', function() {
            localStorage.setItem('gemini-cli-installed', this.checked);
            updateCliCommands();
        });
    }
    
    // Add event listeners for Claude install status radio buttons
    const installStatusRadios = document.querySelectorAll('input[name="claude-install-status"]');
    installStatusRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Save the selected radio button value to localStorage
            localStorage.setItem('claude-install-status', this.value);
            updateCliCommands();
        });
    });
    
    // Initial update
    updateCliCommands();
    
    // Make sections collapsible after initialization
    setTimeout(() => {
        makeCollapsible('cli-commands');
        makeCollapsible('gemini-installation');
        makeCollapsible('gemini-resources');
    }, 100);
}

// API utility function
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        // Return placeholder data for development
        return {
            error: true,
            message: 'Connection failed - showing placeholder data',
            data: null
        };
    }
}

// Notification utility
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-feather="${type === 'success' ? 'check-circle' : 'info'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i data-feather="x"></i>
        </button>
    `;

    document.body.appendChild(notification);
    
    // Initialize feather icons if available
    if (window.feather) {
        feather.replace();
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Utility to safely get element by ID
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID '${id}' not found`);
    }
    return element;
}

// Utility to safely query selector
function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element with selector '${selector}' not found`);
    }
    return element;
}

// Initialize Feather icons safely
function initializeFeatherIcons() {
    // Wait for feather to be available
    const featherLib = (typeof feather !== 'undefined' && feather) || window.feather;
    
    if (featherLib && featherLib.replace && featherLib.icons) {
        // Always use manual processing to avoid bulk replace issues
        const featherElements = document.querySelectorAll('[data-feather]');
        
        featherElements.forEach(el => {
            const iconName = el.getAttribute('data-feather');
            
            // Skip if no icon name or already processed
            if (!iconName || !iconName.trim() || el.querySelector('svg')) {
                return;
            }
            
            // Check if icon exists in feather library
            if (featherLib.icons && featherLib.icons[iconName]) {
                try {
                    const icon = featherLib.icons[iconName];
                    if (icon && typeof icon.toSvg === 'function') {
                        el.innerHTML = icon.toSvg();
                    }
                } catch (iconError) {
                    console.warn(`Failed to render icon: ${iconName}`, iconError);
                }
            } else {
                console.warn(`Icon '${iconName}' not found in Feather library`);
            }
        });
    } else {
        // Wait a bit and try again (max 3 seconds)
        if (!initializeFeatherIcons._retryCount) {
            initializeFeatherIcons._retryCount = 0;
        }
        
        if (initializeFeatherIcons._retryCount < 30) {
            initializeFeatherIcons._retryCount++;
            setTimeout(() => {
                if (typeof feather !== 'undefined' || window.feather) {
                    initializeFeatherIcons();
                }
            }, 100);
        }
    }
}

// Wait for DOM and dependencies to be ready
function waitForDependencies(callback, dependencies = ['feather'], maxWait = 5000) {
    const startTime = Date.now();
    
    function checkDependencies() {
        const allReady = dependencies.every(dep => {
            return (typeof window[dep] !== 'undefined' && window[dep]) || 
                   (typeof globalThis[dep] !== 'undefined' && globalThis[dep]);
        });
        
        if (allReady) {
            callback();
        } else if (Date.now() - startTime < maxWait) {
            setTimeout(checkDependencies, 50);
        } else {
            console.warn('Dependencies not loaded in time:', dependencies);
            callback(); // Continue anyway
        }
    }
    
    checkDependencies();
}

// Export functions for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCall,
        showNotification,
        formatDate,
        safeGetElement,
        safeQuerySelector,
        initializeFeatherIcons,
        waitForDependencies,
        API_BASE
    };
}

// File Display System - Enhanced markdown file loading
class FileDisplaySystem {
    constructor() {
        this.log = [];
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.log.push(logEntry);
        console.log(logEntry);
    }

    // Enhanced displayFile function
    async displayFile(pagePath, divID, target, callback, enableLogging = true) {
        if (enableLogging) {
            this.addLog(`📄 Loading file: ${pagePath}`);
        }
        
        try {
            // Load dependencies
            await this.loadDependencies(enableLogging);
            
            // Process the file path
            const pathInfo = this.processFilePath(pagePath);
            
            // Fetch and process the markdown file
            const content = await this.fetchFileContent(pagePath, enableLogging);
            const processedHTML = await this.processMarkdownContent(content, pathInfo, enableLogging);
            
            // Load content into target div
            this.loadContentIntoDiv(divID, processedHTML, target);
            
            if (enableLogging) {
                this.addLog(`✅ File loaded successfully: ${pagePath}`);
            }
            
            // Execute callback if provided
            if (typeof callback === 'function') {
                setTimeout(callback, 50);
            }
            
        } catch (error) {
            if (enableLogging) {
                this.addLog(`❌ Failed to load file: ${error.message}`);
            }
            this.showError(`Failed to load ${pagePath}: ${error.message}`, divID);
        }
    }

    // Load required dependencies
    async loadDependencies(enableLogging = true) {
        const dependencies = [
            {
                url: 'https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js',
                check: () => window.showdown,
                name: 'showdown'
            }
        ];

        for (const dep of dependencies) {
            if (!dep.check()) {
                await this.loadScript(dep.url, dep.name, enableLogging);
            }
        }
    }

    // Load external script with promise
    loadScript(src, name, enableLogging = true) {
        return new Promise((resolve, reject) => {
            if (enableLogging) {
                this.addLog(`📥 Loading dependency: ${name}`);
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                if (enableLogging) {
                    this.addLog(`✅ Loaded dependency: ${name}`);
                }
                resolve();
            };
            script.onerror = () => {
                const error = `Failed to load ${name} from ${src}`;
                if (enableLogging) {
                    this.addLog(`❌ ${error}`);
                }
                reject(new Error(error));
            };
            
            document.head.appendChild(script);
        });
    }

    // Process file path to extract folder information
    processFilePath(pagePath) {
        let pageFolder = pagePath;
        
        // Remove query parameters
        if (pageFolder.lastIndexOf('?') > 0) {
            pageFolder = pageFolder.substring(0, pageFolder.lastIndexOf('?'));
        }
        
        // Extract folder path (remove filename if present)
        if (pageFolder.lastIndexOf('.') > pageFolder.lastIndexOf('/')) {
            pageFolder = pageFolder.substring(0, pageFolder.lastIndexOf('/')) + "/";
        }
        
        if (pageFolder === "/") {
            pageFolder = "";
        }
        
        // Handle GitHub wiki URLs
        if (pageFolder.indexOf('https://raw.githubusercontent.com/wiki') >= 0) {
            pageFolder = pageFolder.replace("https://raw.githubusercontent.com/wiki/", "https://github.com/") + "/wiki/";
        }
        
        return {
            originalPath: pagePath,
            folderPath: pageFolder,
            fileName: pagePath.split('/').pop()
        };
    }

    // Fetch file content
    async fetchFileContent(pagePath, enableLogging = true) {
        if (enableLogging) {
            this.addLog(`🔍 Fetching content from: ${pagePath}`);
        }
        
        try {
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            if (enableLogging) {
                this.addLog(`📊 Content loaded: ${content.length} characters`);
            }
            return content;
            
        } catch (error) {
            throw new Error(`Failed to fetch ${pagePath}: ${error.message}`);
        }
    }

    // Process markdown content with showdown
    async processMarkdownContent(content, pathInfo, enableLogging = true) {
        if (!window.showdown) {
            throw new Error('Showdown markdown processor not loaded');
        }
        
        if (enableLogging) {
            this.addLog(`🔄 Processing markdown content...`);
        }
        
        // Configure showdown converter with enhanced options
        const converter = new showdown.Converter({
            tables: true,
            metadata: true,
            simpleLineBreaks: true,
            ghCodeBlocks: true,
            tasklists: true,
            strikethrough: true,
            emoji: true,
            underline: true
        });
        
        // Convert markdown to HTML
        const html = converter.makeHtml(content);
        
        // Add edit link for GitHub files
        const editLink = this.createEditLink(pathInfo.originalPath);
        
        // Combine edit link with content
        return editLink + html;
    }

    // Create edit link for GitHub files
    createEditLink(pagePath) {
        if (pagePath.includes('github.com') || pagePath.includes('raw.githubusercontent.com')) {
            return `<div class='edit-link' style='float:right;z-index:1;cursor:pointer;text-decoration:none;opacity:.7;margin-bottom:10px'>
                        <a href='${pagePath}' target='_blank' style='color:var(--text-secondary);text-decoration:none;font-size:14px'>
                            📝 Edit on GitHub
                        </a>
                    </div>`;
        }
        return '';
    }

    // Load content into specified div
    loadContentIntoDiv(divID, html, target) {
        const targetDiv = document.getElementById(divID);
        if (!targetDiv) {
            throw new Error(`Target div with ID '${divID}' not found`);
        }
        
        // Handle different target options
        switch (target) {
            case '_parent':
                targetDiv.innerHTML = html;
                break;
            case '_append':
                targetDiv.innerHTML += html;
                break;
            case '_prepend':
                targetDiv.innerHTML = html + targetDiv.innerHTML;
                break;
            default:
                targetDiv.innerHTML = html;
        }
        
        // Add some basic styling to the loaded content
        targetDiv.style.lineHeight = '1.6';
        targetDiv.style.color = 'var(--text-primary)';
        
        // Style code blocks
        const codeBlocks = targetDiv.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            block.style.background = '#f6f8fa';
            block.style.padding = '16px';
            block.style.borderRadius = '6px';
            block.style.fontSize = '14px';
            block.style.fontFamily = 'monospace';
        });
        
        // Style tables
        const tables = targetDiv.querySelectorAll('table');
        tables.forEach(table => {
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';
            table.style.margin = '16px 0';
        });
        
        const cells = targetDiv.querySelectorAll('td, th');
        cells.forEach(cell => {
            cell.style.border = '1px solid var(--border-light)';
            cell.style.padding = '8px 12px';
            cell.style.textAlign = 'left';
        });
        
        const headers = targetDiv.querySelectorAll('th');
        headers.forEach(header => {
            header.style.background = 'var(--bg-tertiary)';
            header.style.fontWeight = '600';
        });

        const lists = targetDiv.querySelectorAll('ul, ol');
        lists.forEach(list => {
            list.style.marginLeft = '20px';
        });
    }

    showError(message, containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div style="color: #EF4444; padding: 16px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">${message}</div>`;
        }
    }
}

// Create global instance
const fileDisplaySystem = new FileDisplaySystem();

// Global displayFile function for easy usage
function displayFile(pagePath, divID, target, callback, enableLogging = true) {
    fileDisplaySystem.displayFile(pagePath, divID, target, callback, enableLogging);
}

// Initialize path fixes when page loads
function initializePathFixes() {
    updateFaviconPath();
    console.log('Base path detected:', BASE_PATH);
    console.log('Current path:', window.location.pathname);
    
    // Watch for favicon changes and fix them immediately
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.tagName === 'LINK' && 
                        (node.rel === 'icon' || node.rel === 'shortcut icon')) {
                        setTimeout(updateFaviconPath, 10); // Fix after a brief delay
                    }
                });
            }
        });
    });
    observer.observe(document.head, { childList: true, subtree: true });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePathFixes);
} else {
    initializePathFixes();
}

// Make functions globally available
window.apiCall = apiCall;
window.showNotification = showNotification;
window.formatDate = formatDate;
window.safeGetElement = safeGetElement;
window.safeQuerySelector = safeQuerySelector;
window.initializeFeatherIcons = initializeFeatherIcons;
window.waitForDependencies = waitForDependencies;
window.displayFile = displayFile;
window.fileDisplaySystem = fileDisplaySystem;
window.getBasePath = getBasePath;
window.fixRelativePath = fixRelativePath;
window.updateFaviconPath = updateFaviconPath;
window.BASE_PATH = BASE_PATH;