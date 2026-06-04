(function() {
    'use strict';

    // State
    let selectedFaceId = null;
    let selectedPartId = null;
    let currentSelection = null;
    let selectedSelections = [];
    let selectionRequestCounter = 0;
    let isWaitingForSelection = false;

    // DOM elements
    const instruction = document.getElementById('instruction');
    const buttonGroup = document.getElementById('buttonGroup');
    const sendBtn = document.getElementById('sendToBionicsCAM'); // Optional now
    const selectAnotherBtn = document.getElementById('selectAnotherFace');
    const multilayerCheckbox = document.getElementById('multilayerMode');
    const mode2DLabel = document.getElementById('mode2DLabel');
    const mode25DLabel = document.getElementById('mode25DLabel');
    const modeHint = document.getElementById('modeHint');
    const multiPartGroup = document.getElementById('multiPartGroup');
    const importAllPartsBtn = document.getElementById('importAllParts');

    // Onshape context from template
    const context = window.ONSHAPE_CONTEXT;

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
            entityTypeSpecifier: ['FACE'],
            bodyTypeSpecifier: ['SOLID'],
            requiredSelectionCount: 1
        };

        window.parent.postMessage(selectionMessage, '*');
        console.log('Requested face selection:', selectionMessage);
    }

    function initialize() {
        console.log('BionicsCAM panel initializing...', context);

        const initMessage = {
            messageName: 'applicationInit',
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId
        };

        window.parent.postMessage(initMessage, '*');
        console.log('Sent applicationInit:', initMessage);

        window.addEventListener('message', handleMessage);

        requestFaceSelection();

        // Send button is optional now because it was removed from the HTML
        if (sendBtn) {
            sendBtn.addEventListener('click', handleSendToBionicsCAM);
        }

        if (selectAnotherBtn) {
            selectAnotherBtn.addEventListener('click', handleSelectAnother);
        }

        if (importAllPartsBtn) {
            importAllPartsBtn.addEventListener('click', handleImportAllParts);
        }

        if (multilayerCheckbox) {
            multilayerCheckbox.addEventListener('change', updateModeInstructions);
        }

        updateModeInstructions();
    }

    function updateModeInstructions() {
        const isMultilayer = multilayerCheckbox && multilayerCheckbox.checked;

        if (isMultilayer) {
            mode2DLabel.classList.remove('active');
            mode25DLabel.classList.add('active');
            modeHint.textContent = 'Stock thickness must match CAD part thickness';

            if (multiPartGroup) {
                multiPartGroup.style.display = 'flex';
            }

            if (importAllPartsBtn) {
                importAllPartsBtn.textContent = '⬆ Import selected part(s) as 2.5D';
            }

            if (!selectedFaceId && instruction.style.display !== 'none') {
                instruction.innerHTML = 'Select a face at the <strong>top-most layer</strong> to manufacture, then import the selected part(s)';
                instruction.style.color = '';
            }
        } else {
            mode2DLabel.classList.add('active');
            mode25DLabel.classList.remove('active');
            modeHint.textContent = 'Any stock thickness works - cutting a flat pattern only';

            if (multiPartGroup) {
                multiPartGroup.style.display = 'flex';
            }

            if (importAllPartsBtn) {
                importAllPartsBtn.textContent = '⬆ Import selected part(s) as 2D';
            }

            if (!selectedFaceId && instruction.style.display !== 'none') {
                instruction.innerHTML = 'Select the <strong>top face</strong> to manufacture, then import the selected part(s)';
                instruction.style.color = '';
            }
        }
    }

    function handleMessage(event) {
        if (!event.origin.includes('onshape.com')) {
            console.warn('Message from invalid origin:', event.origin);
            return;
        }

        const data = event.data;
        console.log('Received message:', data);

        if (data.messageName === 'REQUESTED_SELECTION') {
            handleRequestedSelection(data);
        } else if (data.messageName === 'SELECTION') {
            handleGenericSelection(data);
        }
    }

    function extractFaceSelections(selections) {
        return (selections || []).filter(sel => {
            const entityType = String(sel.entityType || sel.selectionType || '').toUpperCase();
            const id = sel.selectionId || sel.faceId || sel.id;
            return !!id && (entityType.includes('FACE') || entityType.includes('ENTITY') || !entityType);
        });
    }

    // Onshape body IDs are short (≤4 chars, e.g. "JjG").
    // Face IDs are long deterministic strings. Use length to tell them apart.
    function isFaceSelection(sel) {
        const entityType = String(sel.entityType || sel.selectionType || '').toUpperCase();
        return entityType.includes('FACE') || entityType.includes('ENTITY') || !entityType;
    }

    function extractPartId(sel) {
        if (sel.partId) return sel.partId;
        if (sel.bodyId) return sel.bodyId;
        if (sel.deterministicId && !isFaceSelection(sel)) return sel.deterministicId;
        if (sel.part && sel.part.partId) return sel.part.partId;
        if (sel.part && sel.part.bodyId) return sel.part.bodyId;
        if (sel.body && sel.body.id) return sel.body.id;
        if (sel.body && sel.body.bodyId) return sel.body.bodyId;
        return null;
    }

    function extractFaceId(sel) {
        if (sel.faceId) return sel.faceId;
        if (sel.entityId && isFaceSelection(sel)) return sel.entityId;
        // Onshape can send face selection IDs as short tokens like JPK/JjG.
        // Do NOT reject them just because they are short; that was the bug
        // that made multi-import arrive at the backend with zero face IDs.
        const id = sel.selectionId || sel.id || sel.deterministicId || '';
        if (id && isFaceSelection(sel)) return id;
        return null;
    }

    function setCurrentSelections(selections) {
        const faceSelections = extractFaceSelections(selections);

        if (!faceSelections.length) {
            return false;
        }

        selectedSelections = faceSelections;

        const first = faceSelections[0];
        // Log the raw selection so we can see exactly what Onshape sends
        console.log('Raw first selection object:', JSON.stringify(first));

        selectedFaceId = extractFaceId(first);
        selectedPartId = extractPartId(first);
        currentSelection = first;
        isWaitingForSelection = false;

        const countText = faceSelections.length === 1 ? '1 face' : `${faceSelections.length} faces`;

        instruction.innerHTML =
            `✓ Onshape selection detected: <strong>${countText}</strong>` +
            (selectedFaceId ? ` <span style="opacity:.75">(${selectedFaceId})</span>` : '');

        instruction.style.color = '#27ae60';
        instruction.style.display = 'block';

        if (buttonGroup) {
            buttonGroup.style.display = 'flex';
        }

        if (sendBtn) {
            sendBtn.disabled = !selectedFaceId;
        }

        updateModeInstructions();

        console.log('✓ Face selection list:', selectedSelections);
        return true;
    }

    function getSelectedFaceIds() {
        const ids = [];
        for (const sel of selectedSelections) {
            const faceId = extractFaceId(sel);
            const partId = extractPartId(sel);
            // If we have a real face ID, use it. Otherwise send body:XYZ so
            // the server knows to resolve the top face for that body.
            const id = faceId || (partId ? 'body:' + partId : null);
            if (id && !ids.includes(id)) ids.push(id);
        }
        return ids;
    }

    function getSelectedPartIds() {
        const ids = [];
        for (const sel of selectedSelections) {
            const id = extractPartId(sel);
            if (id && !ids.includes(id)) ids.push(id);
        }
        return ids;
    }

    function handleGenericSelection(data) {
        const selections = data.selections || [];

        if (selections.length > 0) {
            setCurrentSelections(selections);
        } else if (isWaitingForSelection && selections.length === 0) {
            console.log('Selection request timed out, re-requesting...');
            requestFaceSelection();
        } else if (!isWaitingForSelection && currentSelection) {
            console.log('User changed selection, requesting new face selection...');

            selectedFaceId = null;
            selectedPartId = null;
            currentSelection = null;
            selectedSelections = [];

            if (buttonGroup) {
                buttonGroup.style.display = 'none';
            }

            if (sendBtn) {
                sendBtn.disabled = true;
            }

            requestFaceSelection();
        }
    }

    function handleRequestedSelection(data) {
        const selections = data.selections || [];
        const status = data.status || {};

        console.log('Requested selection response:', selections, 'Status:', status);

        if (status.statusCode === 'SUCCESS' && selections.length > 0) {
            setCurrentSelections(selections);
        } else if (status.statusCode === 'PENDING') {
            instruction.innerHTML = 'Select a face to manufacture';
            instruction.style.color = '';
            instruction.style.display = 'block';

            if (buttonGroup) {
                buttonGroup.style.display = 'none';
            }

            if (sendBtn) {
                sendBtn.disabled = true;
            }
        }
    }

    function buildUrl(endpoint) {
        const params = new URLSearchParams({
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId,
            server: context.server
        });

        if (selectedFaceId) {
            params.append('faceId', selectedFaceId);
        }

        if (selectedPartId) {
            params.append('partId', selectedPartId);
        }

        const isMultilayer = multilayerCheckbox && multilayerCheckbox.checked;
        params.append('multilayer', isMultilayer ? 'true' : 'false');

        return `${context.baseUrl}${endpoint}?${params.toString()}`;
    }

    function handleSendToBionicsCAM() {
        const url = buildUrl('/onshape/import');

        console.log('Opening BionicsCAM:', url);

        window.open(url, '_blank');

        requestFaceSelection();
    }

    function handleImportAllParts() {
        const isMultilayer = multilayerCheckbox && multilayerCheckbox.checked;
        const selectedFaceIds = getSelectedFaceIds();

        if (!selectedFaceIds.length) {
            instruction.innerHTML = 'Select one or more faces first, then import the selected part(s).';
            instruction.style.color = '#b45309';
            instruction.style.display = 'block';
            return;
        }

        const selectedPartIds = getSelectedPartIds();
        const params = new URLSearchParams({
            documentId: context.documentId,
            workspaceId: context.workspaceId,
            elementId: context.elementId,
            server: context.server || 'https://cad.onshape.com',
            multilayer: isMultilayer ? 'true' : 'false',
            multi: 'true',
            selectedOnly: 'true',
            faceIds: selectedFaceIds.join(','),
            rawSelections: JSON.stringify(selectedSelections || [])
        });
        // Also send body IDs so server can resolve face when only body ID is known
        if (selectedPartIds.length) {
            params.append('partIds', selectedPartIds.join(','));
        }

        const url = `${context.baseUrl}/onshape/import?${params.toString()}`;

        console.log('Opening BionicsCAM multi-part import:', url, 'selectedFaceIds=', selectedFaceIds, 'partIds=', selectedPartIds);

        window.open(url, '_blank');
    }

    function handleSelectAnother() {
        console.log('User requested to select another face');

        selectedFaceId = null;
        selectedPartId = null;
        currentSelection = null;
        selectedSelections = [];

        if (buttonGroup) {
            buttonGroup.style.display = 'none';
        }

        if (sendBtn) {
            sendBtn.disabled = true;
        }

        requestFaceSelection();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
