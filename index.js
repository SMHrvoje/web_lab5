const express = require('express');
const path = require('path');
const fs = require("fs");
const fse = require('fs-extra');
const webpush = require('web-push');



const app = express();
const port = process.env.PORT || 3000;
const STORIES_PATH = "stories.json"

// Define the directory where your PWA files are located
const publicDirectoryPath = path.join(__dirname, 'public');

// Serve static files from the public directory
app.use(express.static(publicDirectoryPath));
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (typically for JSON data)
app.use(express.json());

// Route for the homepage
app.get('/', (req, res) => {
    // This route can serve an HTML file or render content dynamically
    // For a PWA, it might serve your index.html file
    res.sendFile(path.join(publicDirectoryPath, 'index.html'));
});
app.get("/stories", function (req, res) {
    try {
        // Your code to fetch and process data...
        let fileData = fs.readFileSync(STORIES_PATH, 'utf-8');
        let stories = JSON.parse(fileData); // Parsing the data as JSON
        //console.log(stories)
        res.setHeader('Content-Type', 'application/json'); // Set Content-Type header
        res.json({ "stories": stories }); // Respond with JSON data
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post("/saveStory",  async function (req, res) {
    console.log("post")
    console.log(req.body)
    try{
        const{title,story}=req.body
        console.log(title,story)
        let stories = JSON.parse(fs.readFileSync(STORIES_PATH));
        stories.push({title,story})
        fse.writeJsonSync(STORIES_PATH,stories)
        res.status(201).json({
            title:title
        })
        await sendPushNotifications(title);
    }
    catch (err){
        console.log(err)
        res.status(500).end()
    }
});
let subscriptions = [];
const SUBS_FILENAME = 'subscriptions.json';
try {
    subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
} catch (error) {
    console.error(error);
}

app.post("/saveSubscription", function(req, res) {
    console.log(req.body);
    let sub = req.body.sub;
    subscriptions.push(sub);
    fs.writeFileSync(SUBS_FILENAME, JSON.stringify(subscriptions));
    res.json({
        success: true
    });
});
async function sendPushNotifications(snapTitle) {
    webpush.setVapidDetails(
        'mailto:hrvoje.smontara@gmail.com',
        'BMGggaWcSgQVZwyccQn1HzSJtyYufRkHFkWwIqfSM8uCA-BEvvA_-NyKltsygvZTpT3THaj-mgzT_K5aeux3Eos',
        'u40CThKcVwwhlGyNM8YxDd61PxgROEEjBb0sYWp6Drs');
    for (const sub of subscriptions) {
        try {
            console.log("Sending notif to", sub);
            await webpush.sendNotification(sub, JSON.stringify({
                title: 'New story!',
                body: 'Somebody just added a new story: ' + snapTitle,
                redirectUrl: '/'
            }));
        } catch (error) {
            console.error(error);
        }
    }
}




// Start the server
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
