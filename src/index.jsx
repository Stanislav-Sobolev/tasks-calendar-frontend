import ReactDOM from 'react-dom/client';
import {App} from './App';
import './index.css';
import './assets/scss/colorVars.css';
import 'react-calendar/dist/Calendar.css';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <App/>
);