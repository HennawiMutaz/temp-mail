// import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ListItem from './components/ListItem';

function App() {
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState();
  const [showMessage, setShowMessage] = useState(false);
  const config = {
    headers:{}
  };
  const api = 'https://api.mail.gw';

  function copyText() {
    var copyText = document.getElementById("email");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
    const tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied!";
  }

  function resetTooltip() {
    const tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
  }

  async function getAllMessages() {
    config.headers.Authorization = `Bearer ${sessionStorage.getItem('token')}`
    const messages = await axios.get(`${api}/messages`, config);
    const sortedMessages = messages?.data['hydra:member'];
    setMessages(sortedMessages);
  }
  
  async function getMessage(id) {
    config.headers.Authorization = `Bearer ${sessionStorage.getItem('token')}`
    const response = await axios.get(`${api}/messages/${id}`, config);
    const message = response?.data;
    setCurrentMessage(message);
    document.querySelector('.email-txt').innerHTML = message?.html;
  }

  async function deleteAccount() {
    config.headers.Authorization = `Bearer ${sessionStorage.getItem('token')}`
    const response = await axios.delete(`${api}/accounts/${sessionStorage.getItem('id')}`, config);
    window.location.reload(false);
  }

  function animateRefresh() {
    const el = document.querySelector('.fa-redo-alt');
    el.style.transition = 'all 2s';
    el.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      el.style.transition = 'all 0s';
      el.style.transform = `rotate(0deg)`;
    }, 2000);
  }

  function countdown( elementName, minutes, seconds )
  {
    var element, endTime, hours, mins, msLeft, time;

    function twoDigits( n )
    {
        return (n <= 9 ? "0" + n : n);
    }

    function updateTimer()
    {
        msLeft = endTime - (+new Date);
        if ( msLeft < 1000 ) {
            element.innerHTML = "Time is up!";
            setTimeout(() => {
              window.location.reload(false);
            }, 3000);
        } else {
            time = new Date( msLeft );
            hours = time.getUTCHours();
            mins = time.getUTCMinutes();
            element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : mins) + ':' + twoDigits( time.getUTCSeconds() );
            setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
        }
    }

    element = document.getElementById( elementName );
    endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
    updateTimer();
}



useEffect(() => {
    async function fetchData() { 
      const response = await axios.get(`${api}/domains`);
          
      // const domainID = response?.data['hydra:member'][0].id;
      const id = new Date().getTime();
      const domain = response?.data['hydra:member'][0].domain;
      const address = `${id}@${domain}`;

      setEmail(address);

      const account = await axios.post(`${api}/accounts`, {
        address: address,
        password: 'random123'
      });
      const accountID = account?.data.id;
      sessionStorage.setItem("id", accountID);
      const auth = await axios.post(`${api}/token`, {
        address: address,
        password: 'random123'
      });
      
      const token = auth.data.token;
      sessionStorage.setItem("token", token);
    }

    fetchData();
    countdown( "countdown", 10, 0 );

    return () => {
      
    }
  }, [])
  

  return (
    <div className="App">
     <header className="wrapper">
        <h1>Your Temp Email Address</h1>
        <div className="email-box">
          <div className="email-content">
            <input contentEditable="false" type="text" id="email" className="email" value={email ? email : 'Loading...'} />
            <button className="copy-btn tooltip"  onClick={copyText} onMouseLeave={resetTooltip} >
              <span id="myTooltip" className="tooltiptext">Copy to clipboard</span>
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>
        <div id="countdown"></div>
     </header>

     <div className="inbox wrapper">
    <h2>Inbox</h2>
     <div className="controls">
      <button onClick={() => {getAllMessages(); animateRefresh()}}><i className="fas fa-redo-alt"></i>Refresh</button>
      <button onClick={deleteAccount}><i className="fas fa-pencil-alt"></i>Change Email Address</button>
     </div>
      <table className="styled-table" style={{display: showMessage ? 'none' : null}}>
          <thead>
              <tr>
                  <th>SENDER</th>
                  <th>SUBJECT</th>
                  <th>VIEW</th>
              </tr>
          </thead>
          <tbody>
          {messages.length > 0 ? messages.map((message) => ( 
              <ListItem key={message.id} message={message} func={() => {setShowMessage(true); getMessage(message.id)}} />
          )) 
          : (<tr>
              <td style={{textAlign: 'center'}} colSpan="3">No new mail</td>
            </tr>)}
          </tbody>
      </table>
      <div style={{display: showMessage ? null : 'none'}}>
        <div className="message-content">
          <div className="email-header">
            <p className="email-title">{`${currentMessage?.subject} - ${currentMessage?.from?.name}`}</p> 
          </div>
          <div className="sender-info">
          <strong><i className="fas fa-address-book"></i> Sender:</strong> <span>{currentMessage?.from?.address}</span>
          </div>
          <div className="email-txt"></div>
        </div>
        <button onClick={() => setShowMessage(false)}>back</button>
      </div>
     </div>

    
    </div>
  );
}

export default App;
