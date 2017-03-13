import { Board, BoardPiece } from './board';
import { Player } from './player';
import { PlayerHuman } from './player-human';
import { PlayerAi } from './player-ai';
import { Utils } from './utils';

export class Game {
  board: Board;
  players: Array<Player>;
  currentPlayerId: number;
  isMoveAllowed: boolean;
  isGameWon: boolean;

  constructor() {
    this.board = new Board(document.querySelector('canvas'));
    this.players = [
      new PlayerHuman(BoardPiece.PLAYER_1, this.board),
      new PlayerAi(BoardPiece.PLAYER_2, this.board)
    ];
    this.currentPlayerId = 0;
    this.reset()
  }
  reset() {
    this.isMoveAllowed = false;
    this.isGameWon = false;
    this.board.reset()
    this.board.render()
    this.board.debug()
  }

  async start() {
    this.isMoveAllowed = true;
    while (!this.isGameWon) {
      await this.move();
      const winner = this.board.getWinner();
      if (winner !== BoardPiece.EMPTY) {
        console.log('Game over: winner is player ', winner)
        this.isGameWon = true
        this.isMoveAllowed = false
        this.board.announceWinner()
        break
      }
    }
  }
  async move() {
    if (!this.isMoveAllowed) {
      return
    }
    const currentPlayer = this.players[this.currentPlayerId];
    let actionSuccesful = false;
    while (!actionSuccesful) {
      const action = await currentPlayer.getAction(this.board);
      this.isMoveAllowed = false;
      actionSuccesful = await this.board.applyPlayerAction(currentPlayer, action);
      this.isMoveAllowed = true;
      if (!actionSuccesful) {
        console.log('Move not allowed! Try again.')
      }
    }
    this.currentPlayerId = this.getNextPlayer();
  }
  private getNextPlayer() {
    return (this.currentPlayerId === 0) ? 1 : 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game()
  game.start()
  document.querySelector('canvas').addEventListener('click', async () => {
    if (game.isGameWon) {
      game.reset()
      await Utils.animationFrame()
      game.start()
    }
  })
})
