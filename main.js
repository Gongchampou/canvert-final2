import { CardGenerationService } from './lib/supabase.js'

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer')
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div')
        toast.className = `toast ${type}`
        toast.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${this.getIcon(type)}
            </svg>
            <span>${message}</span>
        `
        
        this.container.appendChild(toast)
        
        setTimeout(() => {
            toast.style.animation = 'slideInDown 0.3s ease reverse'
            setTimeout(() => {
                if (this.container.contains(toast)) {
                    this.container.removeChild(toast)
                }
            }, 300)
        }, duration)
    }

    getIcon(type) {
        switch(type) {
            case 'success': return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>'
            case 'error': return '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
            default: return '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
        }
    }
}

// Video converter functionality with backend integration
class VideoCardConverter {
    constructor() {
        this.toast = new ToastManager()
        this.currentGeneration = null
        this.initializeElements()
        this.bindEvents()
        this.initializeTheme()
        this.updateValidation()
    }

    initializeElements() {
        this.videoLinksEl = document.getElementById('videoLinks')
        this.imageLinksEl = document.getElementById('imageLinks')
        this.titlesEl = document.getElementById('titles')
        this.descriptionsEl = document.getElementById('descriptions')
        this.videoTypeEl = document.getElementById('videoType')
        this.imageTypeEl = document.getElementById('imageType')
        this.generateBtn = document.getElementById('generateBtn')
        this.copyBtn = document.getElementById('copyBtn')
        this.codeOutput = document.getElementById('codeOutput')
        this.previewContainer = document.getElementById('previewContainer')
        this.cornerIcon = document.getElementById('cornerIcon')
        this.loadingIndicator = document.getElementById('loadingIndicator')
        
        // Modal elements
        this.historyBtn = document.getElementById('historyBtn')
        this.searchBtn = document.getElementById('searchBtn')
        this.historyModal = document.getElementById('historyModal')
        this.searchModal = document.getElementById('searchModal')
        this.closeHistoryModal = document.getElementById('closeHistoryModal')
        this.closeSearchModal = document.getElementById('closeSearchModal')
        this.historyList = document.getElementById('historyList')
        this.searchInput = document.getElementById('searchInput')
        this.performSearch = document.getElementById('performSearch')
        this.searchResults = document.getElementById('searchResults')
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateCards())
        this.copyBtn.addEventListener('click', () => this.copyToClipboard())
        this.cornerIcon.addEventListener('click', () => this.toggleTheme())
        
        // Modal events
        this.historyBtn.addEventListener('click', () => this.openHistoryModal())
        this.searchBtn.addEventListener('click', () => this.openSearchModal())
        this.closeHistoryModal.addEventListener('click', () => this.closeModal(this.historyModal))
        this.closeSearchModal.addEventListener('click', () => this.closeModal(this.searchModal))
        this.performSearch.addEventListener('click', () => this.performSearchAction())
        
        // Search on Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearchAction()
            }
        })
        
        // Close modal when clicking outside
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) this.closeModal(this.historyModal)
        })
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) this.closeModal(this.searchModal)
        })
        
        // Input validation events
        this.videoLinksEl.addEventListener('input', () => this.onInputChange())
        this.imageLinksEl.addEventListener('input', () => this.onInputChange())
        this.titlesEl.addEventListener('input', () => this.onInputChange())
        this.descriptionsEl.addEventListener('input', () => this.onInputChange())
        this.videoTypeEl.addEventListener('change', () => this.onInputChange())
        this.imageTypeEl.addEventListener('change', () => this.onInputChange())
    }

    onInputChange() {
        this.resetButtons()
        this.updateValidation()
    }

    resetButtons() {
        this.copyBtn.classList.remove('copied')
        this.copyBtn.textContent = 'Copy HTML'
        this.currentGeneration = null
    }

    showLoading(show = true) {
        this.loadingIndicator.classList.toggle('hidden', !show)
    }

    // Google Drive ID extraction
    extractGoogleDriveId(url) {
        const patterns = [
            /drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
            /drive\.google\.com\/open\?id=([a-zA-Z0-9-_]+)/,
            /[?&]id=([a-zA-Z0-9-_]+)/,
            /^([a-zA-Z0-9-_]{25,})$/
        ]
        
        for (let pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    convertGoogleDriveVideoToPreview(url) {
        const id = this.extractGoogleDriveId(url)
        return id ? `https://drive.google.com/file/d/${id}/preview` : url
    }

    convertGoogleDriveImageToThumbnail(url) {
        const id = this.extractGoogleDriveId(url)
        return id ? `https://drive.google.com/thumbnail?id=${id}` : url
    }

    // YouTube extraction
    extractYouTubeId(url) {
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)/,
            /youtu\.be\/([a-zA-Z0-9-_]+)/,
            /youtube\.com\/embed\/([a-zA-Z0-9-_]+)/
        ]
        
        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    convertYouTubeLink(url) {
        const id = this.extractYouTubeId(url)
        return id ? `https://www.youtube.com/embed/${id}?showinfo=0` : url
    }

    // Validation functions
    updateValidation(options = {}) {
        const { shakeOnEmpty = false } = options
        
        // Always-required fields
        const requiredFields = [this.videoLinksEl, this.titlesEl, this.descriptionsEl]
        requiredFields.forEach(el => {
            const empty = el.value.trim().length === 0
            el.classList.toggle('invalid', empty)
            if (shakeOnEmpty && empty) this.shakeElement(el)
        })

        // Conditionally require image link based on Image Type selection
        const imageType = this.imageTypeEl.value
        const needImage = (imageType === 'googledrive' || imageType === 'google')
        const imageEmpty = this.imageLinksEl.value.trim().length === 0
        
        this.imageLinksEl.classList.toggle('invalid', needImage && imageEmpty)
        if (shakeOnEmpty && needImage && imageEmpty) {
            this.shakeElement(this.imageLinksEl)
        }
    }

    shakeElement(element) {
        element.classList.remove('shake')
        // Force reflow to restart animation
        void element.offsetWidth
        element.classList.add('shake')
    }

    generateCards() {
        const videoType = this.videoTypeEl.value
        const imageType = this.imageTypeEl.value

        // Clear previous output
        this.codeOutput.textContent = ''
        this.previewContainer.innerHTML = ''
        this.resetButtons()

        // Check if required fields are empty
        const videoLinks = this.videoLinksEl.value.trim()
        const titles = this.titlesEl.value.trim()
        const descriptions = this.descriptionsEl.value.trim()
        const imageLinks = this.imageLinksEl.value.trim()

        const requiredEmpty = (
            !videoLinks ||
            !titles ||
            !descriptions ||
            ((imageType === 'googledrive' || imageType === 'google') && !imageLinks)
        )

        if (requiredEmpty) {
            this.updateValidation({ shakeOnEmpty: true })
            this.toast.show('Please fill in all required fields', 'error')
            return
        }

        // Process input data
        const videoLinksArray = videoLinks.split('\n').map(l => l.trim()).filter(l => l)
        const imageLinksArray = imageLinks.split('\n').map(l => l.trim())
        const titlesArray = titles.split('\n').map(l => l.trim())
        const descriptionsArray = descriptions.split('\n').map(l => l.trim())

        let htmlOutput = ''
        let previewHTML = ''

        for (let i = 0; i < videoLinksArray.length; i++) {
            const videoLink = videoLinksArray[i]
            let imageLink = (imageLinksArray[i] || '').trim()
            let processedVideoLink = videoLink

            // Process video link based on type
            if (videoType === 'youtube') {
                processedVideoLink = this.convertYouTubeLink(videoLink)
            } else if (videoType === 'googledrive') {
                processedVideoLink = this.convertGoogleDriveVideoToPreview(videoLink)
            }

            // Handle image link
            if (!imageLink && imageType === 'youtube') {
                const ytId = this.extractYouTubeId(videoLink)
                if (ytId) {
                    imageLink = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                }
            }

            if (imageLink && imageType === 'googledrive') {
                imageLink = this.convertGoogleDriveImageToThumbnail(imageLink)
            }

            // Generate card HTML
            const cardHTML = `<div class="card" data-video="${processedVideoLink}">
    <img class="thumb" alt="${titlesArray[i] || ''}" src="${imageLink}" />
    <div class="card-title">
        <p style="text-align:center; margin:0; padding:0;">${titlesArray[i] || ''}</p>
    </div>
    <div style="color:#23cbe4; padding:0; margin:0; text-align:center;" class="card-body">
        <strong>${descriptionsArray[i] || ''}</strong>
    </div>
</div>
<!-- Card ${i + 1} -->

`

            htmlOutput += cardHTML
            previewHTML += cardHTML
        }

        // Update output and preview
        this.codeOutput.textContent = htmlOutput.trim()
        this.previewContainer.innerHTML = previewHTML

        // Store current generation data for saving
        this.currentGeneration = {
            videoType,
            imageType,
            videoLinks: videoLinksArray,
            imageLinks: imageLinksArray,
            titles: titlesArray,
            descriptions: descriptionsArray,
            generatedHtml: htmlOutput.trim()
        }

        // Auto-save the generation
        this.saveGeneration()
        
        // Add click handlers to preview cards
        this.addPreviewCardHandlers()
        
        this.toast.show('HTML cards generated successfully!', 'success')
    }

    async saveGeneration() {
        if (!this.currentGeneration) {
            this.toast.show('No generation data available to save.', 'error')
            return
        }

        try {
            this.showLoading(true)
            await CardGenerationService.saveGeneration(this.currentGeneration)
            this.toast.show('Generation auto-saved successfully!', 'success')
        } catch (error) {
            console.error('Error saving generation:', error)
            this.toast.show('Failed to save generation', 'error')
        } finally {
            this.showLoading(false)
        }
    }

    addPreviewCardHandlers() {
        const cards = this.previewContainer.querySelectorAll('.card')
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const videoUrl = card.getAttribute('data-video')
                if (videoUrl) {
                    window.open(videoUrl, '_blank')
                }
            })
        })
    }

    async copyToClipboard() {
        const textToCopy = this.codeOutput.textContent;

        if (!textToCopy || textToCopy.includes('to see output here...')) {
            this.toast.show('Nothing to copy', 'info');
            return;
        }

        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                this.handleCopySuccess();
                return;
            } catch (err) {
                console.warn('Modern clipboard API failed, trying fallback:', err);
                // Fallthrough to the legacy method if it fails
            }
        }

        // Fallback for older browsers or restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        
        // Make it invisible and non-disruptive
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.handleCopySuccess();
            } else {
                throw new Error('document.execCommand was not successful');
            }
        } catch (err) {
            console.error('Fallback clipboard method failed:', err);
            this.toast.show('Failed to copy HTML code', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    handleCopySuccess() {
        this.copyBtn.classList.add('copied');
        this.copyBtn.textContent = 'Copied!';
        this.toast.show('HTML code copied to clipboard!', 'success');

        // Reset after 2 seconds
        setTimeout(() => {
            this.copyBtn.classList.remove('copied');
            this.copyBtn.textContent = 'Copy HTML';
        }, 2000);
    }

    // Modal management
    async openHistoryModal() {
        try {
            this.showLoading(true)
            const generations = await CardGenerationService.getRecentGenerations(20)
            this.renderHistory(generations)
            this.historyModal.classList.remove('hidden')
        } catch (error) {
            console.error('Error loading history:', error)
            this.toast.show('Failed to load history', 'error')
        } finally {
            this.showLoading(false)
        }
    }

    openSearchModal() {
        this.searchModal.classList.remove('hidden')
        this.searchInput.focus()
    }

    closeModal(modal) {
        modal.classList.add('hidden')
    }

    async performSearchAction() {
        const query = this.searchInput.value.trim()
        if (!query) {
            this.toast.show('Please enter a search term', 'error')
            return
        }

        try {
            this.showLoading(true)
            const results = await CardGenerationService.searchGenerations(query, 20)
            this.renderSearchResults(results)
        } catch (error) {
            console.error('Error searching generations:', error)
            this.toast.show('Failed to search generations', 'error')
        } finally {
            this.showLoading(false)
        }
    }

    renderHistory(generations) {
        this.historyList.innerHTML = ''
        
        if (generations.length === 0) {
            this.historyList.innerHTML = '<p style="text-align: center; color: var(--muted);">No generations found</p>'
            return
        }

        generations.forEach(generation => {
            const item = this.createHistoryItem(generation)
            this.historyList.appendChild(item)
        })
    }

    renderSearchResults(results) {
        this.searchResults.innerHTML = ''
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<p style="text-align: center; color: var(--muted);">No results found</p>'
            return
        }

        results.forEach(result => {
            const item = this.createHistoryItem(result)
            this.searchResults.appendChild(item)
        })
    }

    createHistoryItem(generation) {
        const item = document.createElement('div')
        item.className = 'history-item'
        
        const date = new Date(generation.created_at).toLocaleString()
        const titles = Array.isArray(generation.titles) ? generation.titles : JSON.parse(generation.titles)
        const descriptions = Array.isArray(generation.descriptions) ? generation.descriptions : JSON.parse(generation.descriptions)
        
        const preview = titles.slice(0, 2).join(', ') + (titles.length > 2 ? '...' : '')
        
        item.innerHTML = `
            <div class="history-item-header">
                <div class="history-item-types">
                    <span class="type-badge">${generation.video_type}</span>
                    <span class="type-badge">${generation.image_type}</span>
                </div>
                <div class="history-item-date">${date}</div>
            </div>
            <div class="history-item-content">
                <strong>Titles:</strong> ${preview}<br>
                <strong>Cards:</strong> ${titles.length} items
            </div>
        `
        
        item.addEventListener('click', () => {
            this.loadGeneration(generation)
            this.closeModal(this.historyModal)
            this.closeModal(this.searchModal)
        })
        
        return item
    }

    loadGeneration(generation) {
        try {
            const videoLinks = Array.isArray(generation.video_links) ? generation.video_links : JSON.parse(generation.video_links)
            const imageLinks = Array.isArray(generation.image_links) ? generation.image_links : JSON.parse(generation.image_links || '[]')
            const titles = Array.isArray(generation.titles) ? generation.titles : JSON.parse(generation.titles)
            const descriptions = Array.isArray(generation.descriptions) ? generation.descriptions : JSON.parse(generation.descriptions)
            
            // Populate form fields
            this.videoTypeEl.value = generation.video_type
            this.imageTypeEl.value = generation.image_type
            this.videoLinksEl.value = videoLinks.join('\n')
            this.imageLinksEl.value = imageLinks.join('\n')
            this.titlesEl.value = titles.join('\n')
            this.descriptionsEl.value = descriptions.join('\n')
            
            // Display generated HTML
            this.codeOutput.textContent = generation.generated_html
            
            // Generate preview
            this.previewContainer.innerHTML = generation.generated_html
            this.addPreviewCardHandlers()
            
            // Update current generation
            this.currentGeneration = {
                videoType: generation.video_type,
                imageType: generation.image_type,
                videoLinks,
                imageLinks,
                titles,
                descriptions,
                generatedHtml: generation.generated_html
            }
            
            this.toast.show('Generation loaded successfully!', 'success')
        } catch (error) {
            console.error('Error loading generation:', error)
            this.toast.show('Failed to load generation', 'error')
        }
    }

    // Theme management
    initializeTheme() {
        const savedTheme = localStorage.getItem('video_converter_theme') || 'dark'
        this.setTheme(savedTheme)
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('light') ? 'light' : 'dark'
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        this.setTheme(newTheme)
    }

    setTheme(theme) {
        const isLight = theme === 'light'
        document.body.classList.toggle('light', isLight)
        
        this.cornerIcon.setAttribute('aria-pressed', isLight ? 'true' : 'false')
        this.cornerIcon.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode')
        
        // Visual feedback
        this.cornerIcon.style.transform = 'scale(1.1) rotate(10deg)'
        setTimeout(() => {
            this.cornerIcon.style.transform = ''
        }, 200)
        
        localStorage.setItem('video_converter_theme', theme)
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new VideoCardConverter()
})
