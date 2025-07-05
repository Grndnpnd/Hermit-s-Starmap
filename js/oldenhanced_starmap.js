    
    // Enhanced time display with better formatting
    updateTimeDisplay(time) {
        const hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = timeStr;
        }
        
        // Update constellation count
        this.updateConstellationCount();
    }
    
    updateConstellationCount() {
        const countElement = document.getElementById('constellation-count');
        if (countElement) {
            countElement.textContent = this.visibleConstellations.length;
        }
    }
    
    // Enhanced animation loop with performance monitoring
    startAnimation() {
        let frameCount = 0;
        let lastFpsTime = 0;
        
        const animate = (timestamp) => {
            this.render(timestamp);
            
            // Performance monitoring
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
    
    // Enhanced rendering with performance optimizations
    render(timestamp) {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Create enhanced starfield background
        this.renderEnhancedBackground();
        
        // Render grid if enabled
        if (this.displayOptions.showGrid) {
            this.renderEnhancedGrid();
        }
        
        // Render enhanced stars
        this.renderEnhancedStars(timestamp);
        
        // Render enhanced constellations
        this.renderEnhancedConstellations(timestamp);
        
        // Auto-save periodically during interaction
        if (timestamp - this.viewState.lastSaveTime > 30000) { // Every 30 seconds
            this.saveState();
        }
    }
    
    renderEnhancedBackground() {
        const rect = this.canvas.getBoundingClientRect();
        
        // Create more complex gradient background
        const gradient = this.ctx.createRadialGradient(
            rect.width / 2, rect.height / 2, 0,
            rect.width / 2, rect.height / 2, Math.max(rect.width, rect.height) * 0.8
        );
        
        // Enhanced gradient stops for more depth
        gradient.addColorStop(0, 'rgba(30, 27, 75, 0.9)');
        gradient.addColorStop(0.3, 'rgba(20, 20, 50, 0.95)');
        gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.98)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Add subtle nebula effects based on emotional state
        if (this.emotionalEffects && this.emotionalEffects.intensity > 0) {
            this.renderEmotionalBackground(timestamp);
        }
    }
    
    renderEmotionalBackground(timestamp) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Create emotional nebula effects
        Object.entries(this.emotionalEffects).forEach(([emotion, active]) => {
            if (active && emotion !== 'intensity') {
                const colors = {
                    mourning: 'rgba(59, 130, 246, 0.05)',
                    revelation: 'rgba(251, 191, 36, 0.05)',
                    bargain: 'rgba(34, 197, 94, 0.05)',
                    betrayal: 'rgba(239, 68, 68, 0.05)'
                };
                
                const color = colors[emotion];
                if (color) {
                    // Subtle pulsing nebula effect
                    const pulse = Math.sin(timestamp * 0.001) * 0.3 + 0.7;
                    this.ctx.fillStyle = color.replace('0.05', `${0.05 * pulse}`);
                    this.ctx.fillRect(0, 0, rect.width, rect.height);
                }
            }
        });
    }
    
    renderEnhancedGrid() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 60 * this.viewState.zoom;
        const startX = (-this.viewState.offsetX % gridSize);
        const startY = (-this.viewState.offsetY % gridSize);
        
        this.ctx.beginPath();
        
        // Vertical lines
        for (let x = startX; x < rect.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, rect.height);
        }
        
        // Horizontal lines
        for (let y = startY; y < rect.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(rect.width, y);
        }
        
        this.ctx.stroke();
        
        // Add coordinate labels if zoomed in enough
        if (this.viewState.zoom > 1.5) {
            this.renderGridLabels(gridSize, startX, startY, rect);
        }
    }
    
    renderGridLabels(gridSize, startX, startY, rect) {
        this.ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        let labelIndex = 0;
        for (let x = startX; x < rect.width && labelIndex < 10; x += gridSize, labelIndex++) {
            if (x > 20) {
                this.ctx.fillText(`${Math.floor(x / gridSize)}`, x + 2, 2);
            }
        }
    }
    
    renderEnhancedStars(timestamp) {
        // Use performance mode if needed
        const step = this.performanceMode ? 2 : 1;
        
        for (let i = 0; i < this.stars.length; i += step) {
            const star = this.stars[i];
            const screenPos = this.worldToScreen(star.x, star.y);
            
            if (this.isOnScreen(screenPos.x, screenPos.y)) {
                // Enhanced twinkling with emotional and magical influence
                let twinkle = Math.sin(timestamp * 0.002 + star.x * 0.01) * 0.3 + 0.7;
                if (hasEmotionalEffect) {
                    twinkle += Math.sin(timestamp * 0.005 + index) * 0.15;
                }
                twinkle *= magicalPulse;
                
                const alpha = star.brightness * twinkle;
                const baseColor = isHighlighted ? emotionalColor : '255, 255, 255';
                
                // Enhanced size calculation with magical intensity
                const enhancedSize = star.size * this.viewState.zoom * 
                    (1 + (constellation.magicalIntensity || 3) * 0.05);
                
                // Base star rendering
                this.ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, enhancedSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Enhanced effects for highlighted/magical constellations
                if (isHighlighted || hasEmotionalEffect || constellation.magicalIntensity > 3) {
                    // Multi-layered glow effect
                    this.renderStarGlowEffects(screenPos, enhancedSize, emotionalColor, constellation, timestamp, index);
                }
                
                // Special constellation-specific effects
                this.renderEnhancedSpecialEffects(constellation, star, screenPos, timestamp, index);
            }
        });
        
        // Enhanced constellation lines
        if (this.displayOptions.showLines && constellation.stars.length > 1) {
            this.renderEnhancedConstellationLines(constellation, isHighlighted, emotionalColor, timestamp);
        }
        
        // Enhanced constellation names
        if (this.displayOptions.showNames) {
            this.renderEnhancedConstellationName(constellation, isHighlighted, emotionalColor);
        }
    }
    
    renderStarGlowEffects(screenPos, size, color, constellation, timestamp, index) {
        // Inner glow
        this.ctx.shadowColor = `rgba(${color}, 0.6)`;
        this.ctx.shadowBlur = 8 * this.viewState.zoom;
        this.ctx.fill();
        
        // Outer glow for high magical intensity
        if (constellation.magicalIntensity > 3) {
            this.ctx.shadowBlur = 15 * this.viewState.zoom;
            this.ctx.shadowColor = `rgba(${color}, 0.4)`;
            this.ctx.fill();
        }
        
        // Pulsing ring for emotionally active constellations
        if (this.hasActiveEmotionalEffect(constellation)) {
            const pulseSize = Math.sin(timestamp * 0.003 + index) * 3 + 5;
            this.ctx.strokeStyle = `rgba(${color}, 0.3)`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, size + pulseSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    renderEnhancedSpecialEffects(constellation, star, screenPos, timestamp, index) {
        switch (constellation.name) {
            case "The Lantern Bearer":
            case "Hope's Light":
                this.renderLanternFlameEffect(constellation, star, screenPos, timestamp, index);
                break;
                
            case "The Shattered Path":
            case "Broken Road":
                this.renderShatteredPathEffect(constellation, star, screenPos, timestamp, index);
                break;
                
            case "The Mourning Tree":
            case "Sorrow's Sentinel":
                this.renderMourningTreeEffect(constellation, star, screenPos, timestamp, index);
                break;
                
            case "The Driftcloak":
            case "Wanderer's Mantle":
                this.renderDriftcloakEffect(constellation, star, screenPos, timestamp, index);
                break;
                
            case "The Spider":
            case "The Great Weaver":
                this.renderSpiderWebEffect(constellation, star, screenPos, timestamp, index);
                break;
        }
    }
    
    renderLanternFlameEffect(constellation, star, screenPos, timestamp, index) {
        // Enhanced flickering for lantern flame stars
        if (star.x > constellation.position.x + 15) {
            const flicker = Math.sin(timestamp * 0.012 + index * 0.7) * 0.4 + 0.6;
            const heatShimmer = Math.sin(timestamp * 0.008 + index) * 2;
            
            this.ctx.fillStyle = `rgba(255, 200, 100, ${flicker})`;
            this.ctx.beginPath();
            this.ctx.arc(
                screenPos.x + heatShimmer, 
                screenPos.y - Math.abs(heatShimmer), 
                (star.size + 2) * this.viewState.zoom, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    renderShatteredPathEffect(constellation, star, screenPos, timestamp, index) {
        // Random fragmentation effect
        if ((timestamp * 0.001 + index * 47) % 2 < 0.3) {
            const fragments = 3;
            for (let f = 0; f < fragments; f++) {
                const offsetX = (Math.sin(index + f) * 6);
                const offsetY = (Math.cos(index + f) * 6);
                
                this.ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
                this.ctx.beginPath();
                this.ctx.arc(
                    screenPos.x + offsetX, 
                    screenPos.y + offsetY, 
                    star.size * 0.3 * this.viewState.zoom, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        }
    }
    
    renderMourningTreeEffect(constellation, star, screenPos, timestamp, index) {
        // Enhanced dripping tears effect
        if (star.y > constellation.position.y + 10) {
            const dropPhase = (timestamp * 0.002 + index) % 4;
            if (dropPhase < 1) {
                const dropAlpha = Math.sin(dropPhase * Math.PI) * 0.4;
                const dropY = screenPos.y + (dropPhase * 20);
                
                this.ctx.fillStyle = `rgba(59, 130, 246, ${dropAlpha})`;
                this.ctx.beginPath();
                this.ctx.arc(
                    screenPos.x, 
                    dropY, 
                    star.size * 0.6 * this.viewState.zoom, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        }
    }
    
    renderDriftcloakEffect(constellation, star, screenPos, timestamp, index) {
        // Flowing cloth animation
        const flowOffset = Math.sin(timestamp * 0.003 + index * 0.5) * 3;
        const opacity = 0.3 + Math.sin(timestamp * 0.002 + index) * 0.2;
        
        this.ctx.fillStyle = `rgba(200, 200, 255, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(
            screenPos.x + flowOffset, 
            screenPos.y, 
            star.size * 1.2 * this.viewState.zoom, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    renderSpiderWebEffect(constellation, star, screenPos, timestamp, index) {
        // Subtle web strand effects for web line stars
        if (Math.sqrt(Math.pow(star.x - constellation.position.x, 2) + 
                     Math.pow(star.y - constellation.position.y, 2)) > 20) {
            const webPulse = Math.sin(timestamp * 0.001 + index * 0.3) * 0.2 + 0.8;
            
            this.ctx.strokeStyle = `rgba(34, 197, 94, ${0.3 * webPulse})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.worldToScreen(constellation.position.x, constellation.position.y).x,
                this.worldToScreen(constellation.position.x, constellation.position.y).y
            );
            this.ctx.lineTo(screenPos.x, screenPos.y);
            this.ctx.stroke();
        }
    }
    
    renderEnhancedConstellationLines(constellation, isHighlighted, emotionalColor, timestamp) {
        const baseAlpha = isHighlighted ? 0.9 : 0.4;
        const magicalPulse = constellation.magicalIntensity > 3 ? 
            Math.sin(timestamp * 0.001) * 0.2 + 0.8 : 1;
        
        const alpha = baseAlpha * magicalPulse;
        const color = isHighlighted ? `rgba(${emotionalColor}, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = (isHighlighted ? 3 : 1.5) * this.viewState.zoom;
        
        // Enhanced line patterns based on constellation type
        this.ctx.beginPath();
        
        switch (constellation.name) {
            case "The Shattered Path":
            case "Broken Road":
                this.renderBrokenLines(constellation);
                break;
            case "The Driftcloak":
            case "Wanderer's Mantle":
                this.renderFlowingLines(constellation);
                break;
            case "The Spider":
            case "The Great Weaver":
                this.renderWebLines(constellation);
                break;
            default:
                this.renderStandardLines(constellation);
        }
        
        this.ctx.stroke();
        
        // Enhanced glow for highlighted constellations
        if (isHighlighted) {
            this.ctx.shadowColor = `rgba(${emotionalColor}, 0.6)`;
            this.ctx.shadowBlur = 12 * this.viewState.zoom;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }
    
    renderWebLines(constellation) {
        // Special web pattern for spider constellations
        const center = this.worldToScreen(constellation.position.x, constellation.position.y);
        const webStars = constellation.stars.filter(star => 
            Math.sqrt(Math.pow(star.x - constellation.position.x, 2) + 
                     Math.pow(star.y - constellation.position.y, 2)) > 15
        );
        
        webStars.forEach(star => {
            const starPos = this.worldToScreen(star.x, star.y);
            this.ctx.moveTo(center.x, center.y);
            this.ctx.lineTo(starPos.x, starPos.y);
        });
    }
    
    renderStandardLines(constellation) {
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
    }
    
    renderBrokenLines(constellation) {
        // Enhanced broken line rendering
        const stars = constellation.stars;
        for (let i = 0; i < stars.length - 1; i++) {
            if (Math.random() > 0.4) { // 60% chance to draw each segment
                const startPos = this.worldToScreen(stars[i].x, stars[i].y);
                const endPos = this.worldToScreen(stars[i + 1].x, stars[i + 1].y);
                
                if (this.isOnScreen(startPos.x, startPos.y) || this.isOnScreen(endPos.x, endPos.y)) {
                    this.ctx.moveTo(startPos.x, startPos.y);
                    this.ctx.lineTo(endPos.x, endPos.y);
                }
            }
        }
    }
    
    renderFlowingLines(constellation) {
        // Enhanced flowing lines with better curves
        const stars = constellation.stars;
        if (stars.length < 2) return;
        
        const firstPos = this.worldToScreen(stars[0].x, stars[0].y);
        this.ctx.moveTo(firstPos.x, firstPos.y);
        
        for (let i = 1; i < stars.length - 1; i++) {
            const currentPos = this.worldToScreen(stars[i].x, stars[i].y);
            const nextPos = this.worldToScreen(stars[i + 1].x, stars[i + 1].y);
            
            const controlX = (currentPos.x + nextPos.x) / 2;
            const controlY = (currentPos.y + nextPos.y) / 2;
            
            this.ctx.quadraticCurveTo(currentPos.x, currentPos.y, controlX, controlY);
        }
        
        if (stars.length > 1) {
            const lastPos = this.worldToScreen(stars[stars.length - 1].x, stars[stars.length - 1].y);
            this.ctx.lineTo(lastPos.x, lastPos.y);
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
            
            // Enhanced text effects
            if (isHighlighted) {
                this.ctx.shadowColor = `rgba(${emotionalColor}, 0.8)`;
                this.ctx.shadowBlur = 6;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }
            
            this.ctx.fillText(constellation.name, centerPos.x, centerPos.y);
            
            // Alternate name rendering
            if (constellation.alternateName && this.viewState.zoom > 1.2) {
                this.ctx.font = `${fontSize * 0.6}px "Cinzel", Georgia, serif`;
                this.ctx.fillStyle = `rgba(${isHighlighted ? emotionalColor : '255, 255, 255'}, 0.7)`;
                this.ctx.fillText(`"${constellation.alternateName}"`, centerPos.x, centerPos.y + fontSize + 8);
            }
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        }
    }
    
    // Enhanced utility methods
    isConstellationHighlighted(constellation) {
        return this.filters.emotional.some(emotion => 
            constellation.emotionalTriggers.map(t => t.toLowerCase()).includes(emotion)
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
    
    // Enhanced UI methods
    showConstellationDetail(constellation) {
        const panel = document.getElementById('constellation-detail');
        
        // Populate basic information
        document.getElementById('detail-name').textContent = constellation.name;
        document.getElementById('detail-alternate-name').textContent = constellation.alternateName || '';
        document.getElementById('detail-shape').textContent = constellation.shape;
        document.getElementById('detail-season').textContent = constellation.season;
        document.getElementById('detail-symbolism').textContent = constellation.symbolism;
        document.getElementById('detail-effects').textContent = constellation.specialEffects;
        document.getElementById('detail-nav-info').textContent = constellation.currentAlignment || 'Variable positioning';
        document.getElementById('detail-resonance').textContent = constellation.mythicResonance;
        
        // Enhanced property display
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
        
        // Enhanced emotional triggers
        const triggersContainer = document.getElementById('detail-triggers');
        triggersContainer.innerHTML = '';
        constellation.emotionalTriggers.forEach(trigger => {
            const triggerData = this.emotionalTriggers[trigger.toUpperCase()];
            const badge = document.createElement('span');
            badge.className = `emotion-badge ${trigger.toLowerCase()}`;
            badge.textContent = trigger;
            badge.title = triggerData?.description || trigger;
            triggersContainer.appendChild(badge);
        });
        
        // Enhanced lore usage section
        const loreElement = document.getElementById('detail-lore-usage');
        if (loreElement) {
            let loreText = `This constellation appears during ${constellation.season}`;
            if (constellation.navigationValue > 3) {
                loreText += ` and serves as a reliable navigation beacon`;
            }
            if (constellation.magicalIntensity > 3) {
                loreText += `. Its high magical intensity makes it visible even to untrained observers`;
            }
            if (constellation.emotionalTriggers.length > 0) {
                loreText += `. It resonates strongly with emotions of ${constellation.emotionalTriggers.join(' and ').toLowerCase()}`;
            }
            loreText += '.';
            loreElement.textContent = loreText;
        }
        
        panel.classList.remove('translate-x-full');
    }
    
    hideConstellationDetail() {
        document.getElementById('constellation-detail').classList.add('translate-x-full');
    }
    
    showHelp() {
        document.getElementById('help-modal').classList.remove('hidden');
    }
    
    hideHelp() {
        document.getElementById('help-modal').classList.add('hidden');
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
    
    // Enhanced interaction methods (copy existing methods for mouse/keyboard interaction)
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
    
    // Event handlers (copy from original with enhancements)
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
        this.saveState(); // Save after user interaction
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
                return distance < 25; // Slightly larger hit area
            });
        });
    }
    
    // Navigation methods with state saving
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
}

// Initialize enhanced application
if (typeof window !== 'undefined') {
    window.EnhancedStarMap = EnhancedStarMap;
}.y)) {
                // Enhanced twinkling with stellar class
                const twinkleBase = Math.sin(timestamp * star.twinkleSpeed * 0.001 + star.twinkle) * 0.4 + 0.6;
                const alpha = star.brightness * twinkleBase;
                
                // Use stellar color
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
                
                // Add subtle glow for brighter stars
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
        // Sort constellations by magical intensity for proper layering
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
        
        // Enhanced magical intensity effects
        const magicalPulse = constellation.magicalIntensity > 3 ? 
            Math.sin(timestamp * 0.002) * 0.2 + 0.8 : 1;
        
        // Render constellation stars with enhanced effects
        constellation.stars.forEach((star, index) => {
            const screenPos = this.worldToScreen(star.x, star.y);
            
            if (this.isOnScreen(screenPos.x, screenPos    
    // Enhanced constellation star generation methods
    generateCentaurStars(position) {
        const stars = [];
        
        // Centaur body (horse part) - enhanced with more detail
        stars.push(
            { x: position.x - 35, y: position.y + 25, brightness: 0.9, size: 3.5 }, // Back legs
            { x: position.x - 20, y: position.y + 30, brightness: 0.8, size: 3 }, // Body center
            { x: position.x - 5, y: position.y + 20, brightness: 0.95, size: 4 }, // Torso junction (brightest)
            { x: position.x - 15, y: position.y + 35, brightness: 0.7, size: 2.5 }, // Front legs
            { x: position.x - 25, y: position.y + 15, brightness: 0.6, size: 2 } // Back line
        );
        
        // Human torso and arms - enhanced archer pose
        stars.push(
            { x: position.x + 8, y: position.y - 2, brightness: 0.9, size: 3.5 }, // Torso
            { x: position.x + 12, y: position.y - 15, brightness: 0.85, size: 3 }, // Head
            { x: position.x + 18, y: position.y - 8, brightness: 0.8, size: 2.5 }, // Draw arm
            { x: position.x + 30, y: position.y - 12, brightness: 0.95, size: 3 }, // Arrow tip (brightest for navigation)
            { x: position.x + 25, y: position.y - 10, brightness: 0.7, size: 2 }, // Arrow shaft
            { x: position.x + 5, y: position.y - 5, brightness: 0.75, size: 2.5 } // Bow arm
        );
        
        return stars;
    }
    
    generateLilyStars(position) {
        const stars = [];
        
        // Lily center
        stars.push({ x: position.x, y: position.y, brightness: 0.95, size: 4 });
        
        // Six petals reaching skyward in lily formation
        const petalAngles = [0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3];
        petalAngles.forEach((angle, index) => {
            // Outer petal tips
            const radius = 20 + Math.sin(index) * 5; // Slight variation
            stars.push({
                x: position.x + Math.cos(angle - Math.PI/2) * radius, // -PI/2 to point upward
                y: position.y + Math.sin(angle - Math.PI/2) * radius,
                brightness: 0.8 + Math.random() * 0.1,
                size: 2.5 + Math.random() * 0.5
            });
            
            // Inner petal base
            stars.push({
                x: position.x + Math.cos(angle - Math.PI/2) * (radius * 0.6),
                y: position.y + Math.sin(angle - Math.PI/2) * (radius * 0.6),
                brightness: 0.7,
                size: 2
            });
        });
        
        // Stem (pointing downward)
        for (let i = 1; i <= 3; i++) {
            stars.push({
                x: position.x,
                y: position.y + i * 12,
                brightness: 0.6 - i * 0.1,
                size: 2 - i * 0.2
            });
        }
        
        return stars;
    }
    
    generateSpiderStars(position) {
        const stars = [];
        
        // Enhanced spider body with abdomen and cephalothorax
        stars.push(
            { x: position.x, y: position.y, brightness: 0.95, size: 4 }, // Abdomen
            { x: position.x, y: position.y - 8, brightness: 0.9, size: 3 } // Cephalothorax
        );
        
        // Eight legs in proper spider formation
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
        
        // Web lines extending outward (mentioned in lore as "weaving three lines")
        const webAngles = [0, 2*Math.PI/3, 4*Math.PI/3];
        webAngles.forEach(angle => {
            for (let i = 1; i <= 4; i++) {
                const distance = i * 15;
                stars.push({
                    x: position.x + Math.cos(angle) * distance,
                    y: position.y + Math.sin(angle) * distance,
                    brightness: 0.5 - i * 0.08,
                    size: 1.5 - i * 0.2
                });
            }
        });
        
        return stars;
    }
    
    generateChaliceStars(position) {
        const stars = [];
        
        // Chalice base
        stars.push({ x: position.x, y: position.y + 25, brightness: 0.8, size: 3 });
        
        // Stem
        stars.push(
            { x: position.x, y: position.y + 15, brightness: 0.7, size: 2.5 },
            { x: position.x, y: position.y + 5, brightness: 0.75, size: 2.5 }
        );
        
        // Bowl of chalice with 5 radiant stars as mentioned in lore
        const rimAngles = [0, Math.PI*2/5, Math.PI*4/5, Math.PI*6/5, Math.PI*8/5];
        rimAngles.forEach((angle, index) => {
            stars.push({
                x: position.x + Math.cos(angle) * 20,
                y: position.y - 5 + Math.sin(angle) * 8,
                brightness: 0.9 + Math.random() * 0.1,
                size: 3 + Math.random() * 0.5
            });
        });
        
        // Central radiance
        stars.push({ x: position.x, y: position.y - 5, brightness: 0.95, size: 3.5 });
        
        return stars;
    }
    
    generateDreamingHeadStars(position) {
        const stars = [];
        
        // Head outline
        const headRadius = 18;
        const headAngles = 12;
        for (let i = 0; i < headAngles; i++) {
            const angle = (i / headAngles) * Math.PI * 2;
            stars.push({
                x: position.x + Math.cos(angle) * headRadius,
                y: position.y + Math.sin(angle) * headRadius * 0.8, // Slightly flattened
                brightness: 0.7 + Math.random() * 0.1,
                size: 2 + Math.random() * 0.5
            });
        }
        
        // Closed eyes (two small dim stars)
        stars.push(
            { x: position.x - 6, y: position.y - 3, brightness: 0.4, size: 1.5 },
            { x: position.x + 6, y: position.y - 3, brightness: 0.4, size: 1.5 }
        );
        
        // Flowing hair made of stardust
        const hairFlows = [
            { baseAngle: -Math.PI/3, length: 25, stars: 6 },
            { baseAngle: -Math.PI/6, length: 30, stars: 7 },
            { baseAngle: Math.PI/6, length: 28, stars: 6 },
            { baseAngle: Math.PI/3, length: 22, stars: 5 }
        ];
        
        hairFlows.forEach(flow => {
            for (let i = 1; i <= flow.stars; i++) {
                const flowAngle = flow.baseAngle + (Math.random() - 0.5) * 0.3;
                const distance = (i / flow.stars) * flow.length + headRadius;
                stars.push({
                    x: position.x + Math.cos(flowAngle) * distance,
                    y: position.y + Math.sin(flowAngle) * distance,
                    brightness: 0.6 - i * 0.05,
                    size: 2 - i * 0.15
                });
            }
        });
        
        return stars;
    }
    
    generateAntlerTreeStars(position) {
        const stars = [];
        
        // Tree trunk
        stars.push(
            { x: position.x, y: position.y + 30, brightness: 0.8, size: 3.5 },
            { x: position.x, y: position.y + 20, brightness: 0.85, size: 3 },
            { x: position.x, y: position.y + 10, brightness: 0.9, size: 3 }
        );
        
        // Main antler branches (like tree branches)
        const mainBranches = [
            { angle: -Math.PI/3, length: 25 },
            { angle: -Math.PI/6, length: 30 },
            { angle: Math.PI/6, length: 28 },
            { angle: Math.PI/3, length: 24 }
        ];
        
        mainBranches.forEach(branch => {
            // Main branch line
            for (let i = 1; i <= 3; i++) {
                const distance = (i / 3) * branch.length;
                stars.push({
                    x: position.x + Math.cos(branch.angle) * distance,
                    y: position.y + Math.sin(branch.angle) * distance,
                    brightness: 0.8 - i * 0.1,
                    size: 3 - i * 0.3
                });
            }
            
            // Antler points (smaller branches)
            const numPoints = 2 + Math.floor(Math.random() * 3);
            for (let p = 0; p < numPoints; p++) {
                const pointAngle = branch.angle + (p - numPoints/2) * 0.4;
                const pointDistance = branch.length * (0.6 + p * 0.2);
                stars.push({
                    x: position.x + Math.cos(pointAngle) * pointDistance,
                    y: position.y + Math.sin(pointAngle) * pointDistance,
                    brightness: 0.6 + Math.random() * 0.2,
                    size: 1.5 + Math.random() * 1
                });
            }
        });
        
        return stars;
    }
    
    // Include other star generation methods for completeness
    generateGenericConstellationStars(position) {
        const stars = [];
        const numStars = 6 + Math.floor(Math.random() * 8);
        
        // Central bright star
        stars.push({ x: position.x, y: position.y, brightness: 0.95, size: 3.5 });
        
        // Surrounding pattern
        for (let i = 1; i < numStars; i++) {
            const angle = (i / (numStars - 1)) * Math.PI * 2 + Math.random() * 0.5;
            const distance = 20 + Math.random() * 30;
            
            stars.push({
                x: position.x + Math.cos(angle) * distance,
                y: position.y + Math.sin(angle) * distance,
                brightness: 0.7 + Math.random() * 0.3,
                size: 2 + Math.random() * 2
            });
        }
        
        return stars;
    }
    
    // Use existing star generation methods for other constellations
    generateMaskMirrorStars(position) {
        // Use the existing implementation from the original
        const stars = [];
        
        // Mask outline
        stars.push(
            { x: position.x - 20, y: position.y - 15, brightness: 0.8, size: 2.5 },
            { x: position.x + 20, y: position.y - 15, brightness: 0.8, size: 2.5 },
            { x: position.x - 25, y: position.y, brightness: 0.7, size: 2 },
            { x: position.x + 25, y: position.y, brightness: 0.7, size: 2 },
            { x: position.x - 15, y: position.y + 20, brightness: 0.8, size: 2.5 },
            { x: position.x + 15, y: position.y + 20, brightness: 0.8, size: 2.5 }
        );
        
        // Central crack (the mirror element)
        stars.push(
            { x: position.x, y: position.y - 20, brightness: 0.9, size: 3 },
            { x: position.x, y: position.y, brightness: 0.95, size: 3.5 },
            { x: position.x, y: position.y + 20, brightness: 0.9, size: 3 }
        );
        
        return stars;
    }
    
    // Add other existing methods as needed (keeping them from the original implementation)
    generateBloomingFangStars(position) {
        return this.generateCentaurStars(position); // Placeholder - use existing method
    }
    
    generateSwanUpperStars(position) {
        return this.generateGenericConstellationStars(position); // Placeholder
    }
    
    generateSwanLowerStars(position) {
        return this.generateGenericConstellationStars(position); // Placeholder
    }
    
    generateLanternBearerStars(position) {
        return this.generateGenericConstellationStars(position); // Placeholder
    }
    
    generateSilentStepStars(position) {
        const stars = [];
        
        // Trail of pawprints across the sky
        for (let i = 0; i < 7; i++) {
            const x = position.x + (i - 3) * 18;
            const y = position.y + Math.sin(i * 0.7) * 12;
            
            // Each pawprint has 4 toe stars plus pad
            stars.push(
                { x: x - 2, y: y - 2, brightness: 0.7, size: 1.5 },
                { x: x + 2, y: y - 2, brightness: 0.7, size: 1.5 },
                { x: x - 2, y: y + 2, brightness: 0.7, size: 1.5 },
                { x: x + 2, y: y + 2, brightness: 0.7, size: 1.5 },
                { x: x, y: y + 5, brightness: 0.8, size: 2 } // Pad
            );
        }
        
        return stars;
    }
    
    generateFlyingMantisStars(position) {
        const stars = [];
        
        // Mantis body
        stars.push(
            { x: position.x, y: position.y + 10, brightness: 0.9, size: 3 }, // Abdomen
            { x: position.x, y: position.y, brightness: 0.9, size: 2.5 }, // Thorax
            { x: position.x, y: position.y - 8, brightness: 0.85, size: 2 } // Head
        );
        
        // Wings spread
        const wingStars = [
            { x: position.x - 15, y: position.y - 5, brightness: 0.7, size: 2 },
            { x: position.x - 20, y: position.y - 2, brightness: 0.6, size: 1.5 },
            { x: position.x + 15, y: position.y - 5, brightness: 0.7, size: 2 },
            { x: position.x + 20, y: position.y - 2, brightness: 0.6, size: 1.5 }
        ];
        stars.push(...wingStars);
        
        // Foreclaws extended
        stars.push(
            { x: position.x - 8, y: position.y - 15, brightness: 0.8, size: 2 },
            { x: position.x + 8, y: position.y - 15, brightness: 0.8, size: 2 }
        );
        
        return stars;
    }
    
    generateInvertedCrownStars(position) {
        const stars = [];
        
        // Crown base (horizontal line)
        stars.push(
            { x: position.x - 25, y: position.y, brightness: 0.8, size: 2.5 },
            { x: position.x, y: position.y, brightness: 0.9, size: 3 },
            { x: position.x + 25, y: position.y, brightness: 0.8, size: 2.5 }
        );
        
        // Crown points (pointing upward)
        for (let i = 0; i < 5; i++) {
            const x = position.x + (i - 2) * 12;
            const height = i === 2 ? -20 : -15; // Center point taller
            stars.push({ x: x, y: position.y + height, brightness: 0.8, size: 2 });
        }
        
        // Spilling jewel stars (falling downward)
        for (let i = 0; i < 10; i++) {
            stars.push({
                x: position.x + (Math.random() - 0.5) * 50,
                y: position.y + 10 + Math.random() * 40,
                brightness: 0.5 + Math.random() * 0.3,
                size: 1 + Math.random() * 1.5
            });
        }
        
        return stars;
    }
    
    generateHeartrootStars(position) {
        const stars = [];
        
        // Central heart/knot
        stars.push({ x: position.x, y: position.y, brightness: 0.95, size: 4 });
        
        // Root tendrils curling inward
        const rootAngles = [0, Math.PI/2, Math.PI, Math.PI * 3/2];
        rootAngles.forEach((baseAngle) => {
            for (let i = 1; i <= 5; i++) {
                // Roots curve inward toward center
                const curveFactor = (i / 5) * 0.8;
                const angle = baseAngle + Math.sin(curveFactor * Math.PI) * 0.5;
                const distance = i * 10;
                
                stars.push({
                    x: position.x + Math.cos(angle) * distance,
                    y: position.y + Math.sin(angle) * distance,
                    brightness: 0.8 - i * 0.1,
                    size: 2.5 - i * 0.2
                });
            }
        });
        
        return stars;
    }
    
    generateMourningTreeStars(position) {
        const stars = [];
        
        // Tree trunk
        stars.push(
            { x: position.x, y: position.y + 30, brightness: 0.8, size: 3.5 },
            { x: position.x, y: position.y + 20, brightness: 0.8, size: 3 },
            { x: position.x, y: position.y + 10, brightness: 0.8, size: 2.5 }
        );
        
        // Bare branches
        const branches = [
            { x: position.x - 20, y: position.y - 5, angle: -0.5 },
            { x: position.x + 20, y: position.y - 5, angle: 0.5 },
            { x: position.x - 15, y: position.y - 15, angle: -0.3 },
            { x: position.x + 15, y: position.y - 15, angle: 0.3 }
        ];
        
        branches.forEach(branch => {
            stars.push({ x: branch.x, y: branch.y, brightness: 0.7, size: 2 });
            
            // Dripping star-tears
            for (let i = 1; i <= 4; i++) {
                stars.push({
                    x: branch.x + (Math.random() - 0.5) * 10,
                    y: branch.y + i * 10,
                    brightness: 0.5 - i * 0.08,
                    size: 1.2 - i * 0.1
                });
            }
        });
        
        return stars;
    }
    
    generateDriftcloakStars(position) {
        const stars = [];
        
        // Flowing cloak pattern
        for (let i = 0; i < 15; i++) {
            const t = i / 14;
            const x = position.x + (t - 0.5) * 80;
            const y = position.y + Math.sin(t * Math.PI * 3) * 20 + Math.sin(t * Math.PI * 6) * 8;
            
            stars.push({
                x: x,
                y: y,
                brightness: 0.6 + Math.random() * 0.3,
                size: 1.5 + Math.random() * 1
            });
        }
        
        return stars;
    }
    
    generateShatteredPathStars(position) {
        const stars = [];
        
        // Broken trail with deliberate gaps
        const segments = [
            { start: -50, end: -25 },
            { start: -15, end: 0 },
            { start: 10, end: 20 },
            { start: 30, end: 50 }
        ];
        
        segments.forEach(segment => {
            const numStars = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < numStars; i++) {
                const x = position.x + segment.start + (i / (numStars - 1)) * (segment.end - segment.start);
                const y = position.y + (Math.random() - 0.5) * 20;
                
                stars.push({
                    x: x,
                    y: y,
                    brightness: 0.5 + Math.random() * 0.4,
                    size: 1.5 + Math.random() * 2
                });
            }
        });
        
        return stars;
    }
    
    generateSiblingMoonsStars(position) {
        const stars = [];
        
        // First crescent moon
        const crescent1Center = { x: position.x - 12, y: position.y };
        const crescent1Angle = Math.PI * 0.3;
        for (let i = 0; i < 6; i++) {
            const angle = crescent1Angle + (i * Math.PI * 0.6 / 5);
            stars.push({
                x: crescent1Center.x + Math.cos(angle) * 18,
                y: crescent1Center.y + Math.sin(angle) * 18,
                brightness: 0.85,
                size: 2.5
            });
        }
        
        // Second crescent moon (overlapping)
        const crescent2Center = { x: position.x + 12, y: position.y };
        const crescent2Angle = Math.PI * 1.2;
        for (let i = 0; i < 6; i++) {
            const angle = crescent2Angle + (i * Math.PI * 0.6 / 5);
            stars.push({
                x: crescent2Center.x + Math.cos(angle) * 18,
                y: crescent2Center.y + Math.sin(angle) * 18,
                brightness: 0.85,
                size: 2.5
            });
        }
        
        // Overlapping center glow
        stars.push({ x: position.x, y: position.y, brightness: 0.95, size: 3.5 });
        
        return stars;
    }
    
    generateMaskTwinsStars(position) {
        const stars = [];
        
        // First mask (upright - joy)
        const mask1Center = { x: position.x - 15, y: position.y };
        
        // Joyful expression outline
        stars.push(
            { x: mask1Center.x - 10, y: mask1Center.y - 8, brightness: 0.8, size: 2 }, // Left eye
            { x: mask1Center.x + 10, y: mask1Center.y - 8, brightness: 0.8, size: 2 }, // Right eye
            { x: mask1Center.x - 8, y: mask1Center.y + 8, brightness: 0.7, size: 2 }, // Smile left
            { x: mask1Center.x, y: mask1Center.y + 12, brightness: 0.7, size: 2 }, // Smile center
            { x: mask1Center.x + 8, y: mask1Center.y + 8, brightness: 0.7, size: 2 } // Smile right
        );
        
        // Second mask (inverted - sorrow)
        const mask2Center = { x: position.x + 15, y: position.y };
        
        // Sorrowful expression outline
        stars.push(
            { x: mask2Center.x - 10, y: mask2Center.y + 8, brightness: 0.8, size: 2 }, // Left eye (inverted)
            { x: mask2Center.x + 10, y: mask2Center.y + 8, brightness: 0.8, size: 2 }, // Right eye (inverted)
            { x: mask2Center.x - 8, y: mask2Center.y - 8, brightness: 0.7, size: 2 }, // Frown left
            { x: mask2Center.x, y: mask2Center.y - 12, brightness: 0.7, size: 2 }, // Frown center
            { x: mask2Center.x + 8, y: mask2Center.y - 8, brightness: 0.7, size: 2 } // Frown right
        );
        
        // Central connecting energy
        stars.push({ x: position.x, y: position.y, brightness: 0.9, size: 3 });
        
        return stars;
    }
    
    // Enhanced visibility and filtering logic
    updateVisibleConstellations() {
        if (!window.EnhancedConstellationData?.ConstellationFilter) {
            console.warn('Enhanced constellation filter not available, using fallback');
            this.visibleConstellations = this.constellations;
            return;
        }
        
        const filter = window.EnhancedConstellationData.ConstellationFilter;
        
        // Start with all constellations
        let filtered = [...this.constellations];
        
        // Apply seasonal filtering with enhanced logic
        filtered = filter.bySeasonEnhanced(filtered, this.filters.season);
        
        // Apply emotional filtering
        filtered = filter.byEmotionalTriggers(filtered, this.filters.emotional);
        
        // Apply time-of-night filtering
        filtered = filter.byTimeOfNight(filtered, this.filters.timeOfNight);
        
        // Apply magical intensity filtering if enabled
        if (this.filters.magicalIntensityMin > 0 || this.filters.magicalIntensityMax < 5) {
            filtered = filtered.filter(constellation => {
                const intensity = constellation.magicalIntensity || 3;
                return intensity >= this.filters.magicalIntensityMin && 
                       intensity <= this.filters.magicalIntensityMax;
            });
        }
        
        // Handle special events
        if (!this.filters.showSpecialEvents) {
            filtered = filtered.filter(constellation => 
                !['equinox', 'solstice', 'eclipse', 'seasonal-transition'].includes(constellation.season)
            );
        }
        
        this.visibleConstellations = filtered;
        
        // Apply emotional effects for rendering
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
        
        // Clear existing options
        seasonSelect.innerHTML = '';
        
        // Enhanced season options
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
        
        // Set current value
        seasonSelect.value = this.filters.season;
    }
    
    updateConstellationList() {
        const listContainer = document.getElementById('constellation-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        // Group constellations by category for better organization
        const groupedConstellations = this.groupConstellationsByCategory();
        
        Object.entries(groupedConstellations).forEach(([category, constellations]) => {
            if (constellations.length === 0) return;
            
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'text-sm font-semibold text-purple-300 mt-4 mb-2 border-b border-purple-500 border-opacity-30 pb-1';
            categoryHeader.textContent = this.getCategoryDisplayName(category);
            listContainer.appendChild(categoryHeader);
            
            // Add constellations in this category
            constellations.forEach(constellation => {
                const item = this.createConstellationListItem(constellation);
                listContainer.appendChild(item);
            });
        });
    }
    
    groupConstellationsByCategory() {
        const grouped = {
            eternal: [],
            spring: [],
            summer: [],
            autumn: [],
            winter: [],
            special: []
        };
        
        this.visibleConstellations.forEach(constellation => {
            const category = constellation.seasonCategory || 'eternal';
            if (grouped[category]) {
                grouped[category].push(constellation);
            }
        });
        
        return grouped;
    }
    
    getCategoryDisplayName(category) {
        const names = {
            eternal: '⭐ Eternal Constellations',
            spring: '🌸 Spring Constellations',
            summer: '☀️ Summer Constellations',
            autumn: '🍂 Autumn Constellations',
            winter: '❄️ Winter Constellations',
            special: '🌟 Special Events'
        };
        return names[category] || category;
    }
    
    createConstellationListItem(constellation) {
        const item = document.createElement('div');
        item.className = 'constellation-item p-3 rounded cursor-pointer border border-transparent hover:border-purple-500 hover:border-opacity-30 transition-all duration-200';
        
        // Enhanced emotional badges
        const emotionalBadges = constellation.emotionalTriggers.map(trigger => {
            const triggerData = this.emotionalTriggers[trigger.toUpperCase()];
            return `<span class="emotion-badge ${trigger.toLowerCase()}" title="${triggerData?.description || trigger}">${trigger}</span>`;
        }).join(' ');
        
        // Magical intensity indicator
        const intensityDots = '●'.repeat(constellation.magicalIntensity || 3);
        const intensityIndicator = `<span class="text-purple-400 text-xs" title="Magical Intensity: ${constellation.magicalIntensity || 3}/5">${intensityDots}</span>`;
        
        // Navigation value indicator
        const navValue = constellation.navigationValue || 0;
        const navIndicator = navValue > 3 ? `<span class="text-yellow-400 text-xs" title="High Navigation Value">🧭</span>` : '';
        
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
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => this.showConstellationDetail(constellation));
        return item;
    }/**
 * Enhanced Hermit's Star Map - Interactive Feywild Constellation Viewer
 * Version 2.0 with improved data management and state persistence
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
        const savedState = window.EnhancedConstellationData?.StarMapState.load();
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
        document.getElementById('season-select').addEventListener('change', (e) => {
            this.filters.season = e.target.value;
            this.updateVisibleConstellations();
            this.updateConstellationList();
            this.saveState();
        });
        
        // Enhanced time slider with better feedback
        const timeSlider = document.getElementById('time-slider');
        timeSlider.addEventListener('input', (e) => {
            this.filters.timeOfNight = parseFloat(e.target.value);
            this.updateTimeDisplay(this.filters.timeOfNight);
            this.updateVisibleConstellations();
        });
        
        timeSlider.addEventListener('change', () => {
            this.saveState(); // Save when user finishes adjusting
        });
        
        // Navigation controls with state saving
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomIn();
            this.saveState();
        });
        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomOut();
            this.saveState();
        });
        document.getElementById('center-view').addEventListener('click', () => {
            this.centerView();
            this.saveState();
        });
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetView();
            this.saveState();
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
            document.getElementById(control.id).addEventListener('click', () => {
                this.pan(control.delta[0], control.delta[1]);
                this.saveState();
            });
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
        document.getElementById('close-detail').addEventListener('click', () => this.hideConstellationDetail());
        
        // Help modal
        document.getElementById('help-button').addEventListener('click', () => this.showHelp());
        document.getElementById('close-help').addEventListener('click', () => this.hideHelp());
        
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
    
    generateEnhancedStarField() {
        this.stars = [];
        const numStars = this.performanceMode ? 800 : 1500; // Adjust for performance
        
        // Generate stars with enhanced distribution and properties
        for (let i = 0; i < numStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.generateRealisticRadius();
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Enhanced brightness calculation
            const distanceFromCenter = Math.sqrt(x * x + y * y);
            const maxDistance = 1000;
            const brightnessMultiplier = Math.max(0.1, 1 - (distanceFromCenter / maxDistance) * 0.7);
            
            // Add stellar classification for realism
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
        }
    }
    
    generateStellarClass() {
        const classes = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
        const weights = [0.1, 0.5, 2, 3, 8, 12, 76]; // Realistic distribution
        
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < classes.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return classes[i];
            }
        }
        return 'M'; // Default to M-class
    }
    
    getStellarColor(stellarClass) {
        const colors = {
            'O': '157, 180, 255', // Blue
            'B': '162, 185, 255', // Blue-white  
            'A': '213, 224, 255', // White
            'F': '249, 245, 255', // Yellow-white
            'G': '255, 244, 234', // Yellow (like our Sun)
            'K': '255, 210, 161', // Orange
            'M': '255, 204, 111'  // Red
        };
        return colors[stellarClass] || '255, 255, 255';
    }
    
    generateRealisticRadius() {
        // Enhanced radius generation with multiple zones
        const random = Math.random();
        
        if (random < 0.6) {
            // Core zone - most stars
            return Math.pow(Math.random(), 0.4) * 400;
        } else if (random < 0.9) {
            // Extended zone
            return 400 + Math.pow(Math.random(), 0.3) * 300;
        } else {
            // Outer zone - few distant stars
            return 700 + Math.random() * 300;
        }
    }
    
    generateEnhancedConstellationPositions() {
        this.constellations.forEach((constellation) => {
            let position;
            
            // Use coordinate data if available
            if (constellation.coordinates && constellation.coordinates.x !== undefined) {
                // Convert percentage coordinates to world coordinates
                const worldSize = 1600; // Total world size
                position = {
                    x: (constellation.coordinates.x / 100) * worldSize - worldSize / 2,
                    y: (constellation.coordinates.y / 100) * worldSize - worldSize / 2
                };
            } else {
                // Fallback positioning for constellations without explicit coordinates
                position = this.generatePositionFromDirection(constellation);
            }
            
            constellation.position = position;
            
            // Generate enhanced star patterns
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
            "zenith": Math.PI * 1.5 // Special case for overhead
        };
        
        const direction = constellation.direction?.toLowerCase() || "variable";
        const angle = directionAngles[direction] || Math.random() * Math.PI * 2;
        
        // Enhanced radius calculation based on elevation and magical intensity
        let radius = 400; // Default
        
        if (constellation.coordinates?.elevation) {
            switch (constellation.coordinates.elevation) {
                case "high": radius = 200 + Math.random() * 100; break;
                case "mid": radius = 350 + Math.random() * 150; break;
                case "low": radius = 550 + Math.random() * 100; break;
                case "variable": radius = 200 + Math.random() * 400; break;
            }
        }
        
        // Adjust for magical intensity (more intense = more central)
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
        // Use enhanced star generation based on constellation properties
        const baseStars = this.generateConstellationStarPattern(constellation);
        
        // Enhance stars based on magical intensity
        const enhancedStars = baseStars.map(star => ({
            ...star,
            brightness: star.brightness * (0.7 + constellation.magicalIntensity * 0.1),
            size: star.size * (0.8 + constellation.magicalIntensity * 0.05),
            magicalGlow: constellation.magicalIntensity > 3
        }));
        
        return enhancedStars;
    }
    
    generateConstellationStarPattern(constellation) {
        // Generate stars based on constellation name and shape
        switch (constellation.name) {
            case "The Centaur":
                return this.generateCentaurStars(constellation.position);
            case "The Mask and Mirror":
            case "Twin Reflections":
                return this.generateMaskMirrorStars(constellation.position);
            case "The Spider":
            case "The Great Weaver":
                return this.generateSpiderStars(constellation.position);
            case "The Blooming Fang":
            case "Treacherous Beauty":
                return this.generateBloomingFangStars(constellation.position);
            case "The Lily":
            case "Pure Renewal":
                return this.generateLilyStars(constellation.position);
            case "The Swan (Upper)":
            case "Ascending Grace":
                return this.generateSwanUpperStars(constellation.position);
            case "The Swan (Lower)":
            case "Resting Grace":
                return this.generateSwanLowerStars(constellation.position);
            case "The Lantern Bearer":
            case "Hope's Light":
                return this.generateLanternBearerStars(constellation.position);
            case "The Silent Step":
            case "Hunter's Trail":
                return this.generateSilentStepStars(constellation.position);
            case "The Flying Mantis":
            case "Patient Hunter":
                return this.generateFlyingMantisStars(constellation.position);
            case "The Inverted Crown":
            case "Fallen Majesty":
                return this.generateInvertedCrownStars(constellation.position);
            case "The Heartroot":
            case "Memory's Anchor":
                return this.generateHeartrootStars(constellation.position);
            case "The Chalice":
            case "Sacred Vessel":
                return this.generateChaliceStars(constellation.position);
            case "The Mourning Tree":
            case "Sorrow's Sentinel":
                return this.generateMourningTreeStars(constellation.position);
            case "The Driftcloak":
            case "Wanderer's Mantle":
                return this.generateDriftcloakStars(constellation.position);
            case "The Shattered Path":
            case "Broken Road":
                return this.generateShatteredPathStars(constellation.position);
            case "The Sibling Moons":
            case "Twin Destinies":
                return this.generateSiblingMoonsStars(constellation.position);
            case "The Mask Twins":
            case "Truth and Lies":
                return this.generateMaskTwinsStars(constellation.position);
            case "The Dreaming Head":
            case "Prophet's Vision":
                return this.generateDreamingHeadStars(constellation.position);
            case "The Antler Tree":
            case "Season's Crown":
                return this.generateAntlerTreeStars(constellation.position);
            default:
                return this.generateGenericConstellationStars(constellation.position);
        }
    }