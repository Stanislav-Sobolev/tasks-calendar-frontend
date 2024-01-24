import { useState, useEffect } from 'react';

import { Card } from '../Card/Card';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import styles from './Board.module.scss';
import { Plus } from '../Icons';
import { createCard, dndCard } from '../../helpers/fetchers';

export const Board = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, columnsData } = boardData;

  const [columns, setColumns] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setColumns(columnsData);
  }, [columnsData]);
  
  const dragOverHandler = (e) => {
    e.preventDefault();
  };

  const dropCardHandler = async (e, column) => {
    e.preventDefault();
    
    if (currentCard && currentColumn && columns && hoveredCard) {
      const dropIndex = column.items.indexOf(hoveredCard);
      
      setBoardData((board) => {
        if (board) {
          
          const columnFrom = board.columnsData.find((col) => col.id === currentColumn.id);
          const columnTo = board.columnsData.find((col) => col.id === column.id);
          
          if (columnFrom && columnTo) {
            const currentCardIndex = columnFrom.items.indexOf(currentCard);
            columnFrom.items.splice(currentCardIndex, 1);

            columnTo.items.splice(dropIndex + 1, 0, currentCard);
            
            return {...board};
          }
        }
        return board;
      });

      
      dndCard(boardId, currentColumn.id, currentCard.id, column.id, dropIndex + 1, failFetchCallback);
    }

    const target = e.target;
    target.style.boxShadow = 'none';
  };

  const addCardHandler = async (column) => {
    const emptyCard = { ...cardEmptyTemplate, id: Date.now() };

    setBoardData((board) => {
      if (board) {
        
        const foundColumn = board.columnsData.find((col) => col.id === column.id);
        
        if (foundColumn) {
          foundColumn.items.push(emptyCard);
          
          return {...board};
        }
      }
      return board;
    });

    createCard(boardId, column.id, emptyCard, failFetchCallback);
  }

  return (
    <div className={styles.board}>
      <h1 className={styles.boardName}>{nameBoard}</h1>
      <div className={styles.columns}>
        {columns && columns.map(column => 
          <div key={column.id} className={styles.columnWrapper}>
            <h2 className={styles.columnTitle}>{column.title}</h2>
            <div 
              key={column.id}
              className={styles.column}
              onDragOver={(e) => dragOverHandler(e)}
              onDrop={(e) => dropCardHandler(e, column)}
            >
              
              {column.items.map(item => (
                <Card 
                  key={item.id}
                  card={item} 
                  column={column}
                  boardId={boardId}
                  failFetchCallback={failFetchCallback}
                  setCurrentColumn={setCurrentColumn}
                  setCurrentCard={setCurrentCard}
                  setHoveredCard={setHoveredCard}
                  setColumns={setColumns}
                  setBoardData={setBoardData}
                />
              ))}
              <div 
                className={styles.plusWrapper}
                onClick={() => addCardHandler(column)}
              >
                <Plus className={styles.plusIcon}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
