import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Board } from './Components/Board/Board';
import boardEmptyTemplate from './assets/json/boardEmptyTemplate.json';
import { createBoard, deleteBoard, getBoardById, updateBoardName } from './helpers/fetchers';

import styles from './App.module.scss';
import { Cross, Ok } from './Components/Icons';

export const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBoard, setFilteredBoard] = useState(null);
  const [nameBoard, setNameBoard] = useState('');
  const [idBoard, setIdBoard] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [idBoardCreating, setIdBoardCreating] = useState('');
  const [nameBoardCreating, setNameBoardCreating] = useState('');
  const [changedBoardName, setChangedBoardName] = useState('');
  const [actualInputValue, setActualInputValue] = useState('');
  const [actualInputPlaceholder, setActualInputPlaceholder] = useState('');
  

  useEffect(() => {
    fetchBoard('1');
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isCreating) {
      setActualInputValue(nameBoardCreating);
      setActualInputPlaceholder("New board name");
    }

    if (isEditing) {
      setActualInputValue(changedBoardName);
      setActualInputPlaceholder("Change board name");
    }

    if (!isCreating && !isEditing) {
      setActualInputValue(searchTerm);
      setActualInputPlaceholder("Search id board...");
    }
  }, [isCreating, isEditing, changedBoardName, nameBoardCreating, searchTerm]);

  const fetchBoard = async (defaultBoardId) => {
    try {
      const boardId = defaultBoardId ?? searchTerm;
      
      const fetchedBoard = await getBoardById(boardId);
    
      if (fetchedBoard) {
        setFilteredBoard(fetchedBoard);
        setNameBoard(fetchedBoard.name);
        setChangedBoardName(fetchedBoard.name);
        setIdBoard(fetchedBoard.id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const failFetchCallback = () => {
    toast.error('Sorry, try again');
    fetchBoard();
  };

  const handleBoardBtnClick = (key) => {
    switch (key) {
      case 'isCreating':
        setIsCreating(!isCreating);
        setIsEditing(false);
        setIsDeleting(false);
        break;
      case 'isEditing':
        setIsEditing(!isEditing);
        setIsCreating(false);
        setIsDeleting(false);
      break;
      case 'isDeleting':
        setIsDeleting(!isDeleting);
        setIsCreating(false);
        setIsEditing(false);
      break;
    
      default:
        break;
    }
  };

  const submitHandler = async () => {
    try {
      if (isCreating) {
        const createdBoard = await createBoard({...boardEmptyTemplate, id: idBoardCreating, name: nameBoardCreating});
        
        if (createdBoard) {
          setFilteredBoard(createdBoard);
          setNameBoard(createdBoard.name);
          setChangedBoardName(createdBoard.name);
          setIdBoard(createdBoard.id);
        }
        setSearchTerm('');
        setIsCreating(false);
      }

      if (isEditing && filteredBoard) {
        setNameBoard(changedBoardName);
        
        updateBoardName(filteredBoard.id, changedBoardName, failFetchCallback);
        
        setIsEditing(false);
      }

      if (isDeleting) {
        setFilteredBoard(null);
        deleteBoard(idBoard, failFetchCallback);
        setIsDeleting(false);        
      }

    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const cancelHandler = () => {
    if (isCreating) {      
      setIsCreating(false);
    }

    if (isEditing) {      
      setIsEditing(false);
    }

    if (isDeleting) {      
      setIsDeleting(false);      
    }    
  };

  const handleInputChange = (e) => {
    if (isCreating) {
      setNameBoardCreating(e.target.value);
    }

    if (isEditing) {
      setChangedBoardName(e.target.value);
    }

    if (!isCreating && !isEditing && !isEditing) {
      setSearchTerm(e.target.value)
    }
  }

  const renderButtons = () => (
    <div className={styles.createWrapper}>
      <button 
        className={isCreating ? styles.btnDisable : styles.btnCreate}
        onClick={() => handleBoardBtnClick('isCreating')}
      >
        Create
      </button>
      <button 
        className={isEditing ? styles.btnDisable : styles.btnEdit}
        onClick={() => handleBoardBtnClick('isEditing')}
      >
        Edit
      </button>
      <button 
        className={isDeleting ? styles.btnDisable : styles.btnDelete}
        onClick={() => handleBoardBtnClick('isDeleting')}
      >
        Delete
      </button>
    </div>
  );

  const renderIcons = () => !isCreating && !isEditing && !isDeleting  ? 
    (
      <button 
      className={styles.btn}
      onClick={() => fetchBoard()}
    >
      Load
    </button>
    ) : (
      <div className={styles.iconWrapper}>
        <div onClick={cancelHandler}>
          <Cross className={styles.crossIcon}/>
        </div>
        <div onClick={submitHandler}>
          <Ok className={styles.okIcon} />
        </div>
      </div>
  );

  const renderInput = () => (
    <>
    {isDeleting ?
      (<p className={styles.deleteText}>
          Do you want to delete current Board?
        </p>
      ) : (<input
        className={styles.input}
        type="text"
        placeholder={actualInputPlaceholder}
        value={actualInputValue}
        onChange={handleInputChange}
      />)
    }
    
    {isCreating &&
      <input
        className={styles.input}
        type="text"
        placeholder="ID Board"
        value={idBoardCreating}
        onChange={(e) => setIdBoardCreating(e.target.value)}
      />
    }
    </>
  );
 
  return (
    <div className={styles.app}>
      <ToastContainer />
      {renderButtons()}
      <div className={styles.searchPanel}>
        {renderInput()}
        {renderIcons()}
      </div>
      { filteredBoard && 
      <Board 
        boardData={filteredBoard}
        setBoardData={setFilteredBoard}
        nameBoard={nameBoard}
        failFetchCallback={failFetchCallback}
      />}
    </div>
  );
};
