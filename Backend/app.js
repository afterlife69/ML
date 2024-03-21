import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import bodyParser from "body-parser";
import User from "./schemas/user.js";
import axios from 'axios';
import OpenAI from "openai";
import emotions from './schemas/emotions.js'
const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb+srv://harshith:keori69@cluster0.pmkoubt.mongodb.net/bootcamp?retryWrites=true&w=majority")
.then(()=>app.listen(6969))
.then(()=>console.log('connected'))
.catch((err)=>console.log(err));

const openai = new OpenAI({
    apiKey: '',
});
// login
app.post('/login', (req,res,next) => {
    console.log('worked')
    const {username, password} = req.body;
    User.findOne({username : username}).then((response) =>{
        if(response.password == password)return res.status(200).send('Successful');
        else res.send(500).send('invalid password');
    }).catch((err) =>{
        res.status(404).send('error');
    });
})

//register
app.post('/signup', (req,res,next) => {
    const {name,email,username,password,confirmPassword} = req.body
    let user = new User({
        name,
        email,
        username,
        password
    })
    user.save().then((user) => {
        res.status(200).json({user})
    }).catch((err) => {
        res.status(400).json({err})
    })
})

// text analysis 
app.post('/text', (req,res,next) => {
    const {url,data,headers} = req.body
    axios.post(url,data,{headers}).then((response) => {
        // console.log(response);
        res.status(200).json(response.data[0])
    }).catch(error => {
        res.status(400).json({error});
    });
})

//chat bot
const threadByUser = {}
app.post('/chatbot', async (req,res,next) => {


    console.log('chat bot activateddddd')
    const assistantIdToUse = "asst_FoQb7HpphIeBpcVFH2nNpFLE"; // Replace with your assistant ID
    const modelToUse = "gpt-3.5-turbo-16k"; // Specify the model you want to use
    const userId = req.body.userId; // You should include the user ID in the request

    // Create a new thread if it's the user's first message
    if (!threadByUser[userId]) {
        try {
        const myThread = await openai.beta.threads.create();
        console.log("New thread created with ID: ", myThread.id, "\n");
        threadByUser[userId] = myThread.id; // Store the thread ID for this user
        } catch (error) {
        console.error("Error creating thread:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
        }
    }

    const userMessage = req.body.message;

    // Add a Message to the Thread
    try {
        const myThreadMessage = await openai.beta.threads.messages.create(
        threadByUser[userId], // Use the stored thread ID for this user
        {
            role: "user",
            content: userMessage,
        }
        );
        console.log("This is the message object: ", myThreadMessage, "\n");

        // Run the Assistant
        const myRun = await openai.beta.threads.runs.create(
        threadByUser[userId], // Use the stored thread ID for this user
        {
            assistant_id: assistantIdToUse,
            instructions: "you are a friend that helps with user's mental health, try to make the user happy add some jokes to your response to make the conversation funny, ask the user what is up ,you will have the mental health data provided and your responsibility is to respond according to the data and comfort the user, just respond to the user_prompt thats it and reply in under 2 lines", // Your instructions here
            tools: [
            { type: "code_interpreter" }, // Code interpreter tool
            ],
        }
        );
        console.log("This is the run object: ", myRun, "\n");

        // Periodically retrieve the Run to check on its status
        const retrieveRun = async () => {
        let keepRetrievingRun;

        while (myRun.status !== "completed") {
            keepRetrievingRun = await openai.beta.threads.runs.retrieve(
            threadByUser[userId], // Use the stored thread ID for this user
            myRun.id
            );

            console.log(`Run status: ${keepRetrievingRun.status}`);

            if (keepRetrievingRun.status === "completed") {
            console.log("\n");
            break;
            }
        }
        };
        retrieveRun();

        // Retrieve the Messages added by the Assistant to the Thread
        const waitForAssistantMessage = async () => {
        await retrieveRun();

        const allMessages = await openai.beta.threads.messages.list(
            threadByUser[userId] // Use the stored thread ID for this user
        );

        // Send the response back to the front end
        res.status(200).json({
            message: allMessages.data[0].content[0].text.value,
        });
        console.log(
            "------------------------------------------------------------ \n"
        );

        console.log("User: ", myThreadMessage.content[0].text.value);
        console.log("Assistant: ", allMessages.data[0].content[0].text.value);
        };
        waitForAssistantMessage();
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/updateE', (req, res, next) => {
    let data;
    console.log(req.body);
    emotions.find().then((result) => {
        data = result[0];
        console.log(data);
        let newData = {
            HAPPY: (req.body.HAPPY + data.HAPPY) / 2,
            SAD: (req.body.SAD + data.SAD) / 2,
            ANGRY: (req.body.ANGRY + data.ANGRY) / 2,
            CALM: (req.body.CALM + data.CALM) / 2,
            DISGUSTED: (req.body.DISGUSTED + data.DISGUSTED) / 2,
            FEAR: (req.body.FEAR + data.FEAR) / 2,
            SURPRISED: (req.body.SURPRISED + data.SURPRISED) / 2,
            CONFUSED: (req.body.CONFUSED + data.CONFUSED) / 2
        };
        console.log("newData")
        console.log(newData)
        // Update the current document with the mean of old and new data
        emotions.updateOne({ _id: data._id }, { $set: newData }).then((result) => {
            console.log('updated')
            res.status(200).json(result);
        }).catch((err) => {console.log('error'); res.status(400).json(err)});
    }).catch((err) => res.status(400).json(err));
});

app.get('/emotions',(req,res,next)=>{
    console.log('worked')
    let data
    emotions.find().then((result)=>{
        data = result
        console.log(data)
        res.status(200).json(data)
    }).catch((err)=>res.send(400).json(err))
})