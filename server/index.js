const express = require('express');
const { createServer } = require("http");
const axios = require('axios')
const cors = require('cors')
const {MongoClient} = require("mongodb");
const schedule = require('node-schedule');

const app = express();
app.use(cors());
const httpServer = createServer(app);

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const chatDB = client.db('messages');
const alexMessages = chatDB.collection('alexMessages');
const lastUpdateIdCollection = chatDB.collection('lastUpdateId');

const axiosInstance = axios.create({
    baseURL: `https://api.telegram.org/${process.env.BOT_TOKEN}`,
});

async function getBotResponse(data){
    return await axiosInstance.get("/getUpdates", {data});
}

async function createRequestData(){
    const lastUpdateId = await lastUpdateIdCollection.findOne();

    return lastUpdateId ? {offset:  lastUpdateId.updateId, allowed_updates: "messages" } : {allowed_updates: "messages" }
}

async function updateLastUpdateId(updateId) {
    const lastUpdateId = await lastUpdateIdCollection.findOne();

    if(lastUpdateId){
        await lastUpdateIdCollection.replaceOne(lastUpdateId, {updateId: updateId + 1})
    } else {
        await lastUpdateIdCollection.insertOne({updateId: updateId + 1})
    }
}

async function setMessages(botResponse) {
    const newMessages = botResponse.data.result.reduce((prev, current) => {
        if(current.message.from.id === process.env.USER_ID){
            prev.push({message: current.message.text})
        }
        return prev
    }, [] )
    await alexMessages.insertMany(newMessages)
}

async function loadNewMessagesJob(){
    const requestData = await createRequestData();

    const botResponse = await getBotResponse(requestData);

    const lastUpdateId = botResponse.data.result[botResponse.data.result.length - 1]?.update_id;

    if(!lastUpdateId){
        return;
    }

    await updateLastUpdateId(botResponse.data.result[botResponse.data.result.length - 1].update_id)

    await setMessages(botResponse)
}

async function getMessages(req, res) {
    const responseMessages = await alexMessages.find({}).toArray();

    res.send(responseMessages.map(({message}) => ({message})))
}

app.get('/loadNewMessages', async (req, res) =>  {
    const requestData = await createRequestData();

    const botResponse = await getBotResponse(requestData);

    const lastUpdateId = botResponse.data.result[botResponse.data.result.length - 1]?.update_id;

    if(!lastUpdateId){
        res.send({message: 'ok'});
        return;
    }

    await updateLastUpdateId(botResponse.data.result[botResponse.data.result.length - 1].update_id)

    await setMessages(botResponse)

    res.send({message: 'ok'});

})

app.get('/messages', getMessages)

schedule.scheduleJob("* * */22 * *", loadNewMessagesJob)


httpServer.listen(3001, 511, () => {console.log('Running on 3001')});