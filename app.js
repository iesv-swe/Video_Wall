/*
  THE APP LOGIC
  1. Checks which device this is (?device=1, etc.)
  2. Reads content.json
  3. Displays the correct content
*/

window.onload = function() {

    // 1. Define our screen elements
    const allWrappers = {
        stretch: document.getElementById('stretch-wrapper'),
        slide: document.getElementById('slide-wrapper'),
        text: document.getElementById('text-wrapper'),
        video: document.getElementById('video-wrapper'),
        error: document.getElementById('error-wrapper')
    };

    // 2. Figure out which screen this is
    const params = new URLSearchParams(window.location.search);
    const deviceId = params.get('device'); // '1', '2', '3', or '4'

    // 3. Load the Content Menu
    fetch('content.json')
        .then(response => response.json())
        .then(config => {
            if (config.mode === 'stretch') {
                showStretchMode(config.stretch_content, deviceId);
            } else {
                const content = config.individual_content['device-' + deviceId];
                showIndividualMode(content);
            }
        })
        .catch(err => showError('Configuration Error', 'Could not load content.json.'));

    // --- HELPER FUNCTIONS ---

    function showStretchMode(content, deviceId) {
        let element;
        if (content.type === 'google_slide') {
            element = document.createElement('iframe');
            element.src = content.url;
        } else if (content.type === 'video') {
            element = document.createElement('video');
            element.src = content.url;
            element.autoplay = true; element.muted = true; element.loop = true;
        }
        
        // Pan to the correct quadrant
        const offsets = {
            '1': 'translate(0, 0)',         // Top-Left
            '2': 'translate(-50%, 0)',      // Top-Right
            '3': 'translate(0, -50%)',      // Bottom-Left
            '4': 'translate(-50%, -50%)'    // Bottom-Right
        };

        if (element && offsets[deviceId]) {
            element.style.transform = offsets[deviceId];
            showWrapper('stretch');
            allWrappers.stretch.innerHTML = ''; // Clear old
            allWrappers.stretch.appendChild(element);
        }
    }

    function showIndividualMode(content) {
        if (!content) return showError('Setup Error', `No content found for Device ${deviceId}`);

        if (content.type === 'google_slide') {
            const iframe = document.createElement('iframe');
            iframe.src = content.url;
            allWrappers.slide.innerHTML = ''; 
            allWrappers.slide.appendChild(iframe);
            showWrapper('slide');
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
        for (let key in allWrappers) {
            allWrappers[key].style.display = (key === activeKey) ? (key === 'text' || key === 'error' ? 'flex' : 'block') : 'none';
        }
    }
};
