// ============================================
// COLLAGE EDITOR - MJart
// ============================================

let currentLayout = 'default';
let selectedImage = null;
let imageCounter = 0;

const layoutConfigs = {
    '2x2': {
        name: '2x2 Grid',
        cells: [
            { x: 0, y: 0, width: 50, height: 50 },
            { x: 50, y: 0, width: 50, height: 50 },
            { x: 0, y: 50, width: 50, height: 50 },
            { x: 50, y: 50, width: 50, height: 50 }
        ]
    },
    '3x2': {
        name: '3x2 Grid',
        cells: [
            { x: 0, y: 0, width: 33.33, height: 50 },
            { x: 33.33, y: 0, width: 33.33, height: 50 },
            { x: 66.66, y: 0, width: 33.34, height: 50 },
            { x: 0, y: 50, width: 33.33, height: 50 },
            { x: 33.33, y: 50, width: 33.33, height: 50 },
            { x: 66.66, y: 50, width: 33.34, height: 50 }
        ]
    },
    '4x4': {
        name: '4x4 Grid',
        cells: Array(16).fill(null).map((_, i) => ({
            x: (i % 4) * 25,
            y: Math.floor(i / 4) * 25,
            width: 25,
            height: 25
        }))
    },
    'vertical': {
        name: 'Vertical Strip',
        cells: [
            { x: 0, y: 0, width: 100, height: 33.33 },
            { x: 0, y: 33.33, width: 100, height: 33.33 },
            { x: 0, y: 66.66, width: 100, height: 33.34 }
        ]
    },
    'horizontal': {
        name: 'Horizontal Strip',
        cells: [
            { x: 0, y: 0, width: 33.33, height: 100 },
            { x: 33.33, y: 0, width: 33.33, height: 100 },
            { x: 66.66, y: 0, width: 33.34, height: 100 }
        ]
    },
    'asymmetric1': {
        name: 'Asymmetric',
        cells: [
            { x: 0, y: 0, width: 50, height: 50 },
            { x: 50, y: 0, width: 50, height: 25 },
            { x: 50, y: 25, width: 50, height: 25 },
            { x: 0, y: 50, width: 100, height: 50 }
        ]
    },
    'circles': {
        name: 'Circle Grid',
        cells: [
            { x: 25, y: 10, width: 25, height: 25, borderRadius: '50%' },
            { x: 55, y: 10, width: 25, height: 25, borderRadius: '50%' },
            { x: 40, y: 45, width: 25, height: 25, borderRadius: '50%' }
        ]
    },
    'plus': {
        name: 'Plus Layout',
        cells: [
            { x: 30, y: 0, width: 40, height: 40 },
            { x: 0, y: 30, width: 40, height: 40 },
            { x: 60, y: 30, width: 40, height: 40 },
            { x: 30, y: 60, width: 40, height: 40 }
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCollageEditor();
});

function initializeCollageEditor() {
    console.log('[v0] Initializing collage editor');
    
    const layout = sessionStorage.getItem('collageLayout') || 'default';
    currentLayout = layout;

    const config = layoutConfigs[layout] || layoutConfigs['2x2'];
    console.log('[v0] Using layout:', config.name);

    createCollageGrid(config);

    // Event listeners
    document.getElementById('addImageBtn').addEventListener('click', openImageUpload);
    document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelectedImage);
    document.getElementById('downloadBtn').addEventListener('click', downloadCollage);
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
}

function createCollageGrid(config) {
    const canvas = document.getElementById('collageCanvas');
    canvas.innerHTML = '';
    canvas.style.position = 'relative';
    canvas.style.width = '100%';
    canvas.style.maxWidth = '1000px';
    canvas.style.margin = '0 auto';
    canvas.style.backgroundColor = '#ffffff';
    canvas.style.aspectRatio = config.aspectRatio || '1/1';
    canvas.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';

    config.cells.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'collage-cell';
        cellDiv.id = 'cell-' + index;
        cellDiv.style.position = 'absolute';
        cellDiv.style.left = cell.x + '%';
        cellDiv.style.top = cell.y + '%';
        cellDiv.style.width = cell.width + '%';
        cellDiv.style.height = cell.height + '%';
        cellDiv.style.border = '2px dashed #d4a574';
        cellDiv.style.overflow = 'hidden';
        cellDiv.style.cursor = 'pointer';
        cellDiv.style.backgroundColor = '#f5f0e8';
        cellDiv.style.transition = 'all 0.3s ease';
        cellDiv.style.borderRadius = cell.borderRadius || '0';

        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = '#999999';
        placeholder.style.fontSize = '0.9rem';
        placeholder.innerHTML = '<i class="fas fa-image"></i> Click to add image';

        cellDiv.appendChild(placeholder);

        cellDiv.addEventListener('click', function() {
            selectedImage = index;
            document.querySelectorAll('.collage-cell').forEach(c => {
                c.style.borderColor = '#d4a574';
                c.style.borderStyle = 'dashed';
            });
            this.style.borderColor = '#8b7355';
            this.style.borderStyle = 'solid';
            openImageUpload();
        });

        cellDiv.addEventListener('mouseenter', function() {
            if (!this.dataset.hasImage) {
                this.style.backgroundColor = '#eee';
            }
        });

        cellDiv.addEventListener('mouseleave', function() {
            if (!this.dataset.hasImage) {
                this.style.backgroundColor = '#f5f0e8';
            }
        });

        canvas.appendChild(cellDiv);
    });
}

function openImageUpload() {
    document.getElementById('imageInput').click();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    console.log('[v0] Image selected:', file.name);

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        addImageToCell(selectedImage, imageData);
    };
    reader.readAsDataURL(file);
}

function addImageToCell(cellIndex, imageData) {
    const cell = document.getElementById('cell-' + cellIndex);
    if (!cell) return;

    cell.innerHTML = '';
    cell.dataset.hasImage = 'true';
    cell.style.backgroundColor = 'transparent';

    const img = document.createElement('img');
    img.src = imageData;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center';

    cell.appendChild(img);

    console.log('[v0] Image added to cell:', cellIndex);

    // Store image data in sessionStorage for later retrieval
    const collageData = JSON.parse(sessionStorage.getItem('collageData') || '{}');
    collageData[cellIndex] = imageData;
    sessionStorage.setItem('collageData', JSON.stringify(collageData));
}

function deleteSelectedImage() {
    if (selectedImage === null) {
        alert('Please select an image to delete');
        return;
    }

    const cell = document.getElementById('cell-' + selectedImage);
    if (!cell) return;

    const placeholder = document.createElement('div');
    placeholder.style.width = '100%';
    placeholder.style.height = '100%';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.color = '#999999';
    placeholder.style.fontSize = '0.9rem';
    placeholder.innerHTML = '<i class="fas fa-image"></i> Click to add image';

    cell.innerHTML = '';
    cell.appendChild(placeholder);
    cell.dataset.hasImage = 'false';
    cell.style.backgroundColor = '#f5f0e8';
    cell.style.borderColor = '#d4a574';
    cell.style.borderStyle = 'dashed';

    const collageData = JSON.parse(sessionStorage.getItem('collageData') || '{}');
    delete collageData[selectedImage];
    sessionStorage.setItem('collageData', JSON.stringify(collageData));

    console.log('[v0] Image deleted from cell:', selectedImage);
}

function downloadCollage() {
    const canvas = document.getElementById('collageCanvas');

    // Use html2canvas library for better rendering
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = function() {
        window.html2canvas(canvas, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvasElement => {
            const link = document.createElement('a');
            link.href = canvasElement.toDataURL('image/png');
            link.download = 'collage-' + new Date().getTime() + '.png';
            link.click();
            console.log('[v0] Collage downloaded');
        }).catch(err => {
            console.error('[v0] Download error:', err);
            alert('Error downloading collage. Please try again.');
        });
    };
    document.head.appendChild(script);
}
