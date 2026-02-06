// 1. Canva-style Layouts
const canvaTemplates = {
    'mosaic': {
        grid: '"a b b" "c c d" "e f d"',
        areas: ['a', 'b', 'c', 'd', 'e', 'f'],
        placeholders: [
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500', 
            'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?w=500', 
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500', 
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500', 
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500', 
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500'  
        ]
    },
    'hero-split': {
        grid: '"a a b" "a a c"',
        areas: ['a', 'b', 'c'],
        placeholders: [
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
            'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=500',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        ]
    }
};

let activeCell = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('collageCanvas');
    // Session-il template illai endraal 'mosaic' default-ah edukum
    let selectedTemplate = JSON.parse(sessionStorage.getItem('selectedTemplate')) || { layout: 'mosaic' };
    
    renderCanvaEditor(canvas, selectedTemplate.layout);
    setupImageUploader();
});

function renderCanvaEditor(canvas, layoutName) {
    const config = canvaTemplates[layoutName] || canvaTemplates['mosaic'];
    
    if (!canvas) return;

    canvas.innerHTML = '';
    canvas.style.display = 'grid';
    canvas.style.gridTemplateAreas = config.grid;
    canvas.style.gridAutoRows = 'minmax(150px, auto)';
    canvas.style.gap = '10px';
    canvas.style.padding = '10px';
    canvas.style.backgroundColor = '#151525'; // MJART Dark Theme

    config.areas.forEach((area, index) => {
        const cell = document.createElement('div');
        cell.className = 'canva-cell';
        cell.style.gridArea = area;
        
        // Placeholder image loading logic
        cell.style.backgroundImage = `url(${config.placeholders[index]})`;
        cell.style.backgroundSize = 'cover';
        cell.style.backgroundPosition = 'center';
        cell.style.position = 'relative';
        cell.style.minHeight = '200px';
        cell.style.borderRadius = '8px';
        cell.style.cursor = 'pointer';
        cell.style.overflow = 'hidden';

        // Hover Overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(163, 230, 53, 0.3)'; // MJART Green tint
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.opacity = '0';
        overlay.style.transition = '0.3s';
        overlay.innerHTML = '<span style="color:white; font-weight:bold; background:rgba(0,0,0,0.5); padding:5px 10px; border-radius:5px;">Replace</span>';

        cell.onmouseenter = () => overlay.style.opacity = '1';
        cell.onmouseleave = () => overlay.style.opacity = '0';

        cell.onclick = () => {
            activeCell = cell;
            document.getElementById('imageInput').click();
        };

        cell.appendChild(overlay);
        canvas.appendChild(cell);
    });
}

function setupImageUploader() {
    const input = document.getElementById('imageInput');
    if (!input) return;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && activeCell) {
            const reader = new FileReader();
            reader.onload = (event) => {
                activeCell.style.backgroundImage = `url(${event.target.result})`;
                // Reset input value so same image can be re-selected if needed
                input.value = '';
            };
            reader.readAsDataURL(file);
        }
    });

    // Improved Download Logic
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const target = document.getElementById('collageCanvas');
            // External library 'html2canvas' check
            if (typeof html2canvas === 'undefined') {
                alert("Download library not loaded. Please wait a moment.");
                return;
            }

            html2canvas(target, { 
                useCORS: true, // Important for external images
                scale: 2 
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'mjart-collage.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        };
    }
}