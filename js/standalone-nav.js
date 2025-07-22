// Standalone Navigation System - JavaScript
// Optimized version with memory leak fixes and performance improvements

class StandaloneNavigation {
    constructor(options = {}) {
        // Singleton pattern to prevent multiple instances
        if (StandaloneNavigation.instance) {
            return StandaloneNavigation.instance;
        }
        
        this.options = {
            basePath: options.basePath || '',
            currentPage: options.currentPage || 'admin',
            isWebrootContainer: options.isWebrootContainer || false,
            repoFolderName: options.repoFolderName || null,
            ...options
        };
        
        this.isCollapsed = false;
        this.isLocked = false; // New state for locked collapsed mode
        this.isMobile = window.innerWidth <= 768;
        this.mobileOpen = false;
        
        // Store event listeners for cleanup
        this.eventListeners = [];
        this.featherTimeout = null;
        this.resizeTimeout = null;
        
        StandaloneNavigation.instance = this;
        this.init();
    }
    
    init() {
        this.checkMobile();
        this.createNavigation();
        this.setupEventListeners();
        this.setupMobileHandlers();
        this.initializeFeatherIcons();
    }
    
    // Debounced resize handler to prevent excessive calls
    checkMobile() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.handleMobileChange();
            }
        }, 100);
    }
    
    handleMobileChange() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (this.isMobile) {
            sidebar?.classList.remove('collapsed', 'hovered', 'locked');
            overlay?.classList.remove('active');
            this.isLocked = false;
        } else {
            sidebar?.classList.remove('mobile-open');
            this.mobileOpen = false;
        }
    }
    
    createNavigation() {
        // Check if navigation already exists to prevent duplicates
        const existingSidebar = document.getElementById('standalone-sidebar');
        if (existingSidebar) {
            // Remove existing navigation to recreate it
            existingSidebar.remove();
        }
        
        // Also remove any existing app-container to ensure clean slate
        const existingAppContainer = document.querySelector('.app-container');
        if (existingAppContainer) {
            // Move main content back to body before removing container
            const mainContent = existingAppContainer.querySelector('.main-content');
            if (mainContent) {
                const children = [...mainContent.children];
                children.forEach(child => {
                    document.body.appendChild(child);
                });
            }
            existingAppContainer.remove();
        }
        
        const basePath = this.options.basePath || '';
        const isWebrootContainer = this.options.isWebrootContainer;
        const repoFolderName = this.options.repoFolderName;
        
        // Calculate paths based on container type
        let rootPath, adminPath, logoPath;
        
        if (isWebrootContainer && repoFolderName) {
            // In webroot container, need to include repo folder in paths
            const repoPath = `/${repoFolderName}/`;
            rootPath = repoPath;
            adminPath = `${repoPath}admin/`;
            logoPath = basePath ? `${basePath}${basePath.endsWith('/') ? '' : '/'}img/logo/neighborhood/favicon.png` : 'img/logo/neighborhood/favicon.png';
            //alert(logoPath)
        } else {
            // Direct repo serving
            rootPath = basePath ? `${basePath}/` : './';
            adminPath = basePath ? `${basePath}/admin/` : './admin/';
            logoPath = basePath ? `${basePath}${basePath.endsWith('/') ? '' : '/'}img/logo/neighborhood/favicon.png` : 'img/logo/neighborhood/favicon.png';
        }
        
        // Debug logging
        console.log('Navigation paths:', { repoFolderName, isWebrootContainer, basePath, rootPath, adminPath, logoPath });
        
        const navHTML = `
            <div class="sidebar" id="standalone-sidebar">
                <div class="sidebar-header">
                    <div class="logo">
                        <a href="${rootPath}"><img src="${logoPath}" alt="Up" /></a>
                    </div>
                    <span class="logo-text">MemberCommons</span>
                </div>
                
                <div class="nav-menu">
                    <div class="nav-section">
                        <div class="nav-item">
                            <button class="nav-link" data-section="home" data-href="${rootPath}#home/welcome">
                                <i class="nav-icon" data-feather="home"></i>
                                <span class="nav-text">Home</span>
                                <i class="nav-arrow" data-feather="chevron-right"></i>
                            </button>
                            <div class="subnav">
                                <a href="${rootPath}#home/welcome" class="subnav-link">
                                    <i class="subnav-icon" data-feather="smile"></i>
                                    <span>Welcome</span>
                                </a>
                                <a href="${rootPath}#home/documentation" class="subnav-link">
                                    <i class="subnav-icon" data-feather="book"></i>
                                    <span>Getting Started</span>
                                </a>
                                <a href="/projects" class="subnav-link">
                                    <i class="subnav-icon" data-feather="bar-chart-2"></i>
                                    <span>Active Projects</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="nav-section">
                        <div class="nav-item">
                            <button class="nav-link" data-section="projects" data-href="${rootPath}#projects/opportunities">
                                <i class="nav-icon" data-feather="folder"></i>
                                <span class="nav-text">Projects</span>
                                <i class="nav-arrow" data-feather="chevron-right"></i>
                            </button>
                            <div class="subnav">
                                <a href="${rootPath}projects/#list=democracylab" class="subnav-link">
                                    <i class="subnav-icon" data-feather="code"></i>
                                    <span>Democracy Lab Projects</span>
                                </a>
                                <a href="${rootPath}#projects/opportunities" class="subnav-link">
                                    <i class="subnav-icon" data-feather="target"></i>
                                    <span>Opportunities</span>
                                </a>
                                <a href="${rootPath}#projects/assigned-tasks" class="subnav-link">
                                    <i class="subnav-icon" data-feather="check-square"></i>
                                    <span>Assigned Tasks</span>
                                </a>
                                <a href="/data-commons/docs/data/" class="subnav-link">
                                    <i class="subnav-icon" data-feather="calendar"></i>
                                    <span>UN Timelines</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="nav-section">
                        <div class="nav-item">
                            <button class="nav-link" data-section="people" data-href="${rootPath}projects/#list=modelteam">
                                <i class="nav-icon" data-feather="users"></i>
                                <span class="nav-text">People & Teams</span>
                                <i class="nav-arrow" data-feather="chevron-right"></i>
                            </button>
                            <div class="subnav">
                                <a href="${rootPath}projects/#list=modelteam" class="subnav-link">
                                    <i class="subnav-icon" data-feather="map"></i>
                                    <span>Model Team</span>
                                </a>
                                <a href="${rootPath}#people/people" class="subnav-link">
                                    <i class="subnav-icon" data-feather="user"></i>
                                    <span>People</span>
                                </a>
                                <a href="${rootPath}#people/teams" class="subnav-link">
                                    <i class="subnav-icon" data-feather="users"></i>
                                    <span>Teams</span>
                                </a>
                                <a href="${rootPath}#people/organizations" class="subnav-link">
                                    <i class="subnav-icon" data-feather="grid"></i>
                                    <span>Organizations</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="nav-section">
                        <div class="nav-item">
                            <button class="nav-link" data-section="account" data-href="${rootPath}#account/preferences">
                                <i class="nav-icon" data-feather="settings"></i>
                                <span class="nav-text">My Account</span>
                                <i class="nav-arrow" data-feather="chevron-right"></i>
                            </button>
                            <div class="subnav">
                                <a href="${rootPath}#account/preferences" class="subnav-link">
                                    <i class="subnav-icon" data-feather="sliders"></i>
                                    <span>Preferences</span>
                                </a>
                                <a href="${rootPath}#account/skills" class="subnav-link">
                                    <i class="subnav-icon" data-feather="award"></i>
                                    <span>Skills</span>
                                </a>
                                <a href="${rootPath}#account/interests" class="subnav-link">
                                    <i class="subnav-icon" data-feather="heart"></i>
                                    <span>Interests</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="nav-section">
                        <div class="nav-item">
                            <button class="nav-link ${this.options.currentPage === 'admin' ? 'active' : ''}" data-section="admin" data-href="${adminPath}">
                                <i class="nav-icon" data-feather="tool"></i>
                                <span class="nav-text">Admin Dashboard</span>
                                <i class="nav-arrow" data-feather="chevron-right"></i>
                            </button>
                            <div class="subnav">
                                <a href="${adminPath}../projects/" class="subnav-link">
                                    <i class="subnav-icon" data-feather="users"></i>
                                    <span>Meetup Integration</span>
                                </a>
                                <a href="${adminPath}google/" class="subnav-link">
                                    <i class="subnav-icon" data-feather="zap"></i>
                                    <span>Configure Server</span>
                                </a>
                                <a href="${adminPath}sql/panel/" class="subnav-link">
                                    <i class="subnav-icon" data-feather="database"></i>
                                    <span>Database Admin</span>
                                </a>
                                <a href="${adminPath}import-data.html" class="subnav-link">
                                    <i class="subnav-icon" data-feather="upload"></i>
                                    <span>Data Import</span>
                                </a>
                                <a href="${adminPath}log-output/" class="subnav-link">
                                    <i class="subnav-icon" data-feather="monitor"></i>
                                    <span>Log Monitor</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-footer">
                    <button class="sidebar-toggle" id="sidebar-toggle">
                        <i data-feather="chevrons-left"></i>
                    </button>
                </div>
                
                <div class="sidebar-expander" id="sidebar-expander" title="Click to expand navigation"></div>
            </div>
            
            <div class="mobile-overlay" id="mobile-overlay"></div>
        `;
        
        // Create app container if it doesn't exist
        let appContainer = document.querySelector('.app-container');
        if (!appContainer) {
            // Store existing content efficiently
            const existingContent = [...document.body.children];
            
            // Create and setup app container
            appContainer = document.createElement('div');
            appContainer.className = 'app-container';
            
            // Clear body and add app container
            document.body.innerHTML = '';
            document.body.appendChild(appContainer);
            
            // Add navigation
            appContainer.innerHTML = navHTML;
            
            // Create main content area
            const mainContent = document.createElement('div');
            mainContent.className = 'main-content';
            appContainer.appendChild(mainContent);
            
            // Move existing content with bounds checking
            existingContent.forEach(element => {
                if (element && element.nodeType === Node.ELEMENT_NODE) {
                    mainContent.appendChild(element);
                }
            });
        }
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            const toggleHandler = () => this.toggleSidebar();
            sidebarToggle.addEventListener('click', toggleHandler);
            this.eventListeners.push({ element: sidebarToggle, event: 'click', handler: toggleHandler });
        }
        
        // Window resize with cleanup tracking
        const resizeHandler = () => this.checkMobile();
        window.addEventListener('resize', resizeHandler);
        this.eventListeners.push({ element: window, event: 'resize', handler: resizeHandler });
        
        // Navigation hover effects
        const sidebar = document.getElementById('standalone-sidebar');
        if (sidebar) {
            const mouseEnterHandler = () => {
                if (this.isCollapsed && !this.isLocked && !this.isMobile) {
                    sidebar.classList.add('hovered');
                }
            };
            
            const mouseLeaveHandler = () => {
                if (this.isCollapsed && !this.isLocked && !this.isMobile) {
                    sidebar.classList.remove('hovered');
                }
            };
            
            sidebar.addEventListener('mouseenter', mouseEnterHandler);
            sidebar.addEventListener('mouseleave', mouseLeaveHandler);
            
            this.eventListeners.push(
                { element: sidebar, event: 'mouseenter', handler: mouseEnterHandler },
                { element: sidebar, event: 'mouseleave', handler: mouseLeaveHandler }
            );
        }
        
        // Sidebar expander click handler
        const sidebarExpander = document.getElementById('sidebar-expander');
        if (sidebarExpander) {
            const expanderHandler = () => {
                if (this.isCollapsed && this.isLocked && !this.isMobile) {
                    this.unlockSidebar();
                }
            };
            
            sidebarExpander.addEventListener('click', expanderHandler);
            this.eventListeners.push({ element: sidebarExpander, event: 'click', handler: expanderHandler });
        }
        
        // Navigation click handling - differentiate between arrow and main button clicks
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const clickHandler = (e) => {
                if (e.target.closest('.nav-arrow') || e.target.classList.contains('nav-arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // For all nav arrows, toggle the subnav
                    this.toggleSubnav(link);
                } else {
                    // Handle main button clicks - check if already on target page
                    if (link.hasAttribute('data-href')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const href = link.getAttribute('data-href');
                        const hashMatch = href.match(/#([^']+)/);
                        
                        if (hashMatch) {
                            const targetHash = hashMatch[1];
                            const currentHash = window.location.hash.substring(1);
                            
                            // If already on the target page, navigate to the hash
                            if (currentHash === targetHash) {
                                window.location.href = href;
                            } else {
                                // Navigate to the target page
                                window.location.href = href;
                            }
                        } else {
                            // Direct navigation (like admin path)
                            window.location.href = href;
                        }
                    }
                }
            };
            
            // Tooltip handlers for collapsed nav
            const mouseEnterHandler = (e) => {
                if (this.isCollapsed && this.isLocked) {
                    this.showTooltip(e, link);
                }
            };
            
            const mouseLeaveHandler = () => {
                if (this.isCollapsed && this.isLocked) {
                    // Add a small delay to allow moving to the tooltip
                    setTimeout(() => {
                        const tooltip = document.getElementById('nav-tooltip');
                        if (tooltip && !tooltip.matches(':hover')) {
                            this.hideTooltip();
                        }
                    }, 100);
                }
            };
            
            link.addEventListener('click', clickHandler);
            link.addEventListener('mouseenter', mouseEnterHandler);
            link.addEventListener('mouseleave', mouseLeaveHandler);
            
            this.eventListeners.push(
                { element: link, event: 'click', handler: clickHandler },
                { element: link, event: 'mouseenter', handler: mouseEnterHandler },
                { element: link, event: 'mouseleave', handler: mouseLeaveHandler }
            );
        });
        
        // Global click handler for mobile menu
        const globalClickHandler = (e) => {
            if (this.isMobile && this.mobileOpen) {
                const sidebar = document.getElementById('standalone-sidebar');
                if (sidebar && !sidebar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        };
        
        document.addEventListener('click', globalClickHandler);
        this.eventListeners.push({ element: document, event: 'click', handler: globalClickHandler });
    }
    
    setupMobileHandlers() {
        // Mobile menu toggle button
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            const toggleHandler = () => this.toggleMobileMenu();
            mobileToggle.addEventListener('click', toggleHandler);
            this.eventListeners.push({ element: mobileToggle, event: 'click', handler: toggleHandler });
        }
        
        // Overlay click to close
        const overlay = document.getElementById('mobile-overlay');
        if (overlay) {
            const overlayHandler = () => this.closeMobileMenu();
            overlay.addEventListener('click', overlayHandler);
            this.eventListeners.push({ element: overlay, event: 'click', handler: overlayHandler });
        }
    }
    
    toggleSidebar() {
        if (this.isMobile) {
            this.toggleMobileMenu();
            return;
        }
        
        const sidebar = document.getElementById('standalone-sidebar');
        if (sidebar) {
            if (this.isCollapsed) {
                // Expanding - unlock if locked
                this.isCollapsed = false;
                this.isLocked = false;
                sidebar.classList.remove('collapsed', 'locked', 'hovered');
            } else {
                // Collapsing - lock it collapsed
                this.isCollapsed = true;
                this.isLocked = true;
                sidebar.classList.add('collapsed', 'locked');
                sidebar.classList.remove('hovered');
            }
            
            // Update toggle icon with debouncing
            this.debouncedUpdateToggleIcon();
            
            // Update expander tooltip
            this.updateExpanderTooltip();
            
            // Store state in localStorage
            localStorage.setItem('standaloneNavCollapsed', this.isCollapsed);
            localStorage.setItem('standaloneNavLocked', this.isLocked);
        }
    }
    
    unlockSidebar() {
        const sidebar = document.getElementById('standalone-sidebar');
        if (sidebar) {
            this.isCollapsed = false;
            this.isLocked = false;
            sidebar.classList.remove('collapsed', 'locked', 'hovered');
            
            // Update toggle icon with debouncing
            this.debouncedUpdateToggleIcon();
            
            // Update expander tooltip
            this.updateExpanderTooltip();
            
            // Store state in localStorage
            localStorage.setItem('standaloneNavCollapsed', this.isCollapsed);
            localStorage.setItem('standaloneNavLocked', this.isLocked);
        }
    }
    
    // Debounced icon update to prevent excessive DOM manipulation
    debouncedUpdateToggleIcon() {
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        
        this.featherTimeout = setTimeout(() => {
            this.updateToggleIcon();
        }, 50);
    }
    
    updateToggleIcon() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (!sidebarToggle) return;
        
        // Check actual sidebar state from DOM
        const sidebar = document.getElementById('standalone-sidebar');
        const actuallyCollapsed = sidebar?.classList.contains('collapsed') || false;
        
        // Sync the class property with actual DOM state
        this.isCollapsed = actuallyCollapsed;
        
        // Target icon based on state
        const targetIcon = this.isCollapsed ? 'chevrons-right' : 'chevrons-left';
        
        // Clear all existing icons (both <i> and <svg> elements)
        sidebarToggle.innerHTML = '';
        
        // Create new icon element
        const icon = document.createElement('i');
        icon.setAttribute('data-feather', targetIcon);
        sidebarToggle.appendChild(icon);
        
        // Debounced feather icon refresh
        this.refreshFeatherIcons();
    }
    
    toggleMobileMenu() {
        const sidebar = document.getElementById('standalone-sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        this.mobileOpen = !this.mobileOpen;
        
        sidebar?.classList.toggle('mobile-open', this.mobileOpen);
        overlay?.classList.toggle('active', this.mobileOpen);
    }
    
    closeMobileMenu() {
        const sidebar = document.getElementById('standalone-sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        this.mobileOpen = false;
        
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
    }
    
    toggleSubnav(navLink) {
        const subnav = navLink.parentElement?.querySelector('.subnav');
        const arrow = navLink.querySelector('.nav-arrow');
        
        if (subnav && arrow) {
            const isExpanded = subnav.classList.contains('expanded');
            
            subnav.classList.toggle('expanded', !isExpanded);
            arrow.classList.toggle('expanded', !isExpanded);
        }
    }
    
    navigateToRoot(hash = '') {
        const basePath = this.options.basePath;
        const rootPath = basePath ? `${basePath}/index.html` : './index.html';
        window.location.href = rootPath + hash;
    }
    
    navigateToAdmin() {
        const basePath = this.options.basePath;
        const adminPath = basePath ? `${basePath}/admin/` : './admin/';
        window.location.href = adminPath;
    }
    
    // Debounced feather icon refresh
    refreshFeatherIcons() {
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        
        this.featherTimeout = setTimeout(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 100);
    }
    
    initializeFeatherIcons() {
        this.refreshFeatherIcons();
    }
    
    // Restore collapsed state from localStorage
    restoreState() {
        const savedCollapsed = localStorage.getItem('standaloneNavCollapsed');
        const savedLocked = localStorage.getItem('standaloneNavLocked');
        const sidebar = document.getElementById('standalone-sidebar');
        
        if (savedCollapsed === 'true' && !this.isMobile) {
            this.isCollapsed = true;
            this.isLocked = savedLocked === 'true';
            sidebar?.classList.add('collapsed');
            if (this.isLocked) {
                sidebar?.classList.add('locked');
            }
        } else {
            this.isCollapsed = false;
            this.isLocked = false;
            sidebar?.classList.remove('collapsed', 'locked');
        }
        
        // Update expander tooltip based on state
        this.updateExpanderTooltip();
        
        // Update icon to match current state
        this.debouncedUpdateToggleIcon();
    }
    
    updateExpanderTooltip() {
        const expander = document.getElementById('sidebar-expander');
        if (expander) {
            if (this.isCollapsed && this.isLocked) {
                expander.title = 'Click to unlock navigation';
            } else if (this.isCollapsed && !this.isLocked) {
                expander.title = 'Hover to expand navigation';
            } else {
                expander.title = 'Click arrow to collapse navigation';
            }
        }
    }
    
    showTooltip(event, navLink) {
        // Remove existing tooltip
        this.hideTooltip();
        
        // Get the nav text content
        const navText = navLink.querySelector('.nav-text');
        if (!navText) return;
        
        const tooltipText = navText.textContent.trim();
        if (!tooltipText) return;
        
        // Get the nav icon
        const navIcon = navLink.querySelector('.nav-icon');
        if (!navIcon) return;
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip show';
        tooltip.id = 'nav-tooltip';
        
        // Create clickable link wrapper
        const tooltipLink = document.createElement('button');
        tooltipLink.className = 'tooltip-link';
        
        // Copy the navigation functionality from the main nav button
        const href = navLink.getAttribute('data-href');
        if (href) {
            tooltipLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const hashMatch = href.match(/#([^']+)/);
                
                if (hashMatch) {
                    const targetHash = hashMatch[1];
                    const currentHash = window.location.hash.substring(1);
                    
                    // If already on the target page, navigate to the hash
                    if (currentHash === targetHash) {
                        window.location.href = href;
                    } else {
                        // Navigate to the target page
                        window.location.href = href;
                    }
                } else {
                    // Direct navigation (like admin path)
                    window.location.href = href;
                }
            });
        }
        
        // Clone the icon and create tooltip content
        const iconClone = navIcon.cloneNode(true);
        
        // Handle both <i> and <svg> elements properly
        if (iconClone.tagName === 'svg') {
            iconClone.classList.add('tooltip-icon');
        } else {
            iconClone.className = 'tooltip-icon';
        }
        
        const textSpan = document.createElement('span');
        textSpan.className = 'tooltip-text';
        textSpan.textContent = tooltipText;
        
        // Add icon and text to tooltip link
        tooltipLink.appendChild(iconClone);
        tooltipLink.appendChild(textSpan);
        
        // Add link to tooltip
        tooltip.appendChild(tooltipLink);
        
        // Add tooltip event handlers to keep it visible when hovering
        const tooltipMouseEnterHandler = () => {
            tooltip.classList.add('show');
        };
        
        const tooltipMouseLeaveHandler = () => {
            this.hideTooltip();
        };
        
        tooltip.addEventListener('mouseenter', tooltipMouseEnterHandler);
        tooltip.addEventListener('mouseleave', tooltipMouseLeaveHandler);
        
        // Store handlers for cleanup
        tooltip._enterHandler = tooltipMouseEnterHandler;
        tooltip._leaveHandler = tooltipMouseLeaveHandler;
        
        // Add to body
        document.body.appendChild(tooltip);
        
        // Refresh feather icons for the cloned icon
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Position tooltip
        const rect = navLink.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Position tooltip so the icon aligns with the original nav circle
        const left = rect.left;
        const top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    hideTooltip() {
        const existingTooltip = document.getElementById('nav-tooltip');
        if (existingTooltip) {
            // Clean up event listeners
            if (existingTooltip._enterHandler) {
                existingTooltip.removeEventListener('mouseenter', existingTooltip._enterHandler);
            }
            if (existingTooltip._leaveHandler) {
                existingTooltip.removeEventListener('mouseleave', existingTooltip._leaveHandler);
            }
            existingTooltip.remove();
        }
    }
    
    // Clean up event listeners to prevent memory leaks
    destroy() {
        // Clear all timeouts
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // Remove any tooltips
        this.hideTooltip();
        
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        this.eventListeners = [];
        
        // Clear singleton instance
        StandaloneNavigation.instance = null;
    }
}

// Static property for singleton pattern
StandaloneNavigation.instance = null;

// Global instance
let standaloneNav;

// Initialize navigation function
function initializeStandaloneNav() {
    // Clean up existing instance if it exists
    if (standaloneNav) {
        standaloneNav.destroy();
    }
    
    // Clear singleton instance to force recreation
    StandaloneNavigation.instance = null;
    
    // Determine base path based on current location
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment && !segment.endsWith('.html'));
    let basePath = '';
    
    // Extract repo folder name from URL (e.g., 'team' from '/team/admin/page')
    const repoFolderName = pathSegments.length > 0 ? pathSegments[0] : null;
    const isWebrootContainer = repoFolderName && currentPath.startsWith(`/${repoFolderName}/`);
    
    if (isWebrootContainer) {
        // In webroot container, calculate path relative to repo folder
        const repoIndex = pathSegments.indexOf(repoFolderName);
        const segmentsAfterRepo = pathSegments.slice(repoIndex + 1);
        
        if (segmentsAfterRepo.length > 0) {
            basePath = '../'.repeat(segmentsAfterRepo.length);
            basePath = basePath.replace(/\/$/, '');
        }
    } else {
        // Direct repo serving
        if (pathSegments.length > 1) {
            basePath = '../'.repeat(pathSegments.length - 1);
            basePath = basePath.replace(/\/$/, '');
        }
    }
    
    // Determine current page
    let currentPage = 'home';
    if (currentPath.includes('/admin/')) {
        currentPage = 'admin';
    }
    
    // Initialize standalone navigation
    standaloneNav = new StandaloneNavigation({
        basePath: basePath,
        currentPage: currentPage,
        isWebrootContainer: isWebrootContainer,
        repoFolderName: repoFolderName
    });
    
    // Restore state after initialization
    setTimeout(() => {
        standaloneNav.restoreState();
    }, 100);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeStandaloneNav);

// Re-initialize on page visibility change (when coming back to a page)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible again - reinitialize navigation
        setTimeout(initializeStandaloneNav, 100);
    }
});

// Re-initialize on focus (when coming back to a page)
window.addEventListener('focus', function() {
    setTimeout(initializeStandaloneNav, 100);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (standaloneNav) {
        standaloneNav.destroy();
    }
});