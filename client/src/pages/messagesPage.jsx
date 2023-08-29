import styled from "styled-components";
import axios from "axios"
import React, {useCallback, useEffect, useState} from "react";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001/',
})

const updateMessages = async () => await axiosInstance.get('/loadNewMessages')
const getMessages = async () => await axiosInstance.get('/messages')

function MessagesPage(){
    const [messages, setMessages] = useState([]);

    const updateMessagesArray = useCallback(async () => {
        const {data} = await getMessages();
        setMessages(data);
    }, [])

    useEffect(() => {
        updateMessages().then(() => updateMessagesArray())
    }, []);

  return (
      <PageContainer>
          {messages.map(({message}) => <MessageBlock>{message}</MessageBlock>)}
      </PageContainer>
  )

}

export default React.memo(MessagesPage);

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  background-color: #234a7a;
  padding: 30px 0;
`

const MessageBlock = styled.div`
  border: 1px solid black;
  border-radius: 10px;
  width: 600px;
  background-color: white;
  text-align: center;
  padding: 16px;
`