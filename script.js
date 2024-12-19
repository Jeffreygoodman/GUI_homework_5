let letterData = [];
let placedTiles = [];
let lastPlacedcell = {row: 0, col: 0};   
let totalScoreAccumulated = 0;
$(document).ready(async function () {
    
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
        //$tileOverlay.empty(); // Clear existing letters

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
            if($tile.data('originalX') === undefined|| $tile.data('originalY') === undefined){
            const tileOffset = $tile.position(); // Use position() instead of offset()\
            $tile.data('originalX', tileOffset.left); // Save original position
            $tile.data('originalY', tileOffset.top);
            offsetX = e.pageX - tileOffset.left;
            offsetY = e.pageY - tileOffset.top;
            }
            offsetX = e.pageX - $tile.position().left;
            offsetY = e.pageY - $tile.position().top;
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
                    if (placedTiles.length===0 && closestCell.data('col')===0){
                        const letter = $tile.find('img').attr('alt');
                        const value = getLetterValue(letter);
                        const cellInfo ={
                            letter: letter,
                            value: value,
                            col: closestCell.data('col')
                    
                        };
                        $tile.css({
                            left: `${centerX}px`,
                            top: `${centerY}px`
                        });
                    placedTiles.push(cellInfo);
                    lastPlacedcell = { col:0};
                    console.log(`Placed ${letter} with value ${value} at col ${cellInfo.col}`);
                    console.log(`Total word score: ${calculateWordScore()}`);
            } else if (placedTiles.length > 0) {
                const prevTile = placedTiles[placedTiles.length - 1];
                
                const prevCol = prevTile.col;

                if (closestCell.data('col') === prevCol + 1) {
                    $tile.css({
                        left: `${centerX}px`,
                        top: `${centerY}px`
                    });
                    const letter = $tile.find('img').attr('alt');
                    const value = getLetterValue(letter);
                    const cellInfo = {
                        letter: letter,
                        value: value,
                        col: closestCell.data('col')
                    };
                    placedTiles.push(cellInfo);
                    lastPlacedcell = {row: closestCell.data('row'), col: closestCell.data('col')};
                    console.log(`Placed ${letter} with value ${value} at row ${cellInfo.row}, col ${cellInfo.col}`);
                    console.log(`Total word score: ${calculateWordScore()}`);

                  }else {
                    const originalX = $tile.data('originalX');
                    const originalY = $tile.data('originalY');
                    $tile.css({
                        transition: 'all 0.2s ease', // Smooth snapping
                        left: `${originalX}px`,
                        top: `${originalY}px`,
                    });
                    removeTileFromBoard($tile);
                    console.log(`${$tile.find('img').attr('alt')} returned to the tile holder.`);
                    console.log('tile original position', originalX, originalY);
                  }


            }

                     //console.log(`Placed ${$tile.find('img').attr('alt')} on the board`);
                } else {
                    // Snap back to original position if not placed on the board
                    const originalX = $tile.data('originalX');
                    const originalY = $tile.data('originalY');
                    $tile.css({
                        transition: 'all 0.2s ease', // Smooth snapping
                        left: `${originalX}px`,
                        top: `${originalY}px`,
                    });
                    removeTileFromBoard($tile);
                    console.log(`${$tile.find('img').attr('alt')} returned to the tile holder.`);
                    console.log('tile original position', originalX, originalY);
                }
                //$tile.css('z-index', ''); // Reset z-index
            }
        });
    };
    
    const clearPlacedTiles = () => {
        // Get the board boundaries
        const $boardOverlay = $('.board-overlay');
        const boardBounds = $boardOverlay[0].getBoundingClientRect();
    
        // Find all tiles
        $('.tile').each(function() {
            const $tile = $(this);
            const tilePos = $tile[0].getBoundingClientRect();
            
            // Check if tile is within board boundaries
            if (tilePos.top >= boardBounds.top && 
                tilePos.bottom <= boardBounds.bottom && 
                tilePos.left >= boardBounds.left && 
                tilePos.right <= boardBounds.right) {
                
                // Remove the tile from DOM if it's on the board
                $tile.remove();
            }
        });
    
        // Clear the placedTiles array after removing DOM elements
        const removedTiles = [...placedTiles];
        placedTiles.length = 0;
        
        // Log the removed tiles
        removedTiles.forEach(tile => {
            console.log(`Removed ${tile.letter} with value ${tile.value}.`);
        });
        
        console.log(`Total word score after removal: ${calculateWordScore()}`);
    };
        
    const removeTileFromBoard = (tile) => {
        // Remove the tile's data from the placedTiles array
       
        const letter = tile.find('img').attr('alt');
        const tileIndex = placedTiles.findIndex(item => item.letter === letter);
        
       
            // Subtract the tile's score
            const tileValue = placedTiles[tileIndex].value;
            placedTiles.splice(tileIndex, 1);
            console.log(`Removed ${letter} with value ${tileValue}.`);
    
            // Recalculate the word score
            console.log(`Total word score after removal: ${calculateWordScore()}`);
        
    };
    const calculateWordScore = () => {
        let wordScore = 0;
    
        // Loop through the placed tiles and sum their points
        placedTiles.forEach(tile => {
            wordScore += tile.value;
        });
    
        // Check for word multipliers
        placedTiles.forEach(tile => {
            const $cell = $(`.board-cell[data-row=${tile.row}][data-col=${tile.col}]`);
            
            // Example: Check for word-multiply special cell
            if ($cell.attr('data-special') === 'word-multiply') {
                wordScore *= 2; // Multiply the word score by 2
                console.log('Word score multiplied by 2!');
            }
        });
        $('#word-score').text(wordScore);
        return wordScore;
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
    const submitScore = async () => {
        const numTilesToReplace = placedTiles.length; // Store this before clearing
        const wordScore = calculateWordScore();
        totalScoreAccumulated += wordScore;
        console.log('word score:', wordScore);
        console.log('total score:', totalScoreAccumulated);
        $('#total-score').text(totalScoreAccumulated);
        // Clear the placed tiles from the board
        clearPlacedTiles();
        
        // Reset the score display
        $('#word-score').text(0);
    
        // Get new random letters equal to number of tiles removed
        if (numTilesToReplace > 0) {
            const newLetters = await getRandomLetters(numTilesToReplace);
            displayLettersOnHolder(newLetters);
        }
        
        console.log(`Submit button was pressed - replaced ${numTilesToReplace} tiles`);
    };
    const initializeGame = async () => {
        createBoardGrid();
        const letters = await getRandomLetters(7); // Get 7 random letters
        displayLettersOnHolder(letters);
    };
    const getLetterValue = (letter) => {
        const letterObj = letterData.find(obj => obj.letter === letter);
        return letterObj ? letterObj.value : 0;
    }
    letterData = await getLetter();
    initializeGame();
    $('#submit-button').on('click', submitScore);
   
   
   
});

