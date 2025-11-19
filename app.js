/*
==================================================================================
  THE APP LOGIC (The Brain)
  This file handles the logic and is set up for the temporary one-OU mode.
  It includes the screen flip correction for screens 1 and 2.
==================================================================================
*/
window.onload = function() {

    // 1. Define all our elements (placeholders from index.html)
    const allWrappers = {
        stretch: document.getElementById('stretch-wrapper'), slide: document.getElementById('slide-wrapper'),
        text: document.getElementById('text-wrapper'), video: document.getElementById('video-wrapper'),
        error: document.getElementById('error-wrapper'), setup: document.getElementById('setup-wrapper')
    };

    const params = new URLSearchParams(window.location.search);
    let deviceId = params.get('device');

    // 2. DECISION TIME: Check if the Admin Console gave us an ID
    if (deviceId) {
        // ID found (Future: from child OU URL): skip setup
        loadContent(deviceId);
    } else {
        // NO ID found (Current: single parent OU): show setup buttons
        showSetupScreen();
    }

    // --- CORE LOGIC FUNCTIONS ---

    function loadContent(id) {
        // *** CRITICAL ROTATION CORRECTION: ***
        // If it's screen 1 or 2, we apply the 180-degree flip class to the entire body.
        if (id === '1' || id === '2') {
            document.body.classList.add('flip-180');
        } else {
            document.body.classList.remove('flip-180');
        }

        // Fetch the config (content.json)
        fetch('content.json')
            .then(response => response.json())
            .then(config => {
                if (config.mode === 'stretch') {
                    showStretchMode(config.stretch_content, id);
                } else {
                    const content = config.individual_content['device-' + id];
                    showIndividualMode(content, id);
                }
            })
            .catch(err => showError('Config Error', 'Could not load content.json. Check file syntax.'));
    }

    // --- HELPER FUNCTIONS ---

    function showSetupScreen() {
        // HTML structure for the manual button menu
        const setupDiv = document.createElement('div');
        setupDiv.innerHTML = `<h1 style="color:white; text-align:center;">**SETUP MODE**: Click this screen's position.</h1>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 80vh; padding: 20px;">
                <button onclick="selectDevice('1')" style="font-size:3em; background:#4CAF50; color:white; border:none;">1 (Top-L)</button>
                <button onclick="selectDevice('2')" style="font-size:3em; background:#2196F3; color:white; border:none;">2 (Top-R)</button>
                <button onclick="selectDevice('3')" style="font-size:3em; background:#FF9800; color:white; border:none;">3 (Bot-L)</button>
                <button onclick="selectDevice('4')" style="font-size:3em; background:#9C27B0; color:white; border:none;">4 (Bot-R)</button>
            </div>`;
        
        window.selectDevice = function(id) {
            // Assign ID and load content when a button is clicked
            loadContent(id); 
        };

        showWrapper('setup');
        allWrappers.setup.appendChild(setupDiv);
    }

    function showStretchMode(content, id) {
        let element;
        // Create the element (iframe or video)
        if (content.type === 'google_slide') {
            element = document.createElement('iframe');
            element.src = content.url;
        } else if (content.type === 'video') {
            element = document.createElement('video');
            element.src = content.url;
            element.autoplay = true; element.muted = true; element.loop = true;
        }
        element.className = 'stretched-element'; // Add the class for 200% size

        // Pan to the correct quadrant using CSS translate
        const offsets = {
            '1': 'translate(0, 0)', '2': 'translate(-50%, 0)', 
            '3': 'translate(0, -50%)', '4': 'translate(-50%, -50%)'
        };

        if (element && offsets[id]) {
            element.style.transform = offsets[id];
            showWrapper('stretch');
            allWrappers.stretch.innerHTML = ''; 
            allWrappers.stretch.appendChild(element);
        }
    }

    function showIndividualMode(content, id) {
        if (!content) return showError('Config Error', `No content for Device ${id}`);

        if (content.type === 'google_slide') {
            const iframe = document.createElement('iframe');
            iframe.src = content.url;
            allWrappers.slide.innerHTML = ''; allWrappers.slide.appendChild(iframe); showWrapper('slide');
        } else if (content.type === 'text') {
            document.getElementById('text-headline').textContent = content.headline;
            document.getElementById('text-body').textContent = content.body;
            showWrapper('text');
        } else if (content.type === 'video') {
            document.getElementById('kiosk-video').src = content.url;
            showWrapper('video');
        }
    }

    function showError(head, body) {
        document.getElementById('error-headline').textContent = head;
        document.getElementById('error-body').textContent = body;
        showWrapper('error');
    }

    function showWrapper(activeKey) {
        // This helper function toggles visibility for the correct content box
        for (let key in allWrappers) {
            if(allWrappers[key]) {
                allWrappers[key].style.display = (key === activeKey) ? (key === 'text' || key === 'error' || key === 'setup' ? 'flex' : 'block') : 'none';
            }
        }
    }
};
