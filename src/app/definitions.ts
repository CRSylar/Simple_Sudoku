
export const emptyBoard = new Array<Array<number|null>>(9).fill( new Array<number|null>(9).fill(null))

export type Board = typeof emptyBoard
