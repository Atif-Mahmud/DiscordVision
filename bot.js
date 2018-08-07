// Imports
var Discord = require('discord.js');
var logger = require('winston');
const auth = require('./auth.json');
const vision = require('@google-cloud/vision');
const wiki = require('wikijs').default;

// Embed
var embed = {
  "title": "",
  "description": "Brought to you by Google Cloud Vision and Wikipedia",
  "color": 16131707,
  "footer": {
    "icon_url": "https://i.imgur.com/phdXsV7.jpg",
    "text": "DiscordVision by Atif Mahmud"
  },
  "thumbnail": {
    "url": ""
  },
  "author": {
    "name": "DiscordVision",
    "url": "https://github.com/Atif-Mahmud",
    "icon_url": "https://i.imgur.com/phdXsV7.jpg"
  },
  "fields": [
    {
      "name": "Summary",
      "value": "Test"
    }
  ]
};

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
});

// Initialize Annotator Client
const client = new vision.ImageAnnotatorClient();

bot.on('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.tag);
});

bot.on('message', (message) => {
    if(message.content.includes('!dv')){
        if (message.attachments.size > 0) {
            if (message.attachments.every((a) => a.url.indexOf("png", a.url.length - 3) !== -1)) {
                
                updateEmbed(message.attachments.first().proxyURL, message.channel.id);

            } else if (message.attachments.every((a) => a.url.indexOf("jpeg", a.url.length - 4) !== -1)) {

                updateEmbed(message.attachments.first().proxyURL, message.channel.id);

            } else if (message.attachments.every((a) => a.url.indexOf("jpg", a.url.length - 3) !== -1)) {

                updateEmbed(message.attachments.first().proxyURL, message.channel.id);

            } else {

                message.channel.send("Sorry mate, no image to be found in that last message.")

            }
        }
    }
})

async function updateEmbed(url, id){
    let result = await getEmbed(url);
    updateTitle(result.title);
    updateImage(result.image);
    updateSummary(result.summary);
    updateURL(result.title);
    bot.channels.get(id).send({ embed });
}

async function getEmbed(url) {
    const description = client.labelDetection(url)
        .then(results => results[0].labelAnnotations[0].description)

    const page = description.then(description => {
            return wiki().find(description);
        })

    const image = page.then(page => page.mainImage())
        .catch(err => console.error(err));

    const summary = page.then(page => page.summary())
        .catch(err => console.error(err));

    return {
        title: await description,
        image: await image,
        summary: await summary
    }
}

function updateTitle(title) {
    embed.title = "**" + title.replace(/^\w/, c => c.toUpperCase()) + "**";
}

function updateImage(imageURL) {
    embed.thumbnail.url = imageURL;
}

function updateSummary(summary) {
    embed.fields[0].value = summary.substring(0, 1021) + '...';
}

function updateURL(title) {
    embed.url = "https://en.wikipedia.org/wiki/" + title;
}

bot.login(auth.token);