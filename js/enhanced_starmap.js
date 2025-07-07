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
            showSpecialEvents: true
        };
        
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
            
            this.setupCanvas();
            this.setupEventListeners();
            this.generateEnhancedStarField();
            this.generateEnhancedConstellationPositions();
            this.updateVisibleConstellations();
            this.updateConstellationList();
            this.updateSeasonSelector();
            this.startAnimation();
            this.hideLoadingOverlay();
            
            // Setup auto-save
            this.setupAutoSave();
            
            console.log(`Enhanced StarMap initialized with ${this.constellations.length} constellations`);
        } catch (error) {
            console.error('Failed to initialize enhanced star map:', error);
            this.showError('Failed to load enhanced constellation data');
        }
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
            const button = document.getElementById(toggle.id);
            if (button) {
                const isEnabled = this.displayOptions[toggle.option];
                button.textContent = isEnabled ? toggle.text[0] : toggle.text[1];
                button.setAttribute('aria-pressed', isEnabled);
            }
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
                displayOptions: this.displayOptions
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
            const button = document.getElementById(toggle.id);
            if (button) {
                button.addEventListener('click', (e) => {
                    this.displayOptions[toggle.option] = !this.displayOptions[toggle.option];
                    const isEnabled = this.displayOptions[toggle.option];
                    e.target.textContent = isEnabled ? toggle.text[0] : toggle.text[1];
                    e.target.setAttribute('aria-pressed', isEnabled);
                    this.saveState();
                });
            }
        });
        
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
    
    // NEW: Time-based movement system
    getTimeBasedOffset(constellation, timeOfNight) {
        // Get movement profile for this constellation
        const profile = window.EnhancedConstellationData?.getMovementProfile(constellation.name) || {
            orbitalSpeed: 1.0,
            rotationSpeed: 1.0,
            randomFactor: 0.25,
            type: "default"
        };
        
        // Anchor stars never move
        if (profile.type === "anchor") {
            return { x: 0, y: 0, rotation: 0 };
        }
        
        // Calculate degrees per hour (sky rotates ~15 degrees per hour in reality)
        const degreesPerHour = 15;
        const baseRotation = (timeOfNight * degreesPerHour * profile.rotationSpeed) * (Math.PI / 180);
        
        // Add constellation-specific movement patterns based on season
        let seasonMultiplier = 1;
        switch (constellation.season) {
            case 'year-round':
                seasonMultiplier = 0.7; // Eternal stars move slower
                break;
            case 'spring':
                seasonMultiplier = 1.2;
                break;
            case 'summer':
                seasonMultiplier = 1.1;
                break;
            case 'autumn':
                seasonMultiplier = 1.0;
                break;
            case 'winter':
                seasonMultiplier = 0.9;
                break;
            case 'equinox':
            case 'solstice':
            case 'eclipse':
            case 'seasonal-transition':
                seasonMultiplier = 1.4; // Special events move more dramatically
                break;
        }
        
        // Calculate random component
        const constellationSeed = constellation.id * 7.68;
        const timeBasedSeed = timeOfNight * 0.1;
        const randomOffset = Math.sin(constellationSeed + timeBasedSeed) * profile.randomFactor;
        
        // Final rotation calculation
        const finalRotation = baseRotation * seasonMultiplier + randomOffset;
        
        // Calculate orbital movement
        const magicalBonus = (constellation.magicalIntensity || 3) * 2;
        const orbitalRadius = (10 + magicalBonus) * profile.orbitalSpeed;
        const orbitalAngle = (timeOfNight * 0.1 * profile.orbitalSpeed * seasonMultiplier) + constellationSeed;
        
        // Add some constellations with special movement patterns
        let specialX = 0, specialY = 0;
        
        switch (constellation.name) {
            case "The Driftcloak":
            case "Wanderer's Mantle":
                // Flowing, wave-like movement
                specialX = Math.sin(timeOfNight * 0.15) * 25;
                specialY = Math.cos(timeOfNight * 0.08) * 15;
                break;
                
            case "The Shattered Path":
            case "Broken Road":
                // Erratic, broken movement
                specialX = Math.sin(timeOfNight * 0.25 + constellationSeed) * 30;
                specialY = Math.cos(timeOfNight * 0.18 + constellationSeed * 2) * 20;
                if (Math.floor(timeOfNight * 2) % 3 === 0) {
                    specialX *= -1; // Sudden direction changes
                }
                break;
                
            case "The Spider":
            case "The Great Weaver":
                // Web-like radial movement
                const webAngle = timeOfNight * 0.05;
                specialX = Math.cos(webAngle) * 15;
                specialY = Math.sin(webAngle) * 15;
                break;
                
            case "The Sibling Moons":
            case "Twin Destinies":
                // Figure-8 movement
                const figure8Angle = timeOfNight * 0.1;
                specialX = Math.sin(figure8Angle) * 20;
                specialY = Math.sin(figure8Angle * 2) * 10;
                break;
        }
        
        return {
            x: Math.cos(orbitalAngle) * orbitalRadius + specialX,
            y: Math.sin(orbitalAngle) * orbitalRadius + specialY,
            rotation: finalRotation
        };
    }
    
    // NEW: Apply time-based transformations to constellation positions
    getTimeAdjustedPosition(constellation, timeOfNight) {
        const basePosition = constellation.basePosition || constellation.position;
        const offset = this.getTimeBasedOffset(constellation, timeOfNight);
        
        // Store base position if not already stored
        if (!constellation.basePosition) {
            constellation.basePosition = { ...constellation.position };
        }
        
        // Apply rotation around constellation center
        const rotatedStars = constellation.stars.map(star => {
            // Get relative position from constellation center
            const relativeX = star.baseX !== undefined ? star.baseX : star.x - basePosition.x;
            const relativeY = star.baseY !== undefined ? star.baseY : star.y - basePosition.y;
            
            // Store base positions if not already stored
            if (star.baseX === undefined) {
                star.baseX = relativeX;
                star.baseY = relativeY;
            }
            
            // Apply rotation
            const rotatedX = relativeX * Math.cos(offset.rotation) - relativeY * Math.sin(offset.rotation);
            const rotatedY = relativeX * Math.sin(offset.rotation) + relativeY * Math.cos(offset.rotation);
            
            // Return new absolute position
            return {
                ...star,
                x: basePosition.x + offset.x + rotatedX,
                y: basePosition.y + offset.y + rotatedY
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
    
    // Horse body (4 legs, body, neck)
    stars.push(
        { x: position.x - 25, y: position.y + 20, brightness: 0.8, size: 2.5 }, // Back legs
        { x: position.x - 15, y: position.y + 25, brightness: 0.7, size: 2 }, // Front legs
        { x: position.x - 20, y: position.y + 10, brightness: 0.9, size: 3.5 }, // Body
        { x: position.x - 8, y: position.y, brightness: 0.85, size: 3 } // Neck junction
    );
    
    // Human torso and bow
    stars.push(
        { x: position.x + 5, y: position.y - 10, brightness: 0.9, size: 3 }, // Torso
        { x: position.x + 8, y: position.y - 18, brightness: 0.8, size: 2.5 }, // Head
        { x: position.x + 25, y: position.y - 15, brightness: 0.95, size: 3.5 }, // Arrow point (brightest)
        { x: position.x + 18, y: position.y - 12, brightness: 0.7, size: 2 } // Bow
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

generateCentaurStars(position, seed) {
    const stars = [];
    
    // Horse body (4 legs, body, neck)
    stars.push(
        { x: position.x - 25, y: position.y + 20, brightness: 0.8, size: 2.5 }, // Back legs
        { x: position.x - 15, y: position.y + 25, brightness: 0.7, size: 2 }, // Front legs
        { x: position.x - 20, y: position.y + 10, brightness: 0.9, size: 3.5 }, // Body
        { x: position.x - 8, y: position.y, brightness: 0.85, size: 3 } // Neck junction
    );
    
    // Human torso and bow
    stars.push(
        { x: position.x + 5, y: position.y - 10, brightness: 0.9, size: 3 }, // Torso
        { x: position.x + 8, y: position.y - 18, brightness: 0.8, size: 2.5 }, // Head
        { x: position.x + 25, y: position.y - 15, brightness: 0.95, size: 3.5 }, // Arrow point (brightest)
        { x: position.x + 18, y: position.y - 12, brightness: 0.7, size: 2 } // Bow
    );
    
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
        filtered = filter.byTimeOfNight(filtered, this.filters.timeOfNight);
        
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
        
        // Apply time-based position adjustments to all constellations
        this.visibleConstellations = filtered.map(constellation => {
            const timeAdjusted = this.getTimeAdjustedPosition(constellation, this.filters.timeOfNight);
            return {
                ...constellation,
                position: timeAdjusted.position,
                stars: timeAdjusted.stars
            };
        });
        
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
        
        this.visibleConstellations.forEach(constellation => {
            const item = this.createConstellationListItem(constellation);
            listContainer.appendChild(item);
        });
        
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
        
        if (this.displayOptions.showGrid) {
            this.renderEnhancedGrid();
        }
        
        this.renderEnhancedStars(timestamp);
        this.renderEnhancedConstellations(timestamp);
        
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
    
    renderEnhancedConstellations(timestamp) {
        const sortedConstellations = [...this.visibleConstellations].sort(
            (a, b) => (a.magicalIntensity || 3) - (b.magicalIntensity || 3)
        );
        
        sortedConstellations.forEach(constellation => {
            this.renderEnhancedConstellation(constellation, timestamp);
        });
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
                const baseColor = isHighlighted ? emotionalColor : '255, 255, 255';
                
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
        const centerPos = this.worldToScreen(constellation.position.x, constellation.position.y + 70);
        
        if (this.isOnScreen(centerPos.x, centerPos.y)) {
            const fontSize = Math.max(10, 14 * this.viewState.zoom);
            const color = isHighlighted ? `rgba(${emotionalColor}, 1)` : 'rgba(255, 255, 255, 0.9)';
            
            this.ctx.fillStyle = color;
            this.ctx.font = `${fontSize}px "Cinzel", Georgia, serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            if (isHighlighted) {
                this.ctx.shadowColor = `rgba(${emotionalColor}, 0.8)`;
                this.ctx.shadowBlur = 6;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }
            
            this.ctx.fillText(constellation.name, centerPos.x, centerPos.y);
            
            if (constellation.alternateName && this.viewState.zoom > 1.2) {
                this.ctx.font = `${fontSize * 0.6}px "Cinzel", Georgia, serif`;
                this.ctx.fillStyle = `rgba(${isHighlighted ? emotionalColor : '255, 255, 255'}, 0.7)`;
                this.ctx.fillText(`"${constellation.alternateName}"`, centerPos.x, centerPos.y + fontSize + 8);
            }
            
            this.ctx.shadowBlur = 0;
        }
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
