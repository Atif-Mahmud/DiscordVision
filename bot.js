// Imports
var Discord = require('discord.js');
var logger = require('winston');
const auth = require('./auth.json');
const vision = require('@google-cloud/vision');
const wiki = require('wikijs').default;
var GphApiClient = require('giphy-js-sdk-core');
gif = GphApiClient(auth.gif);

// Embed
var embed = {
  "title": "",
  "description": "Brought to you by *Google Cloud Vision* and *Wikipedia*",
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

            } else if (message.attachments.every((a) => a.url.indexOf("PNG", a.url.length - 3) !== -1)) {

                updateEmbed(message.attachments.first().proxyURL, message.channel.id);

            } else if (message.attachments.every((a) => a.url.indexOf("JPEG", a.url.length - 3) !== -1)) {

                updateEmbed(message.attachments.first().proxyURL, message.channel.id);

            } else if (message.attachments.every((a) => a.url.indexOf("JPG", a.url.length - 3) !== -1)) {

                updateEmbed(message.attachments.first().proxyURL, message.channel.id);

            } else {

                message.channel.send("Sorry mate, no image to be found in that last message.")
                message.channel.send("Try using `!dv help` for appropriate usage.")

            }
        }

        if (message.content.includes('search')) {
            let param = message.content.substring(10)
            gif.search('gifs', { "q": param , "limit": 1})
                .then((response) => {
                    response.data.forEach((gifObject) => {
                        message.channel.send({
                            embed: {
                                "title": "**" + param.replace(/^\w/, c => c.toUpperCase()) + "**",
                                "description": "Brought to you by *Giphy*",
                                "color": 16131707,
                                "footer": {
                                    "icon_url": "https://i.imgur.com/phdXsV7.jpg",
                                    "text": "DiscordVision by Atif Mahmud"
                                },
                                "author": {
                                    "name": "DiscordVision",
                                    "url": "https://github.com/Atif-Mahmud",
                                    "icon_url": "https://i.imgur.com/phdXsV7.jpg"
                                },
                                "image": {
                                    "url": gifObject.images.original.gif_url
                                },
                                "fields": [
                                    {
                                        "name": "Source",
                                        "value": gifObject.source
                                    },
                                    {
                                        "name": "Rating",
                                        "value": gifObject.rating
                                    }
                                ]
                            }
                        });
                    });
                })
                .catch((err) => {
                    message.channel.send("Oops! Something went wrong. Sorry :sweat_smile:");
                    console.error(err);
                })
        }

        if (message.content.includes('help')) {
            message.channel.send({
                embed: {
                    "title": "** DiscordVision HELP **",
                    "description": "DiscordVision is a machine vision and image search app for discord!",
                    "color": 16131707,
                    "footer": {
                        "icon_url": "https://i.imgur.com/phdXsV7.jpg",
                        "text": "DiscordVision by Atif Mahmud"
                    },
                    "author": {
                        "name": "DiscordVision",
                        "url": "https://github.com/Atif-Mahmud",
                        "icon_url": "https://i.imgur.com/phdXsV7.jpg"
                    },
                    "fields": [
                        {
                            "name": "Image Classification :mag:",
                            "value": "To classify any image, upload it to any channel with the caption `!dv`. DiscordVision will try its best to figure out what it is and give you a summary."
                        },
                        {
                            "name": "Gif Searching :frame_photo:",
                            "value": "To look for an appropriate gif to match the current mood, use `!dv search [query parameter]` and DiscordVision will find the best gif it can."
                        }
                    ]
                }
            })
        }
    }
})

async function updateEmbed(url, id){
    let result = await getEmbed(url, id);
    updateTitle(result.title);
    updateImage(result.image);
    updateSummary(result.summary);
    updateURL(result.title);
    bot.channels.get(id).send({ embed });
}

async function getEmbed(url, id) {
    const description = client.labelDetection(url)
        .then(results => results[0].labelAnnotations[0].description)
        .catch(err => bot.channel.get(id).send("Uh oh, I'm not quite sure what that is... sorry :sweat_smile:"));

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