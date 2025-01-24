document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty') || 'rookie';
    const team = urlParams.get('team') || 'all';
    const position = urlParams.get('position') || 'all';
    const college = urlParams.get('college') || 'all';
    let streak = 0;
    let gameActive = true;
    let gameEnded = false; // Flag to track if the game has ended
    let selectedPlayer;
    let guessesLeft;
    let cluesGiven;
    const maxClues = 4;
  
    const cluesList = document.getElementById('clues-list');
    const feedback = document.getElementById('feedback');
    const guessInput = document.getElementById('player-guess');
    const submitGuessButton = document.getElementById('submit-guess');
    const giveUpButton = document.getElementById('give-up');
    const playAgainButton = document.getElementById('play-again');
    const guessesCount = document.getElementById('guesses-count');
    const streakTracker = document.getElementById('streak-tracker');
    const streakCount = document.getElementById('streak-count');
    const fireStreak = document.getElementById('fire-streak');
    const streakNumber = document.getElementById('streak-number');
    const guessesLeftDiv = document.getElementById('guesses-left');
    const gameContainer = document.getElementById('game-container');
    const increaseStreakButton = document.getElementById('increase-streak');
  
    // Load player data
    fetch('data/nfl_players.json')
      .then(response => response.json())
      .then(players => {
        // Populate the datalist with all player names
        const playerNamesDatalist = document.getElementById('player-names');
        playerNamesDatalist.innerHTML = '';
        players.forEach(player => {
          const option = document.createElement('option');
          option.value = player.name;
          playerNamesDatalist.appendChild(option);
        });
  
        // Filter players based on selected settings
        const filteredPlayers = filterPlayersBySettings(players);
        startGame(filteredPlayers);
      })
      .catch(error => {
        console.error('Error loading player data:', error);
        feedback.textContent = 'Failed to load player data. Please try again later.';
      });
  
    // Filter players based on selected settings
    function filterPlayersBySettings(data) {
      return data.filter(player => {
        let matches = true;
  
        // Filter by difficulty
        if (difficulty === 'rookie') {
          matches = matches && player.value >= 4;
        } else if (difficulty === 'easy') {
          matches = matches && player.value >= 2;
        } else if (difficulty === 'hard') {
          matches = matches && player.value >= 1;
        } // 'expert' includes all players
  
        // Filter by team
        if (team !== 'all') {
          matches = matches && player.team.toLowerCase() === team.toLowerCase();
        }
  
        // Filter by position
        if (position !== 'all') {
          matches = matches && player.position.toLowerCase() === position.toLowerCase();
        }
  
        // Filter by college
        if (college !== 'all') {
          matches = matches && player.college.map(c => c.toLowerCase()).includes(college.toLowerCase());
        }
  
        return matches;
      });
    }
  
    // Start the game
    function startGame(filteredPlayers) {
      if (filteredPlayers.length === 0) {
        feedback.textContent = 'No players match the selected criteria.';
        return;
      }
  
      // Select a random player from the filtered list
      selectedPlayer = filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
  
      // Reset game state
      resetGameState();
  
      // Display the initial clue (Position)
      const initialClue = document.createElement('li');
      initialClue.textContent = `Position: ${selectedPlayer.position}`;
      cluesList.appendChild(initialClue);
    }
  
    // Reset game state
    function resetGameState() {
      cluesGiven = 0;
      guessesLeft = 5;
      gameActive = true;
      gameEnded = false; // Reset the game ended flag
      cluesList.innerHTML = '';
      feedback.textContent = '';
      guessInput.value = '';
      guessInput.disabled = false;
      submitGuessButton.disabled = false;
      playAgainButton.style.display = 'none';
      guessesCount.textContent = guessesLeft;
      guessesLeftDiv.style.display = 'block';
      gameContainer.classList.remove('fire-effect'); // Remove fire effect if present
    }
  
    // Handle guess submission
    function handleGuessSubmission() {
      if (!gameActive) return;
      const guess = guessInput.value.trim().toLowerCase();
      if (guess === selectedPlayer.name.toLowerCase()) {
        feedback.textContent = `Correct! You guessed ${selectedPlayer.name}.`;
        endGame(true);
      } else {
        guessesLeft--;
        guessesCount.textContent = guessesLeft;
        feedback.textContent = 'Incorrect guess. Try again!';
        // Reveal the next clue
        if (cluesGiven < maxClues) {
          const clueItem = document.createElement('li');
          clueItem.textContent = getNextClue();
          cluesList.appendChild(clueItem);
          cluesGiven++;
        }
        // Check if the user has run out of guesses
        if (guessesLeft === 0) {
          feedback.textContent = `You've run out of guesses! The player was ${selectedPlayer.name}.`;
          endGame(false);
        }
      }
    }
  
    // Get the next clue
    function getNextClue() {
      const clues = [
        `College: ${selectedPlayer.college.join(', ')}`,
        `Age: ${selectedPlayer.age}`,
        `Number: ${selectedPlayer.number}`,
        `Team: ${selectedPlayer.team}`,
      ];
      return clues[cluesGiven];
    }
  
    // End the game
    function endGame(won) {
      gameActive = false;
      gameEnded = true; // Set the game ended flag
      guessInput.disabled = true;
      submitGuessButton.disabled = true;
      playAgainButton.style.display = 'block'; // Ensure the play again button is visible
      guessesLeftDiv.style.display = 'none'; // Hide guesses left tracker
      if (won) {
        streak++;
        updateStreakDisplay();
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        streak = 0; // Reset streak
        updateStreakDisplay();
      }
    }
  
    // Update streak display
    function updateStreakDisplay() {
      if (streak >= 3 && streak < 10) {
        streakTracker.style.display = 'block';
        streakCount.textContent = `${streak} 🔥`;
        fireStreak.style.display = 'none'; // Hide fire streak
      } else if (streak >= 10) {
        fireStreak.style.display = 'block'; // Show fire streak
        streakNumber.textContent = streak;
        streakTracker.style.display = 'none'; // Hide streak tracker
      } else {
        streakTracker.style.display = 'none'; // Hide streak tracker
        fireStreak.style.display = 'none'; // Hide fire streak
      }
    }
  
    // Event listeners
    submitGuessButton.addEventListener('click', handleGuessSubmission);
    guessInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && gameActive) {
        handleGuessSubmission();
        event.stopPropagation(); // Prevents this event from propagating to the global listener
        event.preventDefault(); // Prevent any default form submission behavior
      }
    });
  
    giveUpButton.addEventListener('click', () => {
      if (!gameActive) return;
      feedback.textContent = `The player was ${selectedPlayer.name}.`;
      endGame(false);
    });
  
    playAgainButton.addEventListener('click', () => {
      fetch('data/nfl_players.json')
        .then(response => response.json())
        .then(players => {
          const filteredPlayers = filterPlayersBySettings(players);
          startGame(filteredPlayers); // Restart the game with the same settings
          playAgainButton.style.display = 'none'; // Hide the play again button
        })
        .catch(error => {
          console.error('Error loading player data:', error);
          feedback.textContent = 'Failed to load player data. Please try again later.';
        });
    });
  
    // Increase streak button event listener
    increaseStreakButton.addEventListener('click', () => {
      streak++;
      updateStreakDisplay();
    });
  
    // Event listener for Enter key to activate Play Again button
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && gameEnded) {
        playAgainButton.click();
        event.stopPropagation(); // Prevent propagation to other listeners
        event.preventDefault(); // Prevent conflicts with the input field
      }
    });
  
    // Initial streak display update
    updateStreakDisplay();
  });