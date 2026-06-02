(function() {
    'use strict';

    // State
    let selectedFaceId = null;
    let selectedPartId = null;
    let currentSelection = null;  // Full selection object for highlighting
    let selectedSelections = [];   // All selected face selections for selected-parts import
    let selectionRequestCounter = 0;
    let isWaitingForSelection = false;

    // DOM elements
    const instruction = document.getElementById('instruction');
    const buttonGroup = document.getElementById('buttonGroup');
    const sendBtn = document.getElementById('sendToBionicsCAM');
    const selectAnotherBtn = document.getElementById('selectAnotherFace');
    const multilayerCheckbox = document.getElementById('multilayerMode');
    const mode2DLabel = document.getElementById('mode2DLabel');
    const mode25DLabel = document.getElementById('mode25DLabel');
    const modeHint = document.getElementById('modeHint');
    const multiPartGroup = document.getElementById('multiPartGroup');
    const importAllPartsBtn = document.getElementById('importAllParts');

    // Onshape context from template
    const context = window.ONSHAPE_CONTEXT;

    /**
     * Request a face selection from Onshape
     * This is called on initialization and after "Send to BionicsCAM"
     */
    function requestFaceSelection() {
        selectionRequestCounter++;
        isWaitingForSelection = true;
        const selectionMessage = {
            messageName: 'requestSelection',
            messageId: 'bionicscam-selection-' + selectionRequestCounter,
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId,
            filterType: 'simple',
            entityTypeSpecifier: ['FACE'],      // Only faces
            bodyTypeSpecifier: ['SOLID'],       // Only from solid bodies (not drawings)
            // Let Onshape return whatever face selection the user currently has.
            // Single selected face still works; multiple selected faces can be imported together.
            requiredSelectionCount: 1
        };
        window.parent.postMessage(selectionMessage, '*');
        console.log('Requested face selection:', selectionMessage);
    }

    /**
     * Initialize the extension
     * Send applicationInit message to Onshape
     */
    function initialize() {
        console.log('BionicsCAM panel initializing...', context);

        // Send initialization message to Onshape
        const initMessage = {
            messageName: 'applicationInit',
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId
        };

        window.parent.postMessage(initMessage, '*');
        console.log('Sent applicationInit:', initMessage);

        // Listen for messages from Onshape
        window.addEventListener('message', handleMessage);

        // Request initial face selection
        // This will be called again after each successful selection
        requestFaceSelection();

        // Set up button handlers
        sendBtn.addEventListener('click', handleSendToBionicsCAM);
        selectAnotherBtn.addEventListener('click', handleSelectAnother);
        if (importAllPartsBtn) {
            importAllPartsBtn.addEventListener('click', handleImportAllParts);
        }

        // Set up mode checkbox handler
        multilayerCheckbox.addEventListener('change', updateModeInstructions);

        // Initialize mode instructions
        updateModeInstructions();
    }

    /**
     * Update instruction text based on multilayer mode
     */
    function updateModeInstructions() {
        const isMultilayer = multilayerCheckbox.checked;

        if (isMultilayer) {
            // 2.5D mode - stock must match CAD
            mode2DLabel.classList.remove('active');
            mode25DLabel.classList.add('active');
            modeHint.textContent = 'Stock thickness must match CAD part thickness';

            // Allow a fast all-parts import. This does not fetch authenticated
            // data inside the iframe; it opens the normal BionicsCAM import
            // route with multi=true so the backend does the Onshape API work.
            if (multiPartGroup) {
                multiPartGroup.style.display = 'flex';
            }
            if (importAllPartsBtn) {
                importAllPartsBtn.textContent = getSelectedFaceIds().length >= 1 ? '⬆ Import selected part(s) as 2.5D' : '⬆ Import all parts as 2.5D';
            }

            // Update instruction if no face selected
            if (!selectedFaceId && instruction.style.display !== 'none') {
                instruction.innerHTML = 'Select a face at the <strong>top-most layer</strong> to manufacture, or import all parts';
                instruction.style.color = '';
            }
        } else {
            // 2D mode - any stock works
            mode2DLabel.classList.add('active');
            mode25DLabel.classList.remove('active');
            modeHint.textContent = 'Any stock thickness works - cutting a flat pattern only';

            if (multiPartGroup) {
                multiPartGroup.style.display = 'flex';
            }
            if (importAllPartsBtn) {
                importAllPartsBtn.textContent = getSelectedFaceIds().length >= 1 ? '⬆ Import selected part(s) as 2D' : '⬆ Import all parts as 2D';
            }

            // Update instruction if no face selected
            if (!selectedFaceId && instruction.style.display !== 'none') {
                instruction.innerHTML = 'Select the <strong>top face</strong> to manufacture, or import all parts';
                instruction.style.color = '';
            }
        }
    }

    /**
     * Handle incoming messages from Onshape parent window
     */
    function handleMessage(event) {
        // Validate origin for security
        if (!event.origin.includes('onshape.com')) {
            console.warn('Message from invalid origin:', event.origin);
            return;
        }

        const data = event.data;
        console.log('Received message:', data);

        if (data.messageName === 'REQUESTED_SELECTION') {
            handleRequestedSelection(data);
        } else if (data.messageName === 'SELECTION') {
            // Generic selection messages can indicate timeout
            handleGenericSelection(data);
        }
    }

    /**
     * Extract only face selections from an Onshape selection message.
     */
    function extractFaceSelections(selections) {
        return (selections || []).filter(sel => {
            const entityType = String(sel.entityType || sel.selectionType || '').toUpperCase();
            const id = sel.selectionId || sel.faceId || sel.id;
            return !!id && (entityType.includes('FACE') || entityType.includes('ENTITY') || !entityType);
        });
    }

    /**
     * Save the current Onshape face selection list and refresh the UI.
     */
    function setCurrentSelections(selections) {
        const faceSelections = extractFaceSelections(selections);
        if (!faceSelections.length) {
            return false;
        }

        selectedSelections = faceSelections;
        const first = faceSelections[0];
        selectedFaceId = first.selectionId || first.faceId || first.id || null;
        selectedPartId = first.partId || first.bodyId || null;
        currentSelection = first;
        isWaitingForSelection = false;

        const countText = faceSelections.length === 1 ? '1 face' : `${faceSelections.length} faces`;
        instruction.innerHTML = `✓ Onshape selection detected: <strong>${countText}</strong>` +
            (selectedFaceId ? ` <span style="opacity:.75">(${selectedFaceId})</span>` : '');
        instruction.style.color = '#27ae60';
        instruction.style.display = 'block';
        buttonGroup.style.display = 'flex';
        sendBtn.disabled = !selectedFaceId;

        updateModeInstructions();
        console.log('✓ Face selection list:', selectedSelections);
        return true;
    }

    function getSelectedFaceIds() {
        const ids = [];
        for (const sel of selectedSelections) {
            const id = sel.selectionId || sel.faceId || sel.id;
            if (id && !ids.includes(id)) {
                ids.push(id);
            }
        }
        return ids;
    }

    /**
     * Handle generic SELECTION messages
     */
    function handleGenericSelection(data) {
        const selections = data.selections || [];

        if (selections.length > 0) {
            // User selected one or more faces. Keep the whole selection list so
            // Import Selected can import exactly those parts instead of all bodies.
            setCurrentSelections(selections);
        } else if (isWaitingForSelection && selections.length === 0) {
            // Selection request timed out - re-issue it
            console.log('Selection request timed out, re-requesting...');
            requestFaceSelection();
        } else if (!isWaitingForSelection && currentSelection) {
            // User deselected - clear and re-request
            console.log('User changed selection, requesting new face selection...');
            selectedFaceId = null;
            selectedPartId = null;
            currentSelection = null;
            selectedSelections = [];
            buttonGroup.style.display = 'none';
            sendBtn.disabled = true;
            requestFaceSelection();
        }
    }

    /**
     * Handle requested selection response from Onshape
     */
    function handleRequestedSelection(data) {
        const selections = data.selections || [];
        const status = data.status || {};
        console.log('Requested selection response:', selections, 'Status:', status);

        // Check status code
        if (status.statusCode === 'SUCCESS' && selections.length > 0) {
            // User successfully selected one or more faces.
            setCurrentSelections(selections);
        } else if (status.statusCode === 'PENDING') {
            // Still waiting for selection
            instruction.innerHTML = 'Select a face to manufacture';
            instruction.style.color = '';
            instruction.style.display = 'block';
            buttonGroup.style.display = 'none';
            sendBtn.disabled = true;
        }
    }

    /**
     * Build URL with Onshape context parameters
     */
    function buildUrl(endpoint) {
        const params = new URLSearchParams({
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId,
            server: context.server
        });

        // Add face ID if selected
        if (selectedFaceId) {
            params.append('faceId', selectedFaceId);
        }

        // Add part ID if available
        if (selectedPartId) {
            params.append('partId', selectedPartId);
        }

        // Add multilayer mode
        const isMultilayer = multilayerCheckbox.checked;
        params.append('multilayer', isMultilayer ? 'true' : 'false');

        return `${context.baseUrl}${endpoint}?${params.toString()}`;
    }

    /**
     * Handle "Send to BionicsCAM" button
     * Opens full BionicsCAM interface in new window and requests another selection
     */
    function handleSendToBionicsCAM() {
        const url = buildUrl('/onshape/import');
        console.log('Opening BionicsCAM:', url);

        // Open in new tab (without window features to make it a tab, not popup)
        window.open(url, '_blank');

        // Immediately request another face selection for the next operation
        // This creates a select-then-send workflow
        requestFaceSelection();
    }

    /**
     * Handle "Import all parts" button.
     *
     * Important: this does NOT call an authenticated Onshape API endpoint
     * from inside the iframe. The iframe may not have the same cookie/session
     * behavior as a normal BionicsCAM tab. Instead, it opens the existing
     * /onshape/import backend route with multi=true, and the backend performs
     * the authenticated Onshape API calls from the normal BionicsCAM domain.
     */
    function handleImportAllParts() {
        const isMultilayer = multilayerCheckbox.checked;
        const selectedFaceIds = getSelectedFaceIds();
        const params = new URLSearchParams({
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId,
            server: context.server || 'https://cad.onshape.com',
            multilayer: isMultilayer ? 'true' : 'false',
            multi: 'true'
        });

        // If the user has any face selected, import only selected body/bodies.
        // If no face is selected, fall back to the original all-parts behavior.
        if (selectedFaceIds.length >= 1) {
            params.append('faceIds', selectedFaceIds.join(','));
            params.append('selectedOnly', 'true');
        }

        const url = `${context.baseUrl}/onshape/import?${params.toString()}`;
        console.log('Opening BionicsCAM multi-part import:', url, 'selectedFaceIds=', selectedFaceIds);
        window.open(url, '_blank');
    }

    /**
     * Handle "Select another face" button
     * Clears current selection and requests a new one
     */
    function handleSelectAnother() {
        console.log('User requested to select another face');

        // Clear current selection
        selectedFaceId = null;
        selectedPartId = null;
        currentSelection = null;
        selectedSelections = [];

        // Request a new selection
        requestFaceSelection();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
