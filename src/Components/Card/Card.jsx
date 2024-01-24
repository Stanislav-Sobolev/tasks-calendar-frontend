import { useState } from 'react';

import { Edit, Delete, Ok, Cross } from '../Icons';
import { deleteCard, updateCard } from '../../helpers/fetchers';

import styles from './Card.module.scss';

export const Card = ({ card, column, boardId, failFetchCallback, setCurrentColumn, setCurrentCard, setHoveredCard, setColumns, setBoardData }) => {
  const { id: cardId } = card;
  const { id: columnId } = column;

  const [text, setText] = useState(card.text);
  const [originalText, setOriginalText] = useState(card.text);
  const [description, setDescription] = useState(card.description);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const [isEditing, setEditing] = useState(false);

  const classNamesToStyle = [styles.card, styles.cardDescription, styles.cardText, styles.iconWrapper, styles.editIcon, styles.deleteIcon];
  const elementById = document.getElementById(`${cardId}`);

  const dragStartHandler = (e, column, itcardem) => {
    setCurrentColumn(column);
    setCurrentCard(card);
  }

  const dragLeaveHandler = (e) => {
    const target = e.target;
    
    if (classNamesToStyle.includes(target.className) && elementById) {
      elementById.style.boxShadow = 'none';
    }
  };
  

  const dragOverHandler = (e) => {
    e.preventDefault();
    const target = e.target;
    
    if (classNamesToStyle.includes(target.className) && elementById) {
      setHoveredCard(card);
      elementById.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
    }
  }

  const dropHandler = (e) => {
    e.preventDefault();
    const target = e.target;

    if (classNamesToStyle.includes(target.className) && elementById) {
      elementById.style.boxShadow = 'none';
    }
  }

  const editHandler = () => {
    setOriginalText(text);
    setOriginalDescription(description);
    setEditing(true);
  }

  const saveUpdateHandler = async () => {
    setBoardData((board) => {
      if (board) {
        
        const column = board.columnsData.find((col) => col.id === columnId);
        
        if (column) {
          const cardIndex = column.items.findIndex((c) => c.id === cardId);

          if (cardIndex !== -1) {
            column.items[cardIndex] = { text, description, id: cardId };
            return {...board};
          }
        }
      }
      return board;
    });

    updateCard(boardId, columnId, cardId, {id: cardId, text, description }, failFetchCallback);

    setEditing(false);
  }

  const cancelHandler = () => {
    setText(originalText);
    setDescription(originalDescription);
    setEditing(false);
  }

  const deleteHandler = async () => {
    setBoardData((board) => {
      if (board) {
        
        const column = board.columnsData.find((col) => col.id === columnId);
        
        if (column) {
          const cardIndex = column.items.findIndex((c) => c.id === cardId);

          if (cardIndex !== -1) {
            column.items.splice(cardIndex, 1);
            return {...board};
          }
        }
      }
      return board;
    });

    deleteCard(boardId, columnId, cardId, failFetchCallback);
  }

  const renderContent = () => isEditing ? (
    <>
      <input
        className={styles.cardTextInput}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        className={styles.cardDescriptionInput}
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className={styles.iconWrapper}>
        <div onClick={cancelHandler}>
          <Cross className={styles.crossIcon}/>
        </div>
        <div onClick={saveUpdateHandler}>
          <Ok className={styles.okIcon} />
        </div>
      </div>
    </>
  ) : (
    <>
      <span className={styles.cardText}>{text}</span>
      <span className={styles.cardDescription}>{description}</span>
      <div className={styles.iconWrapper}>
        <div onClick={editHandler}>
          <Edit className={styles.editIcon} />
        </div>
        <div onClick={deleteHandler}>
          <Delete className={styles.deleteIcon} />
        </div>
      </div>
    </>
  );

  return (
    <div
      id={`${cardId}`}
      className={styles.card}
      draggable={!isEditing}
      onDragStart={(e) => dragStartHandler(e, column, card)}
      onDragLeave={(e) => dragLeaveHandler(e)}
      onDragEnd={(e) => dragLeaveHandler(e)}
      onDragOver={(e) => dragOverHandler(e)}
      onDrop={(e) => dropHandler(e)}
    >
      {renderContent()}
    </div>
  );
};
