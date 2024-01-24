import { useState } from 'react';
import { toast } from 'react-toastify';

import Calendar from 'react-calendar';
import Moment from 'react-moment';
import { Edit, Delete, Ok, Cross } from '../Icons';
import { deleteCard, updateCard } from '../../helpers/fetchers';

import styles from './Card.module.scss';

export const Card = ({ card, column, boardId, failFetchCallback, setCurrentColumn, setCurrentCard, setHoveredCard, setColumns, setBoardData }) => {
  const { id: cardId } = card;
  const { id: columnId } = column;

  const [title, setTitle] = useState(card.title);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const [isEditing, setEditing] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(card.calendarDate));

  const classNamesToStyle = [styles.card, styles.cardDescription, styles.cardTitle, styles.iconWrapper, styles.editIcon, styles.deleteIcon];
  const elementById = document.getElementById(`${cardId}`);

  const dragStartHandler = (column) => {
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
    setOriginalTitle(title);
    setOriginalDescription(description);
    setEditing(true);
  }

  const saveUpdateCardHandler = async () => {
    if (title && description && calendarDate) {
      console.log(title, description, calendarDate)
      setBoardData(board => {
        if (board) {
          
          const column = board.columnsData.find((col) => col.id === columnId);
          
          if (column) {
            const cardIndex = column.items.findIndex((c) => c.id === cardId);
  
            if (cardIndex !== -1) {
              column.items[cardIndex] = { title, description, calendarDate, id: cardId };
              return {...board};
            }
          }
        }
        return board;
      });
  
      updateCard(boardId, columnId, cardId, {id: cardId, title, description, calendarDate: calendarDate.getTime() }, failFetchCallback);
  
      setEditing(false);
    } else {
      toast.error('Please, fill Title, Description and CalendarDate');
    }
  }

  const cancelHandler = () => {
    setTitle(originalTitle);
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
      <div className={styles.editWrapper}>
        <input
          className={styles.cardTitleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={styles.cardDescriptionInput}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Calendar 
          className={styles.calendar}
          onChange={setCalendarDate} 
          value={calendarDate}
          locale={'en-EN'}
        /> 
        <div className={styles.iconWrapper}>
          <div onClick={cancelHandler}>
            <Cross className={styles.crossIcon}/>
          </div>
          <div onClick={saveUpdateCardHandler}>
            <Ok className={styles.okIcon} />
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardDescription}>{description}</span>
      <div className={styles.bottomWrapper}>
        <Moment className={styles.cardDate} format="DD.MM.YYYY">
          {calendarDate}
        </Moment>
        <div className={styles.iconWrapper}>
          <div onClick={editHandler}>
            <Edit className={styles.editIcon} />
          </div>
          <div onClick={deleteHandler}>
            <Delete className={styles.deleteIcon} />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      id={`${cardId}`}
      className={styles.card}
      draggable={!isEditing}
      onDragStart={() => dragStartHandler(column)}
      onDragLeave={(e) => dragLeaveHandler(e)}
      onDragEnd={(e) => dragLeaveHandler(e)}
      onDragOver={(e) => dragOverHandler(e)}
      onDrop={(e) => dropHandler(e)}
    >
      {renderContent()}
    </div>
  );
};
