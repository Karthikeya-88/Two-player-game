import React, { Component } from 'react';
import './index.css';

class TwoPlGame extends Component {
  state = {
    board: Array(9).fill(null),
    isXNext: true,
    winner: null,
    scores: JSON.parse(localStorage.getItem('two-pl-game-scores')) || [],
  };

  calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  handleClick = (index) => {
    const { board, isXNext, winner } = this.state;
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    const newWinner = this.calculateWinner(newBoard);

    this.setState(
      {
        board: newBoard,
        isXNext: !isXNext,
        winner: newWinner,
      },
      () => {
        if (newWinner || !newBoard.includes(null)) {
          this.updateScores(newWinner || 'Draw');
        }
      }
    );
  };

  updateScores = (winner) => {
    const { scores } = this.state;
    const newScores = [...scores, winner];
    if (newScores.length > 5) newScores.shift();
    this.setState({ scores: newScores }, () => {
      localStorage.setItem('two-pl-game-scores', JSON.stringify(newScores));
      if (newScores.length === 5) {
        this.sendScoresToAPI(newScores, winner);
      }
    });
  };

  sendScoresToAPI = async (scores, winner) => {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores, winner }),
      });
      if (!response.ok) throw new Error('Failed to save scores');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  resetGame = () => {
    this.setState({
      board: Array(9).fill(null),
      isXNext: true,
      winner: null,
    });
  };

  render() {
    const { board, winner, scores } = this.state;
    return (
      <div className="Game">
        <h1>Two-Player-Game</h1>
        <div className="board">
          {board.map((cell, index) => (
            <button
              key={index}
              aria-label={`Cell ${index}`}
              className="cell"
              onClick={() => this.handleClick(index)}
              disabled={winner || cell}
            >
              {cell}
            </button>
          ))}
        </div>
        {winner && (
          <p className="status">
            {winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`}
          </p>
        )}
        <button className="reset-button" onClick={this.resetGame}>
          Reset Game
        </button>
        <div className="scores">
          <h2>Last 5 Scores:</h2>
          <ul>
            {scores.map((score, index) => (
              <li key={index}>{score}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default TwoPlGame;
