"use client";
import useSWR, { Fetcher }                                from 'swr';
import { createContext, useContext, useEffect, useState } from 'react';
import { Board, emptyBoard }                              from '@/app/definitions';

const SudokuContext = createContext<[Board,
  (value: (((prevState: (number | null)[][]) => (number | null)[][]) | (number | null)[][])) => void]>
([emptyBoard, () => {} ])

const fetcher: Fetcher<Board, string> = (url) => fetch(url).then(r => r.json())

const Cell = ({value, block, elementId} : {value: number, block: number, elementId: number}) => {

  const [board, setBoard] = useContext(SudokuContext)

  const saveValue = (event) => {
    if (isNaN(event.target.value) || event.target.value > 9) return ;
    const newBoard = board.map( (block) => [...block])
    newBoard[block][elementId] = parseInt(event.target.value)
    setBoard(newBoard)
  }

  const sanitizeInput = (value) => {
    const regEx = /^[1-9]$/
    if (!regEx.test(value.key)) {
      value.preventDefault()
    }
  }

  return (
    <input
      className="bg-transparent cursor-pointer caret-transparent focus:bg-teal-100 outline-none border border-teal-900/10 text-center w-20 h-20 text-5xl disabled:cursor-not-allowed"
      type="number"
      minLength="1"
      maxLength="1"
      value={value?? board[block][elementId] ?? ""}
      disabled={!!value}
      onChange={saveValue}
      onKeyPress={sanitizeInput}
    />
  )
}


const Block = ({value, idx} : {value: number[], idx: number}) => {

  return (
    <div className="grid grid-cols-3 border border-teal-900/20">
      {
       value.map( (el, index) =>
                    <Cell key={index} value={el} block={idx} elementId={index} />
       )
      }
    </div>
  )
}


export default function Home() {

  const [board, setBoard] = useState(emptyBoard)
  const [isChecking, setIsChecking] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const  {data} = useSWR('http://localhost:3000/starting.json', fetcher )
  const  {data: solution} = useSWR('http://localhost:3000/solution.json', fetcher )


  useEffect( () => {
    if (data)
      setBoard(data)
  }, [data])

  if (!data) return <main><div>{'Can`t fetch data!'}</div></main>


  const checkSolution = () => {
    if (JSON.stringify(board) === JSON.stringify(solution))
      setIsSolved(true)
    else
      setIsSolved(false)
  }

  const checkSudoku = () => {
    setIsChecking(true)
    console.log('Checking Solution');
    const sudokuWithoutNulls = board.map(( block) =>
                                           block.filter( ( el ) => el !== null)
    )
    for (let i =0; i<9; i++) {
      /* check inside a Block */
      console.log('Checking Solution in Blocks', sudokuWithoutNulls[i]);
      if (new Set(sudokuWithoutNulls[i]).size !== sudokuWithoutNulls[i].length) {
        console.log('Error in Block!' );
        setIsError(true)
        setIsChecking(false)
        return;
      }
    }

    const rowSet = new Set()
    /* check all Rows */
    for (let r=0 ; r < 9; r+=3 ) {
      for ( let block = 0 ; block < 9 ; block ++ ) {
        for ( let cell = r ; cell < r+3 ; cell ++ ) {
          console.log('Checking Solution in Rows');
          const cellValue = board[block][cell]
          if ( cellValue === null ) continue;

          if ( rowSet.has( cellValue ) ) {
            console.log( 'Found an Error in Rows' );
            setIsError( true )
            setIsChecking(false)
            return;
          }
          rowSet.add( cellValue )
        }
        if ( ( block + 1 ) % 3 === 0 ) {
          rowSet.clear()
        }
      }
    }
    /* Check all Columns */
    const colSet = new Set()
    for (const c of [0, 1, 2]) {
      for ( const r of [0, 1, 2]) {
        for ( let block = c ; block < 9 ; block += 3 ) {
          for ( let cell = r ; cell < 9 ; cell += 3 ) {
            console.log('Checking Solution in Cols');
            const cellValue = board[block][cell];
            if ( cellValue === null ) continue;

            if ( colSet.has( cellValue ) ) {
              console.log( 'Found an Error in Columns' );
              setIsError( true )
              setIsChecking(false)
              return;
            }
            colSet.add( cellValue )
          }
        }

        colSet.clear()
      }
    }
    console.log('Solution is free or silly errors, final check...');
    setIsError(false)
    checkSolution()
    setIsChecking(false)
  }


  return (
    <SudokuContext.Provider value={[board, setBoard]}>

    <main className="min-h-screen flex flex-col space-y-10 items-center justify-center bg-slate-200">
      <div className="flex flex-col space-y-5">
        <button
          onClick={checkSudoku}
          className="border border-teal-900/50 p-4 rounded-2xl hover:bg-teal-900/50 hover:text-white ">
          {'Check Solution'}
        </button>
        {/* Message from check solution */}
        {
          isChecking && <span className="text-lg text-yellow-600">{'Checking Board...'}</span>
        }
        {
          isError && <span className="text-lg text-red-600">{'Board Contain one or More Error(s) !'}</span>
        }
        {
          isSolved && <span className="text-lg text-green-600">{'Congratulation, Sudoku Solved !'}</span>
        }
        {/* End Message*/}
      </div>
      <div className="">
        <div className="border-2 border-teal-900 grid grid-cols-3 grid-rows-3 ">
        {
          data.map( (block, index) => (
            <Block key={index} idx={index} value={block}/>
          ))
        }
      </div>
      </div>
    </main>
    </SudokuContext.Provider>
  )
}
