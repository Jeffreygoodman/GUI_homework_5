$(document).ready(function () {
    const createBoardGrid = () => {
        const $boardOverlay = $('.board-overlay');

        // Create 1 row with 15 columns
        for (let col = 0; col < 15; col++) {
            const $cell = $('<div>')
                .addClass('board-cell')
                .attr('data-row', 0) // Fixed row index (0, because it's a single row)
                .attr('data-col', col); // Column index
            $boardOverlay.append($cell);
        }
    };

    const displayLettersOnHolder = (letters) => {
        const $tileOverlay = $('.tile-overlay');
        $tileOverlay.empty(); // Clear existing letters

        let currentX = 0;
        currentY = 0;
        const tileSpacing = 60;
        const horOffset = 110;
        const vertOffset = 20;

        letters.forEach(letter => {
            const $tile = $('<div>')
                .addClass('tile')
                .css({
                    position: 'absolute',
                    left: `${currentX + horOffset}px`,
                    top: `${currentY+vertOffset}px`,
                });

            const $tileImage = $('<img>')
                .attr('src', letter.image)
                .attr('alt', letter.letter)
                .css({ width: '100%', height: '100%' });

            $tile.append($tileImage);
            $tileOverlay.append($tile);

            // Add drag-and-drop functionality
            addDragAndDrop($tile);
            currentX += tileSpacing;
        });
    };

    const addDragAndDrop = ($tile) => {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        originalX = 0;
        originalY = 0;
        $tile.on('mousedown', function (e) {
            e.preventDefault(); // Prevent default behavior
    
            isDragging = true;
            $tile.css('transition', 'none'); // Disable snapping during dragging
    
            // Calculate the mouse offset relative to the tile's current position
            const tileOffset = $tile.position(); // Use position() instead of offset()\
            $tile.data('originalX', tileOffset.left); // Save original position
            $tile.data('originalY', tileOffset.top);
            offsetX = e.pageX - tileOffset.left;
            offsetY = e.pageY - tileOffset.top;
            
            $tile.css('z-index', 1000); // Bring the tile to the front
        });
    
        $(document).on('mousemove', function (e) {
            if (isDragging) {
                // Move the tile with the cursor
                $tile.css({
                    left: `${e.pageX - offsetX}px`,
                    top: `${e.pageY - offsetY}px`
                });
            }
        });
    
        $(document).on('mouseup', function (e) {
            if (isDragging) {
                isDragging = false;
    
                const $boardCells = $('.board-cell');
                let closestCell = null;
                let minDistance = Infinity;
    
                // Find the nearest board cell
                $boardCells.each(function () {
                    const $cell = $(this);
                    const cellOffset = $cell.offset();
                    const cellCenterX = cellOffset.left + $cell.width() / 2;
                    const cellCenterY = cellOffset.top + $cell.height() / 2;
    
                    const distance = Math.sqrt(
                        Math.pow(e.pageX - cellCenterX, 2) +
                        Math.pow(e.pageY - cellCenterY, 2)
                    );
    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCell = $cell;
                    }
                });
    
                // Snap to the center of the closest cell if it's close enough
                if (closestCell && minDistance < 50) { // 50px threshold to snap
                    const cellOffset = closestCell.offset();
                    const boardOffset = $('.board-overlay').offset();
                
                    // Calculate center of the cell and adjust tile's position
                    const centerX = cellOffset.left - boardOffset.left *1.615 + (closestCell.width() - $tile.width()) / 2;
                    const centerY = cellOffset.top - boardOffset.top * 1.39 + (closestCell.height() - $tile.height()) / 2;
                
                    $tile.css({
                        left: `${centerX}px`,
                        top: `${centerY}px`
                    });
                
                    console.log(`Placed ${$tile.find('img').attr('alt')} on the board`);
                } else {
                    // Snap back to original position if not placed on the board
                    const originalX = $tile.data('originalX') || 0;
                    const originalY = $tile.data('originalY') || 0;
                    $tile.css({
                        transition: 'all 0.2s ease', // Smooth snapping
                        left: `${originalX}px`,
                        top: `${originalY}px`,
                    });
                
                    console.log(`${$tile.find('img').attr('alt')} returned to the tile holder.`);
                }
                $tile.css('z-index', ''); // Reset z-index
            }
        });
    };

    // Get letter data and initialize the game
    const getLetter = async () => {
        try {
            const response = await fetch('graphics_data/pieces.json');
            const data = await response.json();
            return data.pieces;
        } catch (error) {
            console.log('Error fetching letter data:', error);
        }
    };

    const getWeightedLetterPool = async () => {
        const pieces = await getLetter();
        const weightedLetterPool = [];
        pieces.forEach(piece => {
            for (let i = 0; i < piece.amount; i++) {
                weightedLetterPool.push(piece);
            }
        });
        return weightedLetterPool;
    };

    const getRandomLetters = async (count) => {
        const weightedLetterPool = await getWeightedLetterPool();
        const randomLetters = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * weightedLetterPool.length);
            randomLetters.push(weightedLetterPool[randomIndex]);
            weightedLetterPool.splice(randomIndex, 1);
        }
        return randomLetters;
    };

    const initializeGame = async () => {
        createBoardGrid();
        const letters = await getRandomLetters(7); // Get 7 random letters
        displayLettersOnHolder(letters);
    };

    initializeGame();
});
