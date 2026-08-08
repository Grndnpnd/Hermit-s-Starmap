/**
 * Enhanced Hermit's Star Map - Interactive Feywild Constellation Viewer
 * Version 2.0 with improved data management, state persistence, and time-based movement
 */

class EnhancedStarMap {
    constructor() {
        this.canvas = document.getElementById('star-map');
        this.ctx = this.canvas.getContext('2d');
        
        // Use enhanced constellation data
        this.constellations = window.EnhancedConstellationData?.CONSTELLATIONS || [];
        this.seasonCategories = window.EnhancedConstellationData?.SEASON_CATEGORIES || {};
        this.seasonMap = window.EnhancedConstellationData?.SEASON_MAP || {};
        this.emotionalTriggers = window.EnhancedConstellationData?.EMOTIONAL_TRIGGERS || {};
        
        this.visibleConstellations = [];
        
        // Enhanced view state with persistence
        this.viewState = {
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0,
            lastSaveTime: 0
        };
        
        // Enhanced display options
        this.displayOptions = {
            showNames: true,
            showLines: true,
            showGrid: false,
            showMagicalIntensity: false,
            showNavigationValue: false,
            animationSpeed: 1.0
        };
        
        // Enhanced filter state
        this.filters = {
            emotional: [],
            season: 'all',
            timeOfNight: 21,
            magicalIntensityMin: 0,
            magicalIntensityMax: 5,
            showSpecialEvents: true,
            comet: false,
            aurora: false,
            shower: false
        };

        // Time-lapse night + remembered sky (phase 4)
        this.timelapse = { playing: false, last: 0, speed: 1.2 }; // game-hours per real second
        this._renderHours = 21; // continuous, unwrapped clock for smooth motion across midnight
        this.skyMemory = null;
        this.displayOptions.showRemembered = false;

        // Ambient sky (shooting stars, comet)
        this._ambient = { meteors: [], nextMeteor: 0 };
        this._reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        
        // Constellation search (UI overhaul)
        this.searchTerm = '';

        // Animation and performance state
        this.animationId = null;
        this.stars = [];
        this.performanceMode = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        this.init();
    }
    
    async init() {
        try {
            // Load saved state if available
            this.loadSavedState();

            // URL parameters override saved state (shareable sky links)
            this.applyURLParams();
            
            this.setupCanvas();
            this.setupEventListeners();
            this.generateEnhancedStarField();
            this.generateEnhancedConstellationPositions();
            this.updateVisibleConstellations();
            this.updateConstellationList();
            this.updateSeasonSelector();
            this.startAnimation();
            if (this._autoplay && !this._reducedMotion) this.setTimelapse(true);
            this.hideLoadingOverlay();
            
            // Setup auto-save
            this.setupAutoSave();
            
            console.log(`Enhanced StarMap initialized with ${this.constellations.length} constellations`);
        } catch (error) {
            console.error('Failed to initialize enhanced star map:', error);
            this.showError('Failed to load enhanced constellation data');
        }
    }
    
    applyURLParams() {
        const p = new URLSearchParams(window.location.search);
        if ([...p.keys()].length === 0) return;

        const seasonValues = ['all','late-bloom','high-spring','mid-summer','late-summer','mid-autumn','late-autumn','winter','deep-winter','equinox','solstice','eclipse'];
        if (p.has('s') && seasonValues.includes(p.get('s'))) this.filters.season = p.get('s');

        if (p.has('t')) {
            const t = parseFloat(p.get('t'));
            if (!isNaN(t) && t >= 0 && t <= 23) this.filters.timeOfNight = t;
        }
        if (p.has('se')) this.filters.showSpecialEvents = p.get('se') !== '0';
        if (p.has('comet')) this.filters.comet = p.get('comet') === '1';
        if (p.has('aurora')) this.filters.aurora = p.get('aurora') === '1';
        if (p.has('shower')) this.filters.shower = p.get('shower') === '1';
        this._autoplay = p.get('play') === '1';
        if (p.has('names')) this.displayOptions.showNames = p.get('names') !== '0';
        if (p.has('lines')) this.displayOptions.showLines = p.get('lines') !== '0';
        if (p.has('grid')) this.displayOptions.showGrid = p.get('grid') === '1';
        if (p.has('e')) {
            const valid = ['mourning','revelation','bargain','betrayal'];
            this.filters.emotional = p.get('e').split(',').map(x => x.trim().toLowerCase()).filter(x => valid.includes(x));
        }
        this.updateUIFromState();
        console.log('Applied sky settings from URL');
    }

    buildShareURL() {
        const p = new URLSearchParams();
        p.set('s', this.filters.season);
        p.set('t', String(this.filters.timeOfNight));
        p.set('se', this.filters.showSpecialEvents ? '1' : '0');
        if (this.filters.comet) p.set('comet', '1');
        if (this.filters.aurora) p.set('aurora', '1');
        if (this.filters.shower) p.set('shower', '1');
        if (this.timelapse?.playing) p.set('play', '1');
        p.set('names', this.displayOptions.showNames ? '1' : '0');
        p.set('lines', this.displayOptions.showLines ? '1' : '0');
        p.set('grid', this.displayOptions.showGrid ? '1' : '0');
        if (this.filters.emotional.length) p.set('e', this.filters.emotional.join(','));
        return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
    }

    setTimelapse(on) {
        this.timelapse.playing = on;
        this.timelapse.last = 0;
        const btn = document.getElementById('time-play');
        if (btn) {
            btn.textContent = on ? '⏸' : '▶';
            btn.setAttribute('aria-pressed', String(on));
            btn.setAttribute('aria-label', on ? 'Pause the time-lapse' : 'Play the night as a time-lapse');
        }
        if (!on) this.saveState();
    }

    advanceTimelapse(t) {
        if (!this.timelapse.playing) return;
        if (!this.timelapse.last) { this.timelapse.last = t; return; }
        const dt = (t - this.timelapse.last) / 1000;
        this.timelapse.last = t;
        const prevHour = Math.floor(this.filters.timeOfNight);
        this._renderHours = (this._renderHours ?? this.filters.timeOfNight) + dt * this.timelapse.speed;
        this.filters.timeOfNight = this._renderHours % 24;
        const slider = document.getElementById('time-slider');
        if (slider) slider.value = this.filters.timeOfNight;
        this.updateTimeDisplay(this.filters.timeOfNight);
        this.updateVisibleConstellations();
        if (Math.floor(this.filters.timeOfNight) !== prevHour) this.updateConstellationList();
    }

    rememberSky() {
        const seasonText = document.getElementById('season-select')?.selectedOptions?.[0]?.textContent || this.filters.season;
        const timeText = document.getElementById('time-display')?.textContent || '';
        this.skyMemory = {
            label: `${seasonText} · ${timeText}`,
            cons: this.visibleConstellations.map(c => ({
                name: c.name,
                stars: (c.stars || []).map(s => ({ x: s.x, y: s.y }))
            }))
        };
        this.displayOptions.showRemembered = true;
        this.updateMemoryUI();
        this.saveState();
    }

    forgetSky() {
        this.skyMemory = null;
        this.displayOptions.showRemembered = false;
        this.updateMemoryUI();
        this.saveState();
    }

    updateMemoryUI() {
        const row = document.getElementById('memory-row');
        const cap = document.getElementById('memory-caption');
        const tog = document.getElementById('toggle-remembered');
        if (row) row.hidden = !this.skyMemory;
        if (cap && this.skyMemory) cap.textContent = `Remembering: ${this.skyMemory.label}`;
        if (tog) {
            const on = !!this.displayOptions.showRemembered;
            tog.setAttribute('aria-pressed', String(on));
            tog.textContent = on ? 'Hide remembered sky' : 'Show remembered sky';
        }
    }

    renderRememberedSky() {
        this.ctx.save();
        this.ctx.setLineDash([5, 6]);
        for (const c of this.skyMemory.cons) {
            if (!c.stars || !c.stars.length) continue;
            if (c.stars.length > 1) {
                this.ctx.strokeStyle = 'rgba(139,92,246,0.32)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                c.stars.forEach((s, i) => {
                    const p = this.worldToScreen(s.x, s.y);
                    if (i === 0) this.ctx.moveTo(p.x, p.y); else this.ctx.lineTo(p.x, p.y);
                });
                this.ctx.stroke();
            }
            this.ctx.strokeStyle = 'rgba(202,191,255,0.4)';
            for (const s of c.stars) {
                const p = this.worldToScreen(s.x, s.y);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 2.4 * this.viewState.zoom, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        this.ctx.restore();
    }

    loadSavedState() {
        const savedState = window.EnhancedConstellationData?.StarMapState?.load();
        if (savedState) {
            // Restore view state
            Object.assign(this.viewState, savedState.viewState || {});
            
            // Restore filters
            Object.assign(this.filters, savedState.filters || {});
            
            // Restore display options
            Object.assign(this.displayOptions, savedState.displayOptions || {});

            // Restore remembered sky
            this.skyMemory = savedState.skyMemory || null;
            
            // Update UI to match loaded state
            this.updateUIFromState();
            
            console.log('Loaded saved state from session storage');
        }
    }
    
    updateUIFromState() {
        // Update season selector
        const seasonSelect = document.getElementById('season-select');
        if (seasonSelect) {
            seasonSelect.value = this.filters.season;
        }
        
        // Update time slider
        const timeSlider = document.getElementById('time-slider');
        if (timeSlider) {
            timeSlider.value = this.filters.timeOfNight;
            this.updateTimeDisplay(this.filters.timeOfNight);
        }
        
        // Update emotional filter checkboxes
        document.querySelectorAll('input[name="emotional-filter"]').forEach(checkbox => {
            checkbox.checked = this.filters.emotional.includes(checkbox.value);
        });
        
        // Sky event checkboxes
        const specialEvents = document.getElementById('show-special-events');
        if (specialEvents) specialEvents.checked = this.filters.showSpecialEvents;
        const cometToggle = document.getElementById('comet-toggle');
        if (cometToggle) cometToggle.checked = this.filters.comet;
        const auroraToggle = document.getElementById('aurora-toggle');
        if (auroraToggle) auroraToggle.checked = this.filters.aurora;
        const showerToggle = document.getElementById('shower-toggle');
        if (showerToggle) showerToggle.checked = this.filters.shower;

        // Remembered sky controls
        this.updateMemoryUI();

        // Update display toggle buttons
        this.updateDisplayToggleStates();
    }
    
    updateDisplayToggleStates() {
        const toggles = [
            { id: 'toggle-constellation-names', option: 'showNames', text: ['Hide Names', 'Show Names'] },
            { id: 'toggle-constellation-lines', option: 'showLines', text: ['Hide Lines', 'Show Lines'] },
            { id: 'toggle-grid', option: 'showGrid', text: ['Hide Grid', 'Show Grid'] }
        ];
        
        toggles.forEach(toggle => {
            document.querySelectorAll(`[data-toggle="${toggle.option}"]`).forEach(button => {
                const isEnabled = this.displayOptions[toggle.option];
                button.textContent = isEnabled ? toggle.text[0] : toggle.text[1];
                button.setAttribute('aria-pressed', isEnabled);
            });
        });
    }
    
    setupAutoSave() {
        // Save state periodically and on important changes
        setInterval(() => {
            this.saveState();
        }, 30000); // Save every 30 seconds
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }
    
    saveState() {
        if (window.EnhancedConstellationData?.StarMapState) {
            window.EnhancedConstellationData.StarMapState.save({
                viewState: this.viewState,
                filters: this.filters,
                displayOptions: this.displayOptions,
                skyMemory: this.skyMemory
            });
            this.viewState.lastSaveTime = Date.now();
        }
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Update performance mode based on canvas size
        const totalPixels = rect.width * rect.height;
        this.performanceMode = totalPixels > 1000000; // Enable for large canvases
    }
    
    setupEventListeners() {
        // Canvas interaction
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchcancel', () => { this.viewState.isDragging = false; this._pinchDist = null; });
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Enhanced control panel events
        this.setupEnhancedControlEvents();
        
        // Enhanced UI events
        this.setupEnhancedUIEvents();
    }
    
    setupEnhancedControlEvents() {
        // Emotional filters with enhanced logic
        document.querySelectorAll('input[name="emotional-filter"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.emotional.push(e.target.value);
                } else {
                    this.filters.emotional = this.filters.emotional.filter(f => f !== e.target.value);
                }
                this.updateVisibleConstellations();
                this.updateConstellationList();
                this.saveState();
            });
        });
        
        // Enhanced season selector with special events
        const seasonSelect = document.getElementById('season-select');
        if (seasonSelect) {
            seasonSelect.addEventListener('change', (e) => {
                this.filters.season = e.target.value;
                this.updateVisibleConstellations();
                this.updateConstellationList();
                this.saveState();
            });
        }
        
        // Enhanced time slider with smooth star movement
        const timeSlider = document.getElementById('time-slider');
        if (timeSlider) {
            let isSliding = false;
            let timeUpdateFrame;
            
            timeSlider.addEventListener('mousedown', () => {
                isSliding = true;
            });
            
            timeSlider.addEventListener('mouseup', () => {
                isSliding = false;
                this.saveState();
            });
            
            timeSlider.addEventListener('input', (e) => {
                if (this.timelapse?.playing) this.setTimelapse(false);
                this.filters.timeOfNight = parseFloat(e.target.value);
                this.updateTimeDisplay(this.filters.timeOfNight);
                
                // Use requestAnimationFrame for smooth updates while sliding
                if (timeUpdateFrame) {
                    cancelAnimationFrame(timeUpdateFrame);
                }
                
                timeUpdateFrame = requestAnimationFrame(() => {
                    this.updateVisibleConstellations();
                });
            });
            
            timeSlider.addEventListener('change', () => {
                this.saveState(); // Save when user finishes adjusting
            });
        }
        
        // Navigation controls with state saving
        const navControls = [
            { id: 'zoom-in', action: () => this.zoomIn() },
            { id: 'zoom-out', action: () => this.zoomOut() },
            { id: 'center-view', action: () => this.centerView() },
            { id: 'reset-view', action: () => this.resetView() }
        ];
        
        navControls.forEach(control => {
            const button = document.getElementById(control.id);
            if (button) {
                button.addEventListener('click', () => {
                    control.action();
                    this.saveState();
                });
            }
        });
        
        // Pan controls
        const panControls = [
            { id: 'pan-n', delta: [0, -50] },
            { id: 'pan-s', delta: [0, 50] },
            { id: 'pan-e', delta: [50, 0] },
            { id: 'pan-w', delta: [-50, 0] },
            { id: 'pan-ne', delta: [35, -35] },
            { id: 'pan-nw', delta: [-35, -35] },
            { id: 'pan-se', delta: [35, 35] },
            { id: 'pan-sw', delta: [-35, 35] }
        ];
        
        panControls.forEach(control => {
            const button = document.getElementById(control.id);
            if (button) {
                button.addEventListener('click', () => {
                    this.pan(control.delta[0], control.delta[1]);
                    this.saveState();
                });
            }
        });
    }
    
    setupEnhancedUIEvents() {
        // Enhanced display toggles with state persistence
        const displayToggles = [
            { id: 'toggle-constellation-names', option: 'showNames', text: ['Hide Names', 'Show Names'] },
            { id: 'toggle-constellation-lines', option: 'showLines', text: ['Hide Lines', 'Show Lines'] },
            { id: 'toggle-grid', option: 'showGrid', text: ['Hide Grid', 'Show Grid'] }
        ];
        
        displayToggles.forEach(toggle => {
            document.querySelectorAll(`[data-toggle="${toggle.option}"]`).forEach(button => {
                button.addEventListener('click', () => {
                    this.displayOptions[toggle.option] = !this.displayOptions[toggle.option];
                    this.updateDisplayToggleStates();
                    this.saveState();
                });
            });
        });

        // Shareable sky links
        const copyLink = document.getElementById('copy-sky-link');
        if (copyLink) {
            copyLink.addEventListener('click', async () => {
                const url = this.buildShareURL();
                try {
                    await navigator.clipboard.writeText(url);
                } catch (e) {
                    const ta = document.createElement('textarea');
                    ta.value = url; document.body.appendChild(ta); ta.select();
                    document.execCommand('copy'); ta.remove();
                }
                const toast = document.getElementById('sky-link-toast');
                if (toast) {
                    toast.style.opacity = '1';
                    clearTimeout(this._toastTimer);
                    this._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
                }
            });
        }
        
        // Time-lapse
        const playBtn = document.getElementById('time-play');
        if (playBtn) playBtn.addEventListener('click', () => this.setTimelapse(!this.timelapse.playing));

        // Remembered sky
        const rememberBtn = document.getElementById('remember-sky');
        if (rememberBtn) rememberBtn.addEventListener('click', () => this.rememberSky());
        const forgetBtn = document.getElementById('forget-sky');
        if (forgetBtn) forgetBtn.addEventListener('click', () => this.forgetSky());
        const ghostToggle = document.getElementById('toggle-remembered');
        if (ghostToggle) ghostToggle.addEventListener('click', () => {
            this.displayOptions.showRemembered = !this.displayOptions.showRemembered;
            this.updateMemoryUI();
            this.saveState();
        });

        // Sky events: special events (previously unwired) + comet
        const specialEventsBox = document.getElementById('show-special-events');
        if (specialEventsBox) {
            specialEventsBox.addEventListener('change', (e) => {
                this.filters.showSpecialEvents = e.target.checked;
                this.updateVisibleConstellations();
                this.updateConstellationList();
                this.saveState();
            });
        }
        const cometBox = document.getElementById('comet-toggle');
        if (cometBox) {
            cometBox.addEventListener('change', (e) => {
                this.filters.comet = e.target.checked;
                this.saveState();
            });
        }
        const auroraBox = document.getElementById('aurora-toggle');
        if (auroraBox) {
            auroraBox.addEventListener('change', (e) => {
                this.filters.aurora = e.target.checked;
                this.saveState();
            });
        }
        const showerBox = document.getElementById('shower-toggle');
        if (showerBox) {
            showerBox.addEventListener('change', (e) => {
                this.filters.shower = e.target.checked;
                this.saveState();
            });
        }

        // Constellation search
        const searchInput = document.getElementById('constellation-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.updateConstellationList();
            });
        }

        // Mobile drawer
        const drawerToggle = document.getElementById('drawer-toggle');
        const drawerScrim = document.getElementById('drawer-scrim');
        const chartPanel = document.getElementById('control-panel');
        const setDrawer = (open) => {
            if (!chartPanel) return;
            chartPanel.classList.toggle('drawer-open', open);
            if (drawerScrim) drawerScrim.hidden = !open;
            if (drawerToggle) drawerToggle.setAttribute('aria-expanded', String(open));
        };
        if (drawerToggle) drawerToggle.addEventListener('click', () =>
            setDrawer(!chartPanel.classList.contains('drawer-open')));
        if (drawerScrim) drawerScrim.addEventListener('click', () => setDrawer(false));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

        // Detail panel
        const closeDetailButton = document.getElementById('close-detail');
        if (closeDetailButton) {
            closeDetailButton.addEventListener('click', () => this.hideConstellationDetail());
        }
        
        // Help modal
        const helpButton = document.getElementById('help-button');
        if (helpButton) {
            helpButton.addEventListener('click', () => this.showHelp());
        }
        
        const closeHelpButton = document.getElementById('close-help');
        if (closeHelpButton) {
            closeHelpButton.addEventListener('click', () => this.hideHelp());
        }
        
        // Enhanced keyboard support
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    this.hideConstellationDetail();
                    this.hideHelp();
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showHelp();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.resetView();
                        this.saveState();
                    }
                    break;
            }
        });
    }
    
    // Movement system v2: one shared sky-wheel plus a distinct voice per type.
    // Everything is continuous in (unwrapped) hours — no jumps, ever.
    getTimeBasedOffset(constellation, h) {
        const profile = window.EnhancedConstellationData?.getMovementProfile(constellation.name) || {
            orbitalSpeed: 1.0, rotationSpeed: 1.0, randomFactor: 0.25, type: "default"
        };
        if (profile.type === "anchor") return { x: 0, y: 0, rotation: 0, spread: 1, perStar: null };

        const seed = constellation.id * 7.68;
        const base = constellation.basePosition || constellation.position;

        // THE SKY WHEEL: every constellation turns about the celestial pole
        // (up where the Frozen Throne holds court), each at its own radius and
        // bearing — a rigid, stately glide rather than a spin-in-place.
        const POLE = { x: 0, y: -560 };
        const theta = (h * 1.05 * (profile.rotationSpeed || 1)) * (Math.PI / 180);
        const relX = base.x - POLE.x, relY = base.y - POLE.y;
        const cosT = Math.cos(theta), sinT = Math.sin(theta);
        let x = (POLE.x + relX * cosT - relY * sinT) - base.x;
        let y = (POLE.y + relX * sinT + relY * cosT) - base.y;
        let rotation = theta;
        let spread = 1;
        let perStar = null;

        const amp = profile.orbitalSpeed || 1;
        switch (profile.type) {
            case "seasonal":
                // Breathes: the stars ease apart and together like a slow bloom
                spread = 1 + 0.06 * Math.sin(h * (Math.PI * 2 / 6.3) + seed);
                break;
            case "wandering":
                // Meanders off the wheel-path and drifts back on two slow tides
                x += amp * (20 * Math.sin(h * 1.8 + seed) + 11 * Math.sin(h * 0.52 + seed * 2.2));
                y += amp * (16 * Math.sin(h * 1.15 + seed * 1.3) + 9 * Math.cos(h * 0.43 + seed));
                break;
            case "mystical":
                // Hangs and sways like something underwater, with a slow shimmer
                x += amp * 14 * Math.sin(h * 0.9 + seed);
                y += amp * 14 * Math.cos(h * 0.65 + seed * 1.7);
                rotation += 0.07 * Math.sin(h * 2.7 + seed);
                break;
            case "chaotic":
                // Smooth layered noise: unpredictable roaming, no discontinuities
                x += amp * (20 * Math.sin(h * 0.83 + seed) + 10 * Math.sin(h * 2.19 + seed * 2.3) + 5 * Math.sin(h * 5.01 + seed * 4.1));
                y += amp * (20 * Math.sin(h * 0.71 + seed * 1.6) + 10 * Math.sin(h * 1.93 + seed * 3.1) + 5 * Math.cos(h * 4.47 + seed * 2.7));
                rotation += 0.10 * Math.sin(h * 1.31 + seed);
                // The fragments themselves drift: each star slides on its own
                // smooth path, so a broken trail keeps re-breaking differently
                perStar = (i) => ({
                    dx: 6 * Math.sin(h * 1.9 + seed + i * 2.7) + 3 * Math.sin(h * 4.3 + i * 1.3),
                    dy: 6 * Math.cos(h * 1.4 + seed * 1.3 + i * 1.9) + 3 * Math.cos(h * 3.7 + i * 2.1)
                });
                break;
        }
        return { x, y, rotation, spread, perStar };
    }
    
    getTimeAdjustedPosition(constellation, timeOfNight) {
        const basePosition = constellation.basePosition || constellation.position;
        const offset = this.getTimeBasedOffset(constellation, timeOfNight);
        
        // Store base position if not already stored
        if (!constellation.basePosition) {
            constellation.basePosition = { ...constellation.position };
        }
        
        // Apply rotation around constellation center
        const rotatedStars = constellation.stars.map((star, index) => {
            // Get relative position from constellation center
            const relativeX = star.baseX !== undefined ? star.baseX : star.x - basePosition.x;
            const relativeY = star.baseY !== undefined ? star.baseY : star.y - basePosition.y;
            
            // Store base positions if not already stored
            if (star.baseX === undefined) {
                star.baseX = relativeX;
                star.baseY = relativeY;
            }
            
            // Apply spread (seasonal breathing), then rotation
            const spread = offset.spread ?? 1;
            const sx = relativeX * spread;
            const sy = relativeY * spread;
            const rotatedX = sx * Math.cos(offset.rotation) - sy * Math.sin(offset.rotation);
            const rotatedY = sx * Math.sin(offset.rotation) + sy * Math.cos(offset.rotation);
            const micro = offset.perStar ? offset.perStar(index) : null;
            
            // Return new absolute position
            return {
                ...star,
                x: basePosition.x + offset.x + rotatedX + (micro ? micro.dx : 0),
                y: basePosition.y + offset.y + rotatedY + (micro ? micro.dy : 0)
            };
        });
        
        return {
            position: {
                x: basePosition.x + offset.x,
                y: basePosition.y + offset.y
            },
            stars: rotatedStars
        };
    }
    
    generateEnhancedStarField() {
        this.stars = [];
        const numStars = this.performanceMode ? 2500 : 3500;
        
        for (let i = 0; i < numStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.generateRealisticRadius();
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const distanceFromCenter = Math.sqrt(x * x + y * y);
            const maxDistance = 1000;
            const brightnessMultiplier = Math.max(0.1, 1 - (distanceFromCenter / maxDistance) * 0.7);
            
            const stellarClass = this.generateStellarClass();
            
            this.stars.push({
                x: x,
                y: y,
                brightness: (Math.random() * 0.8 + 0.2) * brightnessMultiplier,
                size: (Math.random() * 2 + 0.5) * brightnessMultiplier,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.5 + Math.random() * 1.5,
                magnitude: Math.random() * 6,
                stellarClass: stellarClass,
                color: this.getStellarColor(stellarClass)
            });
            this.updateStarCount();
        }
    }
    
    generateStellarClass() {
        const classes = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
        const weights = [0.1, 0.5, 2, 3, 8, 12, 76];
        
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < classes.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return classes[i];
            }
        }
        return 'M';
    }
    
    getStellarColor(stellarClass) {
        const colors = {
            'O': '157, 180, 255',
            'B': '162, 185, 255',  
            'A': '213, 224, 255',
            'F': '249, 245, 255',
            'G': '255, 244, 234',
            'K': '255, 210, 161',
            'M': '255, 204, 111'
        };
        return colors[stellarClass] || '255, 255, 255';
    }
    
    generateRealisticRadius() {
        const random = Math.random();
        
        if (random < 0.6) {
            return Math.pow(Math.random(), 0.4) * 800;
        } else if (random < 0.9) {
            return 400 + Math.pow(Math.random(), 0.3) * 600;
        } else {
            return 1400 + Math.random() * 300;
        }
    }
    
    generateEnhancedConstellationPositions() {
        this.constellations.forEach((constellation) => {
            let position;
            
            if (constellation.coordinates && constellation.coordinates.x !== undefined) {
                const worldSize = 1600;
                position = {
                    x: (constellation.coordinates.x / 100) * worldSize - worldSize / 2,
                    y: (constellation.coordinates.y / 100) * worldSize - worldSize / 2
                };
            } else {
                position = this.generatePositionFromDirection(constellation);
            }
            
            constellation.position = position;
            constellation.stars = this.generateEnhancedConstellationStars(constellation);
        });
    }
    
    generatePositionFromDirection(constellation) {
        const directionAngles = {
            "north": Math.PI * 1.5,
            "northeast": Math.PI * 1.75,
            "east": 0,
            "southeast": Math.PI * 0.25,
            "south": Math.PI * 0.5,
            "southwest": Math.PI * 0.75,
            "west": Math.PI,
            "northwest": Math.PI * 1.25,
            "zenith": Math.PI * 1.5
        };
        
        const direction = constellation.direction?.toLowerCase() || "variable";
        const angle = directionAngles[direction] || Math.random() * Math.PI * 2;
        
        let radius = 400;
        
        if (constellation.coordinates?.elevation) {
            switch (constellation.coordinates.elevation) {
                case "high": radius = 200 + Math.random() * 100; break;
                case "mid": radius = 350 + Math.random() * 150; break;
                case "low": radius = 550 + Math.random() * 100; break;
                case "variable": radius = 200 + Math.random() * 400; break;
            }
        }
        
        if (constellation.magicalIntensity) {
            const intensityFactor = (6 - constellation.magicalIntensity) / 6;
            radius *= (0.7 + intensityFactor * 0.6);
        }
        
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }
    
    generateEnhancedConstellationStars(constellation) {
        const baseStars = this.generateConstellationStarPattern(constellation);
        
        const enhancedStars = baseStars.map(star => ({
            ...star,
            brightness: star.brightness * (0.7 + (constellation.magicalIntensity || 3) * 0.1),
            size: star.size * (0.8 + (constellation.magicalIntensity || 3) * 0.05),
            magicalGlow: (constellation.magicalIntensity || 3) > 3
        }));
        
        return enhancedStars;
    }
    
seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

generateConstellationStarPattern(constellation) {
    // Use constellation ID as base seed but add variety
    const baseSeed = constellation.id * 7.3;
    
    // Different pattern types based on constellation theme
    switch (constellation.name) {
        case "The Lantern Bearer":
        case "Hope's Light":
            return this.generateLanternBearerStars(constellation.position);
            
        case "The Centaur":
        case "Guided Arrow":
            return this.generateCentaurStars(constellation.position, baseSeed);
            
        case "The Spider":
        case "The Great Weaver":
            return this.generateSpiderWebStars(constellation.position, baseSeed);
            
        case "The Swan (Upper)":
        case "Ascending Grace":
        case "The Swan (Lower)":
        case "Resting Grace":
            return this.generateSwanStars(constellation.position, baseSeed);
            
        case "The Shattered Path":
        case "Broken Road":
            return this.generateShatteredStars(constellation.position, baseSeed);
            
        case "The Driftcloak":
        case "Wanderer's Mantle":
            return this.generateFlowingStars(constellation.position, baseSeed);
            
        default:
            return this.generateVariedStars(constellation.position, baseSeed, constellation);
    }
}

// More organic star generation with controlled randomness
generateVariedStars(position, seed, constellation) {
    const stars = [];
    
    // Vary number of stars based on magical intensity
    const baseStars = 4 + (constellation.magicalIntensity || 3);
    const numStars = baseStars + Math.floor(this.seededRandom(seed) * 6);
    
    // Central bright star
    stars.push({ 
        x: position.x, 
        y: position.y, 
        brightness: 0.9 + this.seededRandom(seed + 0.1) * 0.1, 
        size: 3 + this.seededRandom(seed + 0.2) * 1.5 
    });
    
    // Create different patterns based on season
    const patternType = constellation.season;
    
    for (let i = 1; i < numStars; i++) {
        const starSeed = seed + i * 2.7;
        let angle, distance, brightness, size;
        
        switch (patternType) {
            case 'spring':
                // More organic, flowing patterns
                angle = (i / numStars) * Math.PI * 2 + this.seededRandom(starSeed) * 1.2;
                distance = 15 + this.seededRandom(starSeed + 1) * 25 + Math.sin(i * 0.8) * 8;
                break;
                
            case 'summer':
                // Radiating, energetic patterns
                angle = (i / numStars) * Math.PI * 2 + this.seededRandom(starSeed) * 0.8;
                distance = 20 + this.seededRandom(starSeed + 1) * 30;
                break;
                
            case 'autumn':
                // Clustered, grounded patterns
                const clusterAngle = Math.floor(i / 2) * (Math.PI / 2);
                angle = clusterAngle + this.seededRandom(starSeed) * 0.6;
                distance = 12 + this.seededRandom(starSeed + 1) * 18;
                break;
                
            case 'winter':
                // Angular, crystalline patterns
                angle = (i / numStars) * Math.PI * 2 + (this.seededRandom(starSeed) - 0.5) * 0.4;
                distance = 18 + this.seededRandom(starSeed + 1) * 22;
                break;
                
            default: // year-round and special
                // Mixed patterns
                angle = (i / numStars) * Math.PI * 2 + this.seededRandom(starSeed) * 0.7;
                distance = 16 + this.seededRandom(starSeed + 1) * 28;
        }
        
        // Vary brightness and size more naturally
        brightness = 0.5 + this.seededRandom(starSeed + 2) * 0.4;
        size = 1.5 + this.seededRandom(starSeed + 3) * 2;
        
        // Add some outlier stars for organic feel
        if (this.seededRandom(starSeed + 4) > 0.85) {
            distance *= 1.8; // Some stars further out
            brightness *= 0.7; // Dimmer
        }
        
        stars.push({
            x: position.x + Math.cos(angle) * distance,
            y: position.y + Math.sin(angle) * distance,
            brightness: brightness,
            size: size
        });
    }
    
    return stars;
}

// Specific pattern generators for more character
generateCentaurStars(position, seed) {
    const stars = [];
    
    // HORSE BODY (lower half) - much more spread out
    stars.push(
        // Horse legs (spread wider apart)
        { x: position.x - 35, y: position.y + 30, brightness: 0.7, size: 2.2 }, // Back left leg
        { x: position.x - 25, y: position.y + 30, brightness: 0.7, size: 2.2 }, // Back right leg
        { x: position.x - 10, y: position.y + 30, brightness: 0.7, size: 2.2 }, // Front left leg
        { x: position.x, y: position.y + 30, brightness: 0.7, size: 2.2 }, // Front right leg
        
        // Horse body outline (much larger rectangular shape)
        { x: position.x - 35, y: position.y + 15, brightness: 0.85, size: 3.2 }, // Hindquarters
        { x: position.x - 20, y: position.y + 12, brightness: 0.9, size: 3.8 }, // Main body (brightest)
        { x: position.x - 5, y: position.y + 15, brightness: 0.85, size: 3.2 }, // Chest/shoulders
        
        // Horse neck (longer connection to human)
        { x: position.x + 5, y: position.y + 8, brightness: 0.8, size: 2.8 },
        { x: position.x + 8, y: position.y + 2, brightness: 0.8, size: 2.5 },
        
        // Tail (further back)
        { x: position.x - 45, y: position.y + 12, brightness: 0.6, size: 1.8 },
        { x: position.x - 50, y: position.y + 8, brightness: 0.5, size: 1.5 } // Tail tip
    );
    
    // HUMAN TORSO (upper half) - taller and more defined
    stars.push(
        // Human waist (connection point)
        { x: position.x + 10, y: position.y - 5, brightness: 0.9, size: 3.2 },
        
        // Human torso (taller)
        { x: position.x + 10, y: position.y - 15, brightness: 0.9, size: 3.5 }, // Chest
        { x: position.x + 5, y: position.y - 20, brightness: 0.8, size: 2.8 }, // Left shoulder
        { x: position.x + 15, y: position.y - 20, brightness: 0.8, size: 2.8 }, // Right shoulder
        
        // Head (higher up)
        { x: position.x + 10, y: position.y - 30, brightness: 0.85, size: 3 },
        
        // ARCHERY POSE - much more extended southeast arrow
        // Left arm (holding bow - extended)
        { x: position.x - 5, y: position.y - 18, brightness: 0.75, size: 2.5 }, // Left elbow
        { x: position.x - 12, y: position.y - 15, brightness: 0.7, size: 2.2 }, // Left hand/bow grip
        
        // Right arm (drawing bowstring - pulled back)
        { x: position.x + 20, y: position.y - 18, brightness: 0.75, size: 2.5 }, // Right elbow
        { x: position.x + 28, y: position.y - 15, brightness: 0.7, size: 2.2 }, // Right hand (draw)
        
        // Bow (vertical on left side, larger)
        { x: position.x - 14, y: position.y - 12, brightness: 0.65, size: 2 }, // Bow top
        { x: position.x - 14, y: position.y - 18, brightness: 0.65, size: 2 }, // Bow bottom
        
        // Arrow (pointing southeast - much longer for navigation)
        { x: position.x + 25, y: position.y - 12, brightness: 0.8, size: 2.8 }, // Arrow shaft start
        { x: position.x + 40, y: position.y - 5, brightness: 0.85, size: 3 }, // Arrow shaft mid
        { x: position.x + 55, y: position.y + 2, brightness: 0.95, size: 4 }, // Arrow tip (brightest - navigation star)
        { x: position.x + 15, y: position.y - 20, brightness: 0.7, size: 2.2 }  // Fletching
    );
    
    return stars;
}
generateSpiderWebStars(position, seed) {
    const stars = [];
    
    // Spider body
    stars.push({ x: position.x, y: position.y, brightness: 0.95, size: 4 });
    
    // 8 legs in spider formation
    for (let leg = 0; leg < 8; leg++) {
        const baseAngle = (leg / 8) * Math.PI * 2;
        
        // Each leg has 3 segments
        for (let segment = 1; segment <= 3; segment++) {
            const angle = baseAngle + (segment - 2) * 0.15; // Leg curves
            const distance = segment * 12;
            
            stars.push({
                x: position.x + Math.cos(angle) * distance,
                y: position.y + Math.sin(angle) * distance,
                brightness: 0.8 - segment * 0.1,
                size: 3 - segment * 0.4
            });
        }
    }
    
    // Web anchor points
    const webPoints = [0, Math.PI * 2/3, Math.PI * 4/3];
    webPoints.forEach(angle => {
        stars.push({
            x: position.x + Math.cos(angle) * 35,
            y: position.y + Math.sin(angle) * 35,
            brightness: 0.6,
            size: 2
        });
    });
    
    return stars;
}

generateShatteredStars(position, seed) {
    const stars = [];
    
    // Broken trail with deliberate gaps
    const segments = [
        { start: -40, end: -20, gap: true },
        { start: -10, end: 5, gap: false },
        { start: 15, gap: true },
        { start: 25, end: 45, gap: false }
    ];
    
    segments.forEach((segment, segIndex) => {
        if (!segment.gap) {
            const segmentLength = segment.end - segment.start;
            const numStars = 2 + Math.floor(this.seededRandom(seed + segIndex) * 4);
            
            for (let i = 0; i < numStars; i++) {
                const progress = i / (numStars - 1);
                const x = position.x + segment.start + progress * segmentLength;
                const y = position.y + (this.seededRandom(seed + segIndex + i) - 0.5) * 25;
                
                stars.push({
                    x: x,
                    y: y,
                    brightness: 0.4 + this.seededRandom(seed + segIndex + i + 10) * 0.5,
                    size: 1.5 + this.seededRandom(seed + segIndex + i + 20) * 2
                });
            }
        }
    });
    
    return stars;
}
    generateLanternBearerStars(position) {
    const stars = [];
    
    // Super bright yellow lantern flame
    stars.push({
        x: position.x,
        y: position.y - 15, // Above center
        brightness: 1.0,
        size: 5.5,
        color: '255, 223, 0' // Bright yellow
    });
    
    // Cloaked figure holding the lantern
    stars.push(
        { x: position.x, y: position.y, brightness: 0.85, size: 3.5 }, // Center/torso
        { x: position.x - 8, y: position.y + 8, brightness: 0.75, size: 2.5 }, // Left shoulder
        { x: position.x + 8, y: position.y + 8, brightness: 0.75, size: 2.5 }, // Right shoulder
        { x: position.x, y: position.y + 20, brightness: 0.65, size: 2 }, // Base of cloak
        { x: position.x - 12, y: position.y + 15, brightness: 0.6, size: 1.8 }, // Left cloak edge
        { x: position.x + 12, y: position.y + 15, brightness: 0.6, size: 1.8 }, // Right cloak edge
        { x: position.x - 3, y: position.y - 8, brightness: 0.7, size: 2.2 } // Lantern handle/arm
    );
    
    return stars;
}
   generateSwanStars(position, seed) {
    const stars = [];
    
    // Swan body
    stars.push(
        { x: position.x, y: position.y + 10, brightness: 0.9, size: 3.5 }, // Body
        { x: position.x, y: position.y - 5, brightness: 0.85, size: 3 }, // Neck
        { x: position.x + 3, y: position.y - 15, brightness: 0.8, size: 2.5 } // Head
    );
    
    // Wings spread
    const wingStars = [
        { x: position.x - 18, y: position.y + 5, brightness: 0.75, size: 2.8 }, // Left wing tip
        { x: position.x - 12, y: position.y + 8, brightness: 0.8, size: 2.5 }, // Left wing mid
        { x: position.x - 8, y: position.y + 6, brightness: 0.82, size: 2.3 }, // Left wing base
        { x: position.x + 15, y: position.y + 5, brightness: 0.75, size: 2.8 }, // Right wing tip
        { x: position.x + 10, y: position.y + 8, brightness: 0.8, size: 2.5 }, // Right wing mid
        { x: position.x + 6, y: position.y + 6, brightness: 0.82, size: 2.3 } // Right wing base
    ];
    
    stars.push(...wingStars);
    return stars;
}

generateFlowingStars(position, seed) {
    const stars = [];
    
    // Flowing cloak pattern - like a sine wave
    for (let i = 0; i < 12; i++) {
        const t = i / 11; // 0 to 1
        const x = position.x + (t - 0.5) * 60; // Spread across 60 units
        const y = position.y + Math.sin(t * Math.PI * 2.5) * 15 + Math.sin(t * Math.PI * 5) * 6;
        
        const brightness = 0.5 + this.seededRandom(seed + i) * 0.4;
        const size = 1.8 + this.seededRandom(seed + i + 10) * 1.5;
        
        stars.push({ x, y, brightness, size });
    }
    
    // Add a few "fabric edge" stars
    for (let i = 0; i < 6; i++) {
        const angle = this.seededRandom(seed + i + 20) * Math.PI * 2;
        const distance = 25 + this.seededRandom(seed + i + 30) * 15;
        
        stars.push({
            x: position.x + Math.cos(angle) * distance,
            y: position.y + Math.sin(angle) * distance,
            brightness: 0.4 + this.seededRandom(seed + i + 40) * 0.3,
            size: 1.5 + this.seededRandom(seed + i + 50) * 1
        });
    }
    
    return stars;
}


generateSpiderWebStars(position, seed) {
    const stars = [];
    
    // Spider body (abdomen and cephalothorax)
    stars.push(
        { x: position.x, y: position.y, brightness: 0.95, size: 4 }, // Abdomen
        { x: position.x, y: position.y - 6, brightness: 0.9, size: 3 } // Cephalothorax
    );
    
    // 8 legs in spider formation
    const legAngles = [
        -Math.PI/4, -3*Math.PI/8, -5*Math.PI/8, -3*Math.PI/4, // Left legs
        Math.PI/4, 3*Math.PI/8, 5*Math.PI/8, 3*Math.PI/4    // Right legs
    ];
    
    legAngles.forEach((baseAngle, legIndex) => {
        // Each leg has 3 segments
        for (let segment = 1; segment <= 3; segment++) {
            const segmentAngle = baseAngle + (segment - 2) * 0.2; // Leg curves
            const distance = segment * 8;
            
            stars.push({
                x: position.x + Math.cos(segmentAngle) * distance,
                y: position.y + Math.sin(segmentAngle) * distance,
                brightness: 0.7 - segment * 0.1,
                size: 2.5 - segment * 0.3
            });
        }
    });
    
    // Web anchor points
    const webAngles = [0, 2*Math.PI/3, 4*Math.PI/3];
    webAngles.forEach(angle => {
        for (let i = 1; i <= 3; i++) {
            const distance = i * 12;
            stars.push({
                x: position.x + Math.cos(angle) * distance,
                y: position.y + Math.sin(angle) * distance,
                brightness: 0.5 - i * 0.08,
                size: 1.8 - i * 0.2
            });
        }
    });
    
    return stars;
}

generateShatteredStars(position, seed) {
    const stars = [];
    
    // Broken trail with deliberate gaps
    const segments = [
        { start: -40, end: -20 },
        { start: -10, end: 5 },
        { start: 15, end: 25 },
        { start: 35, end: 50 }
    ];
    
    segments.forEach((segment, segIndex) => {
        const segmentLength = segment.end - segment.start;
        const numStars = 2 + Math.floor(this.seededRandom(seed + segIndex) * 4);
        
        for (let i = 0; i < numStars; i++) {
            const progress = i / (numStars - 1 || 1);
            const x = position.x + segment.start + progress * segmentLength;
            const y = position.y + (this.seededRandom(seed + segIndex + i) - 0.5) * 25;
            
            stars.push({
                x: x,
                y: y,
                brightness: 0.4 + this.seededRandom(seed + segIndex + i + 10) * 0.5,
                size: 1.5 + this.seededRandom(seed + segIndex + i + 20) * 2
            });
        }
    });
    
    return stars;
}
    
    // Enhanced visibility and filtering logic with movement integration
    updateVisibleConstellations() {
        if (!window.EnhancedConstellationData?.ConstellationFilter) {
            console.warn('Enhanced constellation filter not available, using fallback');
            this.visibleConstellations = this.constellations;
            return;
        }
        
        const filter = window.EnhancedConstellationData.ConstellationFilter;
        
        let filtered = [...this.constellations];
        
        filtered = filter.bySeasonEnhanced(filtered, this.filters.season);
        filtered = filter.byEmotionalTriggers(filtered, this.filters.emotional);
        
        if (this.filters.magicalIntensityMin > 0 || this.filters.magicalIntensityMax < 5) {
            filtered = filtered.filter(constellation => {
                const intensity = constellation.magicalIntensity || 3;
                return intensity >= this.filters.magicalIntensityMin && 
                       intensity <= this.filters.magicalIntensityMax;
            });
        }
        
        if (!this.filters.showSpecialEvents) {
            filtered = filtered.filter(constellation => 
                !['equinox', 'solstice', 'eclipse', 'seasonal-transition'].includes(constellation.season)
            );
        }
        
        // Hour gating becomes a fade target rather than a hard cut, so stars
        // rise and set instead of blinking. List/count/hit-testing still use
        // the strictly-visible set.
        const hourVisible = new Set(filter.byTimeOfNight(filtered, this.filters.timeOfNight).map(c => c.name));
        
        if (!this.timelapse?.playing) this._renderHours = this.filters.timeOfNight;
        const renderHours = this._renderHours ?? this.filters.timeOfNight;
        
        this.renderPool = filtered.map(constellation => {
            const timeAdjusted = this.getTimeAdjustedPosition(constellation, renderHours);
            return {
                ...constellation,
                position: timeAdjusted.position,
                stars: timeAdjusted.stars,
                __timeVisible: hourVisible.has(constellation.name)
            };
        });
        this.visibleConstellations = this.renderPool.filter(c => c.__timeVisible);
        
        this.applyEnhancedEmotionalEffects();
    }
    
    applyEnhancedEmotionalEffects() {
        this.emotionalEffects = {
            mourning: this.filters.emotional.includes('mourning'),
            revelation: this.filters.emotional.includes('revelation'),
            bargain: this.filters.emotional.includes('bargain'),
            betrayal: this.filters.emotional.includes('betrayal'),
            intensity: this.filters.emotional.length
        };
    }
    
    updateSeasonSelector() {
        const seasonSelect = document.getElementById('season-select');
        if (!seasonSelect) return;
        
        seasonSelect.innerHTML = '';
        
        const seasonOptions = [
            { value: 'all', text: 'All Seasons & Events' },
            { value: 'late-bloom', text: 'Late Bloom (Spring)' },
            { value: 'high-spring', text: 'High Spring' },
            { value: 'mid-summer', text: 'Mid Summer' },
            { value: 'late-summer', text: 'Late Summer' },
            { value: 'mid-autumn', text: 'Mid Autumn' },
            { value: 'late-autumn', text: 'Late Autumn' },
            { value: 'winter', text: 'Winter' },
            { value: 'deep-winter', text: 'Deep Winter' },
            { value: 'equinox', text: '🌟 Equinox Events' },
            { value: 'solstice', text: '🌟 Solstice Events' },
            { value: 'eclipse', text: '🌟 Eclipse Events' }
        ];
        
        seasonOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            seasonSelect.appendChild(optionElement);
        });
        
        seasonSelect.value = this.filters.season;
    }
    
    updateConstellationList() {
        const listContainer = document.getElementById('constellation-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';

        const term = (this.searchTerm || '').trim().toLowerCase();
        const matches = this.visibleConstellations.filter(c =>
            !term ||
            c.name.toLowerCase().includes(term) ||
            (c.alternateName || '').toLowerCase().includes(term));

        matches.forEach(constellation => {
            const item = this.createConstellationListItem(constellation);
            listContainer.appendChild(item);
        });

        const empty = document.getElementById('list-empty');
        if (empty) empty.hidden = !(term && matches.length === 0);

        this.updateConstellationCount();
    }
    
    createConstellationListItem(constellation) {
        const item = document.createElement('div');
        item.className = 'constellation-item p-3 rounded cursor-pointer border border-transparent hover:border-purple-500 hover:border-opacity-30 transition-all duration-200';
        
        const emotionalBadges = constellation.emotionalTriggers.map(trigger => 
            `<span class="emotion-badge ${trigger.toLowerCase()}">${trigger}</span>`
        ).join(' ');
        
        const intensityDots = '●'.repeat(constellation.magicalIntensity || 3);
        const intensityIndicator = `<span class="text-purple-400 text-xs" title="Magical Intensity: ${constellation.magicalIntensity || 3}/5">${intensityDots}</span>`;
        
        const navValue = constellation.navigationValue || 0;
        const navIndicator = navValue > 3 ? `<span class="text-yellow-400 text-xs" title="High Navigation Value">🧭</span>` : '';
        
        // Movement type indicator
        const moveType = constellation.movementType || 'default';
        const moveIndicator = moveType === 'anchor' ? `<span class="text-green-400 text-xs" title="Anchor Star - Never Moves">⚓</span>` : '';
        
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="font-semibold text-purple-200">${constellation.name}</div>
                    ${constellation.alternateName ? `<div class="text-xs text-purple-400 italic">"${constellation.alternateName}"</div>` : ''}
                    <div class="text-sm text-purple-400">${constellation.season}</div>
                    ${emotionalBadges ? `<div class="mt-1">${emotionalBadges}</div>` : ''}
                </div>
                <div class="flex flex-col items-end space-y-1">
                    ${intensityIndicator}
                    ${navIndicator}
                    ${moveIndicator}
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => this.showConstellationDetail(constellation));
        return item;
    }
    
    updateTimeDisplay(time) {
        const hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = timeStr;
            
            // Add visual indication of night/day
            if (time >= 6 && time <= 18) {
                timeDisplay.style.color = '#fbbf24'; // Day color (golden)
            } else if ((time >= 18 && time <= 21) || (time >= 5 && time <= 6)) {
                timeDisplay.style.color = '#a855f7'; // Twilight color (purple)
            } else {
                timeDisplay.style.color = '#60a5fa'; // Night color (blue)
            }
        }
        
        this.updateConstellationCount();
    }
    
    updateConstellationCount() {
        const countElement = document.getElementById('constellation-count');
        if (countElement) {
            countElement.textContent = this.visibleConstellations.length;
     }
}

updateStarCount() {
    const starCountElement = document.getElementById('star-count');
    if (starCountElement) {
        starCountElement.textContent = `Stars: ${this.stars.length}`;
    }
}
    
    startAnimation() {
        let frameCount = 0;
        let lastFpsTime = 0;
        
        const animate = (timestamp) => {
            this.advanceTimelapse(timestamp);
            this.render(timestamp);
            
            frameCount++;
            if (timestamp - lastFpsTime >= 1000) {
                this.currentFPS = Math.round(frameCount * 1000 / (timestamp - lastFpsTime));
                frameCount = 0;
                lastFpsTime = timestamp;
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    render(timestamp) {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        this.renderEnhancedBackground();
        this.renderGalaxies(timestamp);
        
        if (this.displayOptions.showGrid) {
            this.renderEnhancedGrid();
        }
        
        this.renderEnhancedStars(timestamp);
        this.renderMeteors(timestamp);
        this.renderAurora(timestamp);
        if (this.displayOptions.showRemembered && this.skyMemory) this.renderRememberedSky();
        this.renderEnhancedConstellations(timestamp);
        if (this.filters.comet) this.renderComet(timestamp);
        
        if (timestamp - this.viewState.lastSaveTime > 30000) {
            this.saveState();
        }
    }
    
    renderEnhancedBackground() {
        const rect = this.canvas.getBoundingClientRect();
        
        const gradient = this.ctx.createRadialGradient(
            rect.width / 2, rect.height / 2, 0,
            rect.width / 2, rect.height / 2, Math.max(rect.width, rect.height) * 0.8
        );
        
        gradient.addColorStop(0, 'rgba(30, 27, 75, 0.9)');
        gradient.addColorStop(0.3, 'rgba(20, 20, 50, 0.95)');
        gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.98)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, rect.width, rect.height);
    }
    
    renderEnhancedGrid() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 60 * this.viewState.zoom;
        const startX = (-this.viewState.offsetX % gridSize);
        const startY = (-this.viewState.offsetY % gridSize);
        
        this.ctx.beginPath();
        
        for (let x = startX; x < rect.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, rect.height);
        }
        
        for (let y = startY; y < rect.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(rect.width, y);
        }
        
        this.ctx.stroke();
    }
    
    renderEnhancedStars(timestamp) {
        const step = this.performanceMode ? 2 : 1;
        
        for (let i = 0; i < this.stars.length; i += step) {
            const star = this.stars[i];
            const screenPos = this.worldToScreen(star.x, star.y);
            if (!this._reducedMotion) {
                screenPos.x += Math.sin(timestamp * 0.00008 + i * 1.37) * (2 + (i % 3));
                screenPos.y += Math.cos(timestamp * 0.00006 + i * 2.11) * (1.5 + (i % 2));
            }
            
            if (this.isOnScreen(screenPos.x, screenPos.y)) {
                const twinkleBase = Math.sin(timestamp * star.twinkleSpeed * 0.001 + star.twinkle) * 0.4 + 0.6;
                const alpha = star.brightness * twinkleBase;
                
                this.ctx.fillStyle = `rgba(${star.color}, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(
                    screenPos.x, 
                    screenPos.y, 
                    star.size * this.viewState.zoom, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
                
                if (star.brightness > 0.8) {
                    this.ctx.shadowColor = `rgba(${star.color}, 0.3)`;
                    this.ctx.shadowBlur = 4 * this.viewState.zoom;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    renderMeteors(t) {
        if (this._reducedMotion) return;
        const rect = this.canvas.getBoundingClientRect();
        const amb = this._ambient;
        // A brief natural flurry every few minutes keeps lone shooting stars the norm
        if (!this.filters.shower && t > (amb.nextFlurry ?? 0)) {
            amb.nextFlurry = t + 140000 + Math.random() * 130000;
            if (Math.random() < 0.5) amb.flurryUntil = t + 2300;
        }
        if (t > amb.nextMeteor) {
            const shower = this.filters.shower;
            const inFlurry = amb.flurryUntil && t < amb.flurryUntil;
            amb.nextMeteor = t + (shower ? 340 + Math.random() * 480
                : inFlurry ? 240 + Math.random() * 220
                : (this.filters.comet ? 2600 : 5200) + Math.random() * 7000);
            if (shower) {
                // Every shower meteor streams outward from one radiant point
                const rx = rect.width * 0.68, ry = rect.height * 0.16;
                const ang = Math.PI * 0.15 + Math.random() * Math.PI * 0.9;
                const speed = 5.5 + Math.random() * 4;
                amb.meteors.push({
                    x: rx + Math.cos(ang) * 18,
                    y: ry + Math.sin(ang) * 18,
                    vx: Math.cos(ang) * speed,
                    vy: Math.sin(ang) * speed,
                    maxLife: 650 + Math.random() * 600,
                    born: t
                });
            } else {
                const dir = Math.random() < 0.5 ? 1 : -1;
                amb.meteors.push({
                    x: rect.width * (0.08 + Math.random() * 0.84),
                    y: rect.height * Math.random() * 0.4,
                    vx: dir * (4 + Math.random() * 5),
                    vy: 2.5 + Math.random() * 3,
                    maxLife: 550 + Math.random() * 550,
                    born: t
                });
            }
        }
        amb.meteors = amb.meteors.filter(m => t - m.born < m.maxLife);
        for (const m of amb.meteors) {
            const age = (t - m.born) / m.maxLife;
            const fade = age < 0.2 ? age / 0.2 : 1 - (age - 0.2) / 0.8;
            const px = m.x + m.vx * (t - m.born) / 16;
            const py = m.y + m.vy * (t - m.born) / 16;
            const tail = 3 + 9 * (1 - age);
            const grad = this.ctx.createLinearGradient(px, py, px - m.vx * tail, py - m.vy * tail);
            grad.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
            grad.addColorStop(0.35, `rgba(251,191,36,${0.5 * fade})`);
            grad.addColorStop(1, 'rgba(139,92,246,0)');
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 1.6;
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(px - m.vx * tail, py - m.vy * tail);
            this.ctx.stroke();
        }
    }

    renderComet(t) {
        const rect = this.canvas.getBoundingClientRect();
        const CYCLE = 70000, TRAVEL = 48000;
        const phase = this._reducedMotion ? TRAVEL * 0.45 : (t % CYCLE);
        if (phase > TRAVEL) return;
        const p = phase / TRAVEL;
        const x = rect.width * (-0.12 + 1.24 * p);
        const y = rect.height * (0.14 + 0.30 * p - Math.sin(p * Math.PI) * 0.06);

        // Faint sky wash around the comet
        const wash = this.ctx.createRadialGradient(x, y, 0, x, y, rect.width * 0.42);
        wash.addColorStop(0, 'rgba(110,231,183,0.10)');
        wash.addColorStop(0.45, 'rgba(251,191,36,0.045)');
        wash.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = wash;
        this.ctx.fillRect(0, 0, rect.width, rect.height);

        // Twin tails streaming back along the path (ion teal, dust gold)
        const tx = -1, ty = -0.30, norm = Math.hypot(tx, ty);
        const ux = tx / norm, uy = ty / norm;
        const L = rect.width * 0.30;
        const drawTail = (spreadX, spreadY, len, rgb, alpha, width) => {
            const ex = x + ux * len + spreadX, ey = y + uy * len + spreadY;
            const g = this.ctx.createLinearGradient(x, y, ex, ey);
            g.addColorStop(0, `rgba(${rgb},${alpha})`);
            g.addColorStop(1, `rgba(${rgb},0)`);
            this.ctx.strokeStyle = g;
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.quadraticCurveTo(x + ux * len * 0.5 + spreadX * 0.3, y + uy * len * 0.5 + spreadY * 0.3, ex, ey);
            this.ctx.stroke();
        };
        drawTail(0, -L * 0.06, L, '110,231,183', 0.5, 7);
        drawTail(0, -L * 0.12, L * 0.86, '110,231,183', 0.28, 12);
        drawTail(0, L * 0.05, L * 0.62, '251,191,36', 0.45, 5);
        drawTail(0, L * 0.10, L * 0.5, '251,191,36', 0.22, 9);

        // Shed sparks along the tail
        if (!this._reducedMotion) {
            for (let k = 0; k < 12; k++) {
                const sp = ((t * 0.00012) + k / 12) % 1;
                const sx = x + ux * L * sp + Math.sin(t * 0.001 + k * 2.4) * 9 * sp;
                const sy = y + uy * L * sp + Math.cos(t * 0.0013 + k * 1.9) * 9 * sp - L * 0.04 * sp;
                const sa = (1 - sp) * (0.35 + 0.35 * Math.abs(Math.sin(t * 0.004 + k)));
                this.ctx.fillStyle = `rgba(255,240,200,${sa})`;
                this.ctx.beginPath();
                this.ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Head: white core, gold corona, teal rim
        const head = this.ctx.createRadialGradient(x, y, 0, x, y, 16);
        head.addColorStop(0, 'rgba(255,255,255,0.95)');
        head.addColorStop(0.3, 'rgba(255,235,180,0.75)');
        head.addColorStop(0.7, 'rgba(110,231,183,0.3)');
        head.addColorStop(1, 'rgba(110,231,183,0)');
        this.ctx.fillStyle = head;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 16, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderGalaxies(t) {
        if (this._reducedMotion) return;
        const rect = this.canvas.getBoundingClientRect();
        const amb = this._ambient;
        amb.galaxies = amb.galaxies || [];
        if (amb.nextGalaxy === undefined) amb.nextGalaxy = t + 20000 + Math.random() * 30000;
        if (t > amb.nextGalaxy) {
            amb.nextGalaxy = t + 50000 + Math.random() * 80000;
            amb.galaxies.push({
                x: rect.width * (0.15 + Math.random() * 0.7),
                y: rect.height * (0.08 + Math.random() * 0.5),
                s: 36 + Math.random() * 55,
                a0: Math.random() * Math.PI * 2,
                spin: (Math.random() < 0.5 ? -1 : 1) * 0.00002,
                squash: 0.42 + Math.random() * 0.25,
                spiral: Math.random() < 0.65,
                tint: ['139,92,246', '110,231,183', '251,191,36'][Math.floor(Math.random() * 3)],
                born: t,
                life: 22000 + Math.random() * 16000
            });
        }
        amb.galaxies = amb.galaxies.filter(g => t - g.born < g.life);
        for (const g of amb.galaxies) {
            const age = (t - g.born) / g.life;
            const env = age < 0.25 ? age / 0.25 : age > 0.75 ? (1 - age) / 0.25 : 1;
            const A = 0.14 * env;
            if (A <= 0.004) continue;
            this.ctx.save();
            this.ctx.translate(g.x, g.y);
            this.ctx.rotate(g.a0 + (t - g.born) * g.spin);
            this.ctx.scale(1, g.squash);
            const core = this.ctx.createRadialGradient(0, 0, 0, 0, 0, g.s);
            core.addColorStop(0, `rgba(255,248,230,${A * 1.5})`);
            core.addColorStop(0.25, `rgba(${g.tint},${A})`);
            core.addColorStop(1, `rgba(${g.tint},0)`);
            this.ctx.fillStyle = core;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, g.s, 0, Math.PI * 2);
            this.ctx.fill();
            if (g.spiral) {
                this.ctx.strokeStyle = `rgba(${g.tint},${A * 0.9})`;
                this.ctx.lineWidth = 5;
                for (let arm = 0; arm < 2; arm++) {
                    this.ctx.beginPath();
                    let started = false;
                    for (let i = 0; i <= 26; i++) {
                        const th = (i / 26) * Math.PI * 1.7 + arm * Math.PI;
                        const r = g.s * 0.16 * Math.exp(0.28 * th);
                        if (r > g.s * 1.05) break;
                        const px = Math.cos(th) * r, py = Math.sin(th) * r;
                        if (!started) { this.ctx.moveTo(px, py); started = true; }
                        else this.ctx.lineTo(px, py);
                    }
                    this.ctx.stroke();
                }
            }
            this.ctx.restore();
        }
    }

    renderAurora(t) {
        const forced = this.filters.aurora;
        const amb = this._ambient;
        if (!forced) {
            if (this._reducedMotion) return;
            if (amb.auroraNext === undefined) amb.auroraNext = t + 60000 + Math.random() * 90000;
            if (!amb.auroraUntil && t > amb.auroraNext) {
                amb.auroraNext = t + 170000 + Math.random() * 170000;
                if (Math.random() < 0.45) {
                    amb.auroraStart = t;
                    amb.auroraUntil = t + 42000 + Math.random() * 22000;
                }
            }
            if (!amb.auroraUntil) return;
            if (t > amb.auroraUntil) { amb.auroraUntil = null; return; }
        }
        const rect = this.canvas.getBoundingClientRect();
        let env = 1;
        if (!forced) {
            const inT = (t - amb.auroraStart) / 8000;
            const outT = (amb.auroraUntil - t) / 8000;
            env = Math.max(0, Math.min(1, inT, outT));
        }
        const T = this._reducedMotion ? 0 : t;
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        for (let b = 0; b < 3; b++) {
            const baseY = rect.height * (0.08 + 0.075 * b);
            const h = 95 + 45 * b;
            const shimmer = this._reducedMotion ? 0.7 : 0.55 + 0.45 * Math.sin(T * 0.0009 + b * 2.1);
            const A = 0.16 * env * shimmer * (forced ? 1.15 : 1);
            if (A <= 0.004) continue;
            const grad = this.ctx.createLinearGradient(0, baseY - 20, 0, baseY + h);
            grad.addColorStop(0, 'rgba(139,92,246,0)');
            grad.addColorStop(0.55, `rgba(45,255,168,${A * 0.55})`);
            grad.addColorStop(1, `rgba(110,231,183,${A})`);
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            const step = 34;
            for (let x = -step; x <= rect.width + step; x += step) {
                const y = baseY + Math.sin(x * 0.004 + T * 0.00028 + b * 2) * rect.height * 0.045;
                if (x === -step) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
            }
            for (let x = rect.width + step; x >= -step; x -= step) {
                const y = baseY + h + Math.sin(x * 0.006 + T * 0.0004 + b) * rect.height * 0.03;
                this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();
    }
    
    renderEnhancedConstellations(timestamp) {
        const dt = Math.min(100, timestamp - (this._fadeT ?? timestamp));
        this._fadeT = timestamp;
        this._fade = this._fade || {};
        this._labels = [];

        const pool = this.renderPool || this.visibleConstellations;
        const sorted = [...pool].sort(
            (a, b) => (a.magicalIntensity || 3) - (b.magicalIntensity || 3)
        );

        const seen = new Set();
        for (const constellation of sorted) {
            seen.add(constellation.name);
            const target = constellation.__timeVisible === false ? 0 : 1;
            const cur = this._fade[constellation.name] ?? target;
            let alpha = cur;
            if (cur !== target) {
                const rate = dt / (target > cur ? 600 : 900);
                alpha = Math.max(0, Math.min(1, cur + Math.sign(target - cur) * rate));
            }
            this._fade[constellation.name] = alpha;
            if (alpha <= 0.01) continue;
            this._curFade = alpha;
            this.ctx.save();
            this.ctx.globalAlpha *= alpha;
            this.renderEnhancedConstellation(constellation, timestamp);
            this.ctx.restore();
        }
        for (const k of Object.keys(this._fade)) if (!seen.has(k)) delete this._fade[k];
        this._curFade = 1;

        this.renderLabels();
    }

    renderLabels() {
        const labels = this._labels;
        if (!labels || !labels.length) return;
        labels.sort((a, b) => b.priority - a.priority);
        const placed = [];
        const collides = (r) => placed.some(p =>
            r.x < p.x + p.w + 4 && r.x + r.w + 4 > p.x &&
            r.y < p.y + p.h + 3 && r.y + r.h + 3 > p.y);
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineJoin = 'round';
        for (const L of labels) {
            this.ctx.font = `${L.fontSize}px "Cinzel", Georgia, serif`;
            const w = this.ctx.measureText(L.name).width;
            const h = L.fontSize + (L.alt ? L.fontSize * 0.6 + 8 : 0) + 6;
            let ok = false;
            for (const dy of [0, L.fontSize + 12, -(L.fontSize + 28), (L.fontSize + 12) * 2]) {
                const r = { x: L.x - w / 2 - 5, y: L.y + dy - L.fontSize * 0.7, w: w + 10, h };
                if (!collides(r)) { placed.push(r); L.y += dy; ok = true; break; }
            }
            if (!ok) continue; // too crowded here — the higher-priority names keep the space

            if (L.highlighted) {
                this.ctx.shadowColor = `rgba(${L.emotionalColor}, ${0.8 * L.alpha})`;
                this.ctx.shadowBlur = 6;
            }
            this.ctx.strokeStyle = `rgba(8, 8, 22, ${0.85 * L.alpha})`;
            this.ctx.lineWidth = 3.5;
            this.ctx.strokeText(L.name, L.x, L.y);
            this.ctx.fillStyle = L.highlighted
                ? `rgba(${L.emotionalColor}, ${L.alpha})`
                : `rgba(255, 255, 255, ${0.9 * L.alpha})`;
            this.ctx.fillText(L.name, L.x, L.y);
            if (L.alt) {
                this.ctx.font = `${L.fontSize * 0.6}px "Cinzel", Georgia, serif`;
                this.ctx.strokeText(L.alt, L.x, L.y + L.fontSize + 8);
                this.ctx.fillStyle = `rgba(${L.highlighted ? L.emotionalColor : '255, 255, 255'}, ${0.7 * L.alpha})`;
                this.ctx.fillText(L.alt, L.x, L.y + L.fontSize + 8);
            }
            this.ctx.shadowBlur = 0;
        }
        this._labels = [];
    }
    
    renderEnhancedConstellation(constellation, timestamp) {
        if (!constellation.stars) return;
        
        const isHighlighted = this.isConstellationHighlighted(constellation);
        const emotionalColor = this.getEmotionalColor(constellation);
        const hasEmotionalEffect = this.hasActiveEmotionalEffect(constellation);
        
        const magicalPulse = (constellation.magicalIntensity || 3) > 3 ? 
            Math.sin(timestamp * 0.002) * 0.2 + 0.8 : 1;
        
        constellation.stars.forEach((star, index) => {
            const screenPos = this.worldToScreen(star.x, star.y);
            
            if (this.isOnScreen(screenPos.x, screenPos.y)) {
                let twinkle = Math.sin(timestamp * 0.002 + star.x * 0.01) * 0.3 + 0.7;
                if (hasEmotionalEffect) {
                    twinkle += Math.sin(timestamp * 0.005 + index) * 0.15;
                }
                twinkle *= magicalPulse;
                
                const alpha = star.brightness * twinkle;
                let baseColor;
                if (star.color) {
                    baseColor = star.color;
                } else if (isHighlighted) {
                    baseColor = emotionalColor;
                } else {
                    baseColor = '255, 255, 255';
                }    
                
                const enhancedSize = star.size * this.viewState.zoom * 
                    (1 + ((constellation.magicalIntensity || 3) * 0.05));
                
                this.ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, enhancedSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                if (isHighlighted || hasEmotionalEffect || (constellation.magicalIntensity || 3) > 3) {
                    this.ctx.shadowColor = `rgba(${emotionalColor}, 0.6)`;
                    this.ctx.shadowBlur = 8 * this.viewState.zoom;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                    
                    if (hasEmotionalEffect) {
                        const pulseSize = Math.sin(timestamp * 0.003 + index) * 3 + 5;
                        this.ctx.strokeStyle = `rgba(${emotionalColor}, 0.3)`;
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();
                        this.ctx.arc(screenPos.x, screenPos.y, enhancedSize + pulseSize, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }
            }
        });
        
        if (this.displayOptions.showLines && constellation.stars.length > 1) {
            this.renderEnhancedConstellationLines(constellation, isHighlighted, emotionalColor, timestamp);
        }
        
        if (this.displayOptions.showNames) {
            this.renderEnhancedConstellationName(constellation, isHighlighted, emotionalColor);
        }
    }
    
    renderEnhancedConstellationLines(constellation, isHighlighted, emotionalColor, timestamp) {
        const baseAlpha = isHighlighted ? 0.9 : 0.4;
        const magicalPulse = (constellation.magicalIntensity || 3) > 3 ? 
            Math.sin(timestamp * 0.001) * 0.2 + 0.8 : 1;
        
        const alpha = baseAlpha * magicalPulse;
        const color = isHighlighted ? `rgba(${emotionalColor}, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = (isHighlighted ? 3 : 1.5) * this.viewState.zoom;
        
        this.ctx.beginPath();
        constellation.stars.forEach((star, index) => {
            const screenPos = this.worldToScreen(star.x, star.y);
            if (this.isOnScreen(screenPos.x, screenPos.y)) {
                if (index === 0) {
                    this.ctx.moveTo(screenPos.x, screenPos.y);
                } else {
                    this.ctx.lineTo(screenPos.x, screenPos.y);
                }
            }
        });
        
        this.ctx.stroke();
        
        if (isHighlighted) {
            this.ctx.shadowColor = `rgba(${emotionalColor}, 0.6)`;
            this.ctx.shadowBlur = 12 * this.viewState.zoom;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }
    
    renderEnhancedConstellationName(constellation, isHighlighted, emotionalColor) {
        // Labels are collected here and drawn in a single collision-aware pass
        // (renderLabels) after all constellations, so names never sit on top of
        // stars or each other.
        const centerPos = this.worldToScreen(constellation.position.x, constellation.position.y + 70);
        if (!this.isOnScreen(centerPos.x, centerPos.y)) return;
        const alpha = this._curFade ?? 1;
        if (alpha < 0.25) return; // don't label stars that are mostly risen/set
        this._labels.push({
            name: constellation.name,
            alt: (constellation.alternateName && this.viewState.zoom > 1.2)
                ? `"${constellation.alternateName}"` : null,
            x: centerPos.x,
            y: centerPos.y,
            fontSize: Math.max(10, 14 * this.viewState.zoom),
            highlighted: isHighlighted,
            emotionalColor,
            alpha,
            priority: (constellation.navigationValue || 0) * 2 + (constellation.magicalIntensity || 3)
        });
    }
    
    isConstellationHighlighted(constellation) {
        return this.filters.emotional.some(emotion => 
            constellation.emotionalTriggers.map(t => t.toLowerCase()).includes(emotion)
        );
    }
    
    hasActiveEmotionalEffect(constellation) {
        if (!this.emotionalEffects) return false;
        
        return constellation.emotionalTriggers.some(trigger => 
            this.emotionalEffects[trigger.toLowerCase()]
        );
    }
    
    getEmotionalColor(constellation) {
        const emotionalColors = {
            'mourning': '59, 130, 246',
            'revelation': '251, 191, 36', 
            'bargain': '34, 197, 94',
            'betrayal': '239, 68, 68'
        };
        
        const trigger = constellation.emotionalTriggers[0];
        if (trigger) {
            return emotionalColors[trigger.toLowerCase()] || '168, 85, 247';
        }
        
        return '168, 85, 247';
    }
    
    showConstellationDetail(constellation) {
        const panel = document.getElementById('constellation-detail');
        if (!panel) return;
        
        const setElementText = (id, text) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        };
        
        setElementText('detail-name', constellation.name);
        setElementText('detail-alternate-name', constellation.alternateName || '');
        setElementText('detail-shape', constellation.shape);
        setElementText('detail-season', constellation.season);
        setElementText('detail-symbolism', constellation.symbolism);
        setElementText('detail-effects', constellation.specialEffects);
        setElementText('detail-nav-info', constellation.currentAlignment || 'Variable positioning');
        setElementText('detail-resonance', constellation.mythicResonance);
        
        const directionElement = document.getElementById('detail-direction');
        if (directionElement) {
            directionElement.textContent = constellation.direction || 'Variable';
        }
        
        const magicalIntensityElement = document.getElementById('detail-magical-intensity');
        if (magicalIntensityElement) {
            const intensity = constellation.magicalIntensity || 3;
            magicalIntensityElement.innerHTML = '●'.repeat(intensity) + '○'.repeat(5 - intensity) + ` (${intensity}/5)`;
        }
        
        const navigationValueElement = document.getElementById('detail-navigation-value');
        if (navigationValueElement) {
            const navValue = constellation.navigationValue || 0;
            const navText = navValue > 3 ? `High (${navValue}/5) 🧭` : 
                           navValue > 1 ? `Moderate (${navValue}/5)` : 
                           `Low (${navValue}/5)`;
            navigationValueElement.textContent = navText;
        }
        
        const triggersContainer = document.getElementById('detail-triggers');
        if (triggersContainer) {
            triggersContainer.innerHTML = '';
            constellation.emotionalTriggers.forEach(trigger => {
                const badge = document.createElement('span');
                badge.className = `emotion-badge ${trigger.toLowerCase()}`;
                badge.textContent = trigger;
                triggersContainer.appendChild(badge);
            });
        }
        
        panel.classList.remove('translate-x-full');
    }
    
    hideConstellationDetail() {
        const panel = document.getElementById('constellation-detail');
        if (panel) {
            panel.classList.add('translate-x-full');
        }
    }
    
    showHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    hideHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showError(message) {
        console.error(message);
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="text-center">
                    <div class="text-red-400 text-6xl mb-4">⚠</div>
                    <p class="text-red-200 text-lg">${message}</p>
                    <button onclick="location.reload()" class="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">
                        Reload Application
                    </button>
                </div>
            `;
        }
    }
    
    worldToScreen(worldX, worldY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (worldX * this.viewState.zoom) + this.viewState.offsetX + rect.width / 2,
            y: (worldY * this.viewState.zoom) + this.viewState.offsetY + rect.height / 2
        };
    }
    
    screenToWorld(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (screenX - this.viewState.offsetX - rect.width / 2) / this.viewState.zoom,
            y: (screenY - this.viewState.offsetY - rect.height / 2) / this.viewState.zoom
        };
    }
    
    isOnScreen(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        return x >= -100 && x <= rect.width + 100 && y >= -100 && y <= rect.height + 100;
    }
    
    handleMouseDown(e) {
        this.viewState.isDragging = true;
        this.viewState.lastMouseX = e.clientX;
        this.viewState.lastMouseY = e.clientY;
        this.canvas.classList.add('panning');
    }
    
    handleMouseMove(e) {
        if (this.viewState.isDragging) {
            const deltaX = e.clientX - this.viewState.lastMouseX;
            const deltaY = e.clientY - this.viewState.lastMouseY;
            
            this.viewState.offsetX += deltaX;
            this.viewState.offsetY += deltaY;
            
            this.viewState.lastMouseX = e.clientX;
            this.viewState.lastMouseY = e.clientY;
        }
    }
    
    handleMouseUp() {
        this.viewState.isDragging = false;
        this.canvas.classList.remove('panning');
        this.saveState();
    }
    
    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.viewState.zoom = Math.max(0.1, Math.min(4, this.viewState.zoom * zoomFactor));
        this.saveState();
    }

    _touchDistance(e) {
        const [a, b] = [e.touches[0], e.touches[1]];
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            this.viewState.isDragging = true;
            this.viewState.lastMouseX = t.clientX;
            this.viewState.lastMouseY = t.clientY;
            this._touchMoved = false;
            this._pinchDist = null;
        } else if (e.touches.length === 2) {
            e.preventDefault();
            this.viewState.isDragging = false;
            this._pinchDist = this._touchDistance(e);
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 1 && this.viewState.isDragging) {
            e.preventDefault();
            const t = e.touches[0];
            const deltaX = t.clientX - this.viewState.lastMouseX;
            const deltaY = t.clientY - this.viewState.lastMouseY;
            if (Math.abs(deltaX) + Math.abs(deltaY) > 5) this._touchMoved = true;
            this.viewState.offsetX += deltaX;
            this.viewState.offsetY += deltaY;
            this.viewState.lastMouseX = t.clientX;
            this.viewState.lastMouseY = t.clientY;
        } else if (e.touches.length === 2 && this._pinchDist) {
            e.preventDefault();
            const d = this._touchDistance(e);
            const factor = d / this._pinchDist;
            this.viewState.zoom = Math.max(0.1, Math.min(4, this.viewState.zoom * factor));
            this._pinchDist = d;
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length === 1) {
            // dropped from pinch to single finger: re-anchor the pan
            const t = e.touches[0];
            this.viewState.isDragging = true;
            this.viewState.lastMouseX = t.clientX;
            this.viewState.lastMouseY = t.clientY;
            this._pinchDist = null;
            return;
        }
        const wasDrag = this.viewState.isDragging;
        this.viewState.isDragging = false;
        this._pinchDist = null;
        this.saveState();
        // A still tap opens the constellation under the finger
        if (wasDrag && !this._touchMoved && e.changedTouches.length === 1) {
            const t = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const hit = this.getConstellationAtPoint(t.clientX - rect.left, t.clientY - rect.top);
            if (hit) this.showConstellationDetail(hit);
        }
    }
    
    handleCanvasClick(e) {
        if (!this.viewState.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            const clickedConstellation = this.getConstellationAtPoint(clickX, clickY);
            if (clickedConstellation) {
                this.showConstellationDetail(clickedConstellation);
            }
        }
    }
    
    getConstellationAtPoint(screenX, screenY) {
        const worldPos = this.screenToWorld(screenX, screenY);
        
        return this.visibleConstellations.find(constellation => {
            if (!constellation.stars) return false;
            
            return constellation.stars.some(star => {
                const distance = Math.sqrt(
                    Math.pow(star.x - worldPos.x, 2) + 
                    Math.pow(star.y - worldPos.y, 2)
                );
                return distance < 25;
            });
        });
    }
    
    zoomIn() {
        this.viewState.zoom = Math.min(4, this.viewState.zoom * 1.2);
    }
    
    zoomOut() {
        this.viewState.zoom = Math.max(0.1, this.viewState.zoom * 0.8);
    }
    
    pan(deltaX, deltaY) {
        this.viewState.offsetX += deltaX;
        this.viewState.offsetY += deltaY;
    }
    
    centerView() {
        this.viewState.offsetX = 0;
        this.viewState.offsetY = 0;
    }
    
    resetView() {
        this.viewState.offsetX = 0;
        this.viewState.offsetY = 0;
        this.viewState.zoom = 1;
    }
    
    // Utility method to reset constellation positions for debugging
    resetConstellationPositions() {
        this.constellations.forEach(constellation => {
            if (constellation.basePosition) {
                constellation.position = { ...constellation.basePosition };
            }
            
            if (constellation.stars) {
                constellation.stars.forEach(star => {
                    if (star.baseX !== undefined && star.baseY !== undefined) {
                        star.x = constellation.position.x + star.baseX;
                        star.y = constellation.position.y + star.baseY;
                    }
                });
            }
        });
        
        this.updateVisibleConstellations();
    }
}

// Export for use in web application
if (typeof window !== 'undefined') {
    window.EnhancedStarMap = EnhancedStarMap;
}
