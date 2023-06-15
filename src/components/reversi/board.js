import {TwoDimensionalVector} from './2d-vector';
export const boardSize = 8;
export const boardWidth = boardSize;
export const boardHeight = boardWidth;
export const boardArea = boardWidth * boardHeight;
export const whitePlayerToken = 'X';
export const blackPlayerToken = 'O';
const emptySquareToken = ' ';
export class Board {
  constructor(whitePlayer, blackPlayer, boardString = '') {
    boardString = boardString || Board.createInitialBoardString();
    if (boardString.length !== boardArea) {
      throw new Error(`Board constructor: The length of boardString is not ${boardArea}.`);
    }
    this.boardArray = this.generateFromString(boardString, whitePlayer, blackPlayer);
  }
  static createInitialBoardString() {
    const boardArray = [
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "X",
      "O",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "O",
      "X",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " "
    ]
    const halfWidth = Math.floor(boardWidth / 2);
    const halfHeight = Math.floor(boardHeight / 2);
    boardArray[(halfHeight - 1) * boardWidth + halfWidth - 1] = whitePlayerToken;
    boardArray[(halfHeight - 1) * boardWidth + halfWidth] = blackPlayerToken;
    boardArray[halfHeight * boardWidth + halfWidth - 1] = blackPlayerToken;
    boardArray[halfHeight * boardWidth + halfWidth] = whitePlayerToken;
    return boardArray.join('');
  }
  getAsString() {
    return this.generateAsString();
  }
  areCoordinatesOnBoard(row, column) {
    return (!Number.isNaN(row) && !Number.isNaN(column) && row >= 0 && row < boardHeight && column >= 0 && column < boardWidth);
  }
  getSquareState(row, column) {
    if (!this.areCoordinatesOnBoard(row, column)) {
      return undefined;
    }
    return this.boardArray[row * boardWidth + column];
  }
  setSquareState(row, column, player) {
    if (!this.areCoordinatesOnBoard(row, column)) {
      throw new Error('Board.setSquareState() : Coordinates are off the board.');
    }
    this.boardArray[row * boardWidth + column] = player;
  }
  placePiece(player, row, column) {
    const returnObject = {
      flippedPieces: [],
      score: 0
    };
    if (!this.areCoordinatesOnBoard(row, column) || typeof this.getSquareState(row, column) !== 'undefined') {
      return undefined;
    }
    for (const direction of TwoDimensionalVector.eightDirections) {
      let canFlipInThisDirection;
      const undoBuffer = [];
      let row2 = row;
      let column2 = column;
      for (;;) {
        row2 += direction.dy;
        column2 += direction.dx;
        if (typeof canFlipInThisDirection !== 'undefined' || !this.areCoordinatesOnBoard(row2, column2)) {
          break;
        }
        const squareState = this.getSquareState(row2, column2);
        if (typeof squareState === 'undefined') {
          canFlipInThisDirection = false;
        } else if (squareState.colour === player.colour) {
          canFlipInThisDirection = true;
        } else {
          undoBuffer.push({row: row2, column: column2});
        }
      }
      if (canFlipInThisDirection && undoBuffer.length > 0) {
        returnObject.flippedPieces = returnObject.flippedPieces.concat(undoBuffer);
      }
    }
    if (returnObject.flippedPieces.length === 0) {
      return undefined;
    }
    for (const coord of returnObject.flippedPieces) {
      this.setSquareState(coord.row, coord.column, player);
      returnObject.score += 2 * this.squareScore(coord.row, coord.column);
    }
    this.setSquareState(row, column, player);
    returnObject.score += this.squareScore(row, column);
    player.piecePopulation += returnObject.flippedPieces.length + 1;
    player.opponent.piecePopulation -= returnObject.flippedPieces.length;
    return returnObject;
  }
  getPrintedBoardAsString() {
    const rowLabels = '12345678';
    const columnLabels = 'abcdefgh';
    let boardAsString = '';
    for (let row = boardSize - 1; row >= 0; --row) {
      boardAsString = boardAsString + rowLabels[row] + ' ';
      for (let col = 0; col < boardSize; ++col) {
        let output = '?';
        const player = this.getSquareState(row, col);
        if (typeof player === 'undefined') {
          output = (row + col) % 2 === 0
            ? '+'
            : ' ';
        } else {
          output = player.token;
        }
        boardAsString = boardAsString + output;
      }
      boardAsString = boardAsString + '\n';
    }
    boardAsString = boardAsString + '\n  ' + columnLabels + '\n';
    return boardAsString;
  }
  squareScore(row, column) {
    const interiorSquareScore = 1;
    const edgeSquareScore = 2;
    const cornerSquareScore = 8;
    const isInEdgeColumn = column === 0 || column === boardWidth - 1;
    if (row === 0 || row === boardHeight - 1) {
      if (isInEdgeColumn) {
        return cornerSquareScore;
      } else {
        return edgeSquareScore;
      }
    } else if (isInEdgeColumn) {
      return edgeSquareScore;
    } else {
      return interiorSquareScore;
    }
  }
  generateFromString(boardString, whitePlayer, blackPlayer) {
    const result = [];
    for (const c of boardString.split('')) {
      if (c === emptySquareToken) {
        result.push(undefined);
      } else if (c === whitePlayer.token) {
        result.push(whitePlayer);
      } else if (c === blackPlayer.token) {
        result.push(blackPlayer);
      } else {
        throw new Error('Board.generateFromString() error');
      }
    }
    return result;
  }
  generateAsString() {
    return this.boardArray.map(
      (player) => typeof player !== 'undefined'
      ? player.token
      : emptySquareToken).join('');
  }
}
