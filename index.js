process.env=require("./env.json");
const twilioClient = require('twilio')(process.env.twilioSid, process.env.twilioToken);
function sendText(toWhom,what){
    twilioClient.messages.create({
        body: what.replaceAll("<","\\<"),
        from: twilio.num,
        to: toWhom
    });
}
function makeCall(toWhom,what){
    fs.writeFileSync("./static/msg.xml",`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man">${what.replaceAll("<","\\<")}</Say>
</Response>`);
    twilioClient.calls.create({
        url:process.env.hostedUrl+"/msg.xml",
        method:"GET",
        to:toWhom,
        from:twilio.num
    })
}
const {Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, Partials, ActivityType}=require("discord.js");
const fs=require("fs");
const express=require("express");
const path=require("path");
const site=new express();
site.listen(80);
site.use(express.static(path.join(__dirname,"./static")));
const storage=require("./storage.json");
function save(){
    fs.writeFileSync("./storage.json",JSON.stringify(storage));
}

const defaultMii={
    info: {
      creatorName: '',
      name: 'Default',
      gender: 'Male',
      mingle: true,
      birthMonth: 0,
      birthday: 0,
      favColor: 'Red',
      favorited: false,
      height: 64,
      weight: 64,
      downloadedFromCheckMiiOut: false,
      type:"Normal"
    },
    face: { shape: 0, col: 'White', feature: 'None' },
    nose: { type: 0, size: 4, vertPos: 9 },
    mouth: { type: '111', col: 'Peach', size: 4, yPos: 13 },
    mole: { on: false, size: 4, xPos: 2, yPos: 20 },
    hair: { type: '111', col: 'Brown', flipped: false },
    eyebrows: {
      type: '111',
      rotation: 6,
      col: 'Brown',
      size: 4,
      yPos: 10,
      distApart: 2
    },
    eyes: {
      type: '111',
      rotation: 4,
      yPos: 12,
      col: 'Black',
      size: 4,
      distApart: 2
    },
    glasses: { type: 0, col: 'Grey', size: 4, yPos: 10 },
    facialHair: {
      mustacheType: 0,
      beardType: 0,
      col: 'Black',
      mustacheSize: 4,
      mustacheYPos: 10
    },
    name: 'Default',
    creatorName: ''
};
const defaultInvite={//Indexed under inviteId
    "uses":0,
    "createdBy":"",
};
const defaultGuild={
    "filter":{
        "blacklist":[],
        "active":false,
        "censor":true,
        "log":true,
        "channel":"",
        "whitelist":[]
    },
    "starboard":{
        "channel":"",
        "emoji":"⭐",
        "active":false,
        "threshold":3
    },
    "logs":{
        "channel":"",
        "active":"",
        "events":{
            "channel":false,
            "user":false,
            "server":false,
            "pins":false,
            "emojis":false,
            "events":false,
            "invites":false,
            "roles":false
        }
    },
    "plugins":{
        "entertainment":true,
        "social":true,
        "informational":true,
        "miis":true,
        "goombaSquad":true,
        "ai":true
    },
    "counting":{
        "active":false,
        "channel":"",
        "nextNum":1,
        "highestNum":0,
        "legit":true, //If manually setting the next number, disqualify from the overarching leaderboard
        "reset":true
    },
    "users":{},
    "reactionRoles":[],
    "invites":[]
};
const defaultGuildUser={
    "infractions":0,
    "stars":0,
    "invited":0
};
const defaultUser={
    "offenses":0,
    "goombaSquad":{
        "wins":0,
        "losses":0,
        "draws":0,
        "cards":[],
        "chose":null,
        "playing":null
    },
    "mii":structuredClone(defaultMii)
};

const client=new Client({
    intents:Object.keys(GatewayIntentBits).map(a=>{return GatewayIntentBits[a]}),
    partials:Object.keys(Partials).map(a=>{return Partials[a]})
});
function notify(urgencyLevel,what){
    switch(urgencyLevel){
        default:
        case 0:
            client.users.cache.get(process.env.ownerId).send(what);//Notify Kestron06 directly
        break;
        case 1:
            client.channels.cache.get(process.env.noticeChannel).send(what);//Notify the staff of the Kestron Support server
        break;
        case 2:
            sendText(what);//Text Kestron06
        break;
        case 3:
            makeCall(what);//Call Kestron06
        break;
    }
}
var uptime=0;
client.once("ready",()=>{
    uptime=Math.round(Date.now()/1000);
    notify(0,`Started <t:${uptime}:R>`);
    console.log(`Logged Stewbot handles into ${client.user.tag}`);
    save();
    client.user.setActivity("S omething T o E xpedite W ork",{type:ActivityType.Custom},1000*60*60*24*31*12);
});
client.on("messageCreate",async msg=>{
    if(msg.author.id===client.user.id) return;
    msg.guildId=msg.guildId||"0";
    if(msg.guildId!=="0"){
        if(!storage.hasOwnProperty(msg.guildId)){
            storage[msg.guildId]=structuredClone(defaultGuild);
            save();
        }
        if(!storage[msg.guildId].users.hasOwnProperty(msg.author.id)){
            storage[msg.guildId].users[msg.author.id]=structuredClone(defaultGuildUser);
            save();
        }
    }
    if(!storage.hasOwnProperty(msg.author.id)){
        storage[msg.author.id]=structuredClone(defaultUser);
        save();
    }
    if(storage[msg.guildId].filter.active===true){
        var foundOne=false;
        storage[msg.guildId].filter.blacklist.forEach(blockedWord=>{
            if(new RegExp(`([^\\D]|\\b)${blockedWord}(ing|s|ed|er|ism|ist)*([^\\D]|\\b)`,"ig").test(msg.content)){
                foundOne=true;
                msg.content=msg.content.replace(new RegExp(`([^\\D]|\\b)${blockedWord}(ing|s|ed|er|ism|ist)*([^\\D]|\\b)`,"ig"),"[\_]");
            }
        });
        if(foundOne){
            storage[msg.guildId].users[msg.author.id].infractions++;
            msg.delete();
            msg.channel.send(`\`\`\`\nThe following message from ${msg.author.username} has been censored by Stewbot.\`\`\`\n${msg.content}`);
            return;
        }
    }
});
client.on("interactionCreate",async cmd=>{
    try{
        if(cmd.guild.id!==0){
            if(!cmd.guild.id in storage){
                storage[cmd.guild.id]=structuredClone(defaultGuild);
                save();
            }
            if(!cmd.user.id in storage[cmd.guild.id].users){
                storage[cmd.guild.id].users[cmd.user.id]=structuredClone(defaultGuildUser);
                save();
            }
        }
    }
    catch(e){
        cmd.guild={"id":"0"};
    }
    if(!cmd.user.id in storage){
        storage[cmd.user.id]=structuredClone(defaultUser);
        save();
    }
    //Slash Commands
    switch(cmd.commandName){
        case 'ping':
            cmd.reply(`**Online**\n- Latency: ${client.ws.ping} milliseconds\n- Last Started: <t:${uptime}:f>, <t:${uptime}:R>\n- Uptime: ${((Math.round(Date.now()/1000)-uptime)/(1000*60*60)).toFixed(2)} hours`);
        break;
        case 'no_swear':
            if(storage[cmd.guild.id].filter.blacklist.includes(cmd.options.getString("word"))){
                cmd.reply({"ephemeral":true,"content":`The word ||${cmd.options.getString("word")}|| is already in the blacklist.${storage[cmd.guild.id].filter.active?"":"To begin filtering in this server, use `/filter_config`."}`});
            }
            else{
                storage[cmd.guild.id].filter.blacklist.push(cmd.options.getString("word"));
                cmd.reply(`Added ||${cmd.options.getString("word")}|| to the filter for this server.${storage[cmd.guild.id].filter.active?"":`\n\nThe filter for this server is currently disabled. To enable it, use \`/filter_config\`.`}`);
                save();
            }
        break;
        case 're_swear':
            if(storage[cmd.guild.id].filter.blacklist.includes(cmd.options.getString("word"))){
                storage[cmd.guild.id].filter.blacklist.splice(storage[cmd.guild.id].filter.blacklist.indexOf(cmd.options.getString("word")),1);
                cmd.reply(`Alright, I have removed ||${cmd.options.getString("word")}|| from the filter.`);
                save();
            }
            else{
                cmd.reply(`I'm sorry, but I don't appear to have that word in my blacklist. Are you sure you're spelling it right? You can use \`/view_filter\` to see all filtered words.`);
            }
        break;
        case 'view_filter':
            if(storage[cmd.guild.id].filter.blacklist.length>0){
                cmd.reply({"content":`**Warning!** There is no guarantee what kinds of words may be in the blacklist. There is a chance it could be heavily dirty. To continue, press the button below.`,"components":[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('view_filter').setLabel('DM me the blacklist').setStyle(ButtonStyle.Danger))]});
            }
            else{
                cmd.reply(`This server doesn't have any words blacklisted at the moment. To add some, you can use \`/no_swear\`.`);
            }
        break;
        case 'filter_config':
            storage[cmd.guild.id].filter.active=cmd.options.getBoolean("active");
            if(cmd.options.getBoolean("censor")!==null) storage[cmd.guild.id].filter.censor=cmd.options.getBoolean("censor");
            if(cmd.options.getBoolean("log")!==null) storage[cmd.guild.id].filter.log=cmd.options.getBoolean("log");
            if(cmd.options.getChannel("channel")!==null) storage[cmd.guild.id].filter.log=cmd.options.getChannel("channel");
            if(storage[cmd.guild.id].filter.channel==="") storage[cmd.guild.id].filter.log=false;
            cmd.reply(`Filter configured.${(cmd.options.getBoolean("log")&&!storage[cmd.guild.id].filter.log)?"\n\nNo channel was set to log summaries of deleted messages to, so logging these is turned off. To reenable this, run the command again and set `log` to true and specify a channel.":""}`);
            save();
        break;
    }
    //Buttons
    switch(cmd.customId){
        case "view_filter":
            cmd.user.send({"content":`The following is the blacklist for **${cmd.guild.name}** as requested.\n\n||${storage[cmd.guild.id].filter.blacklist.join("||, ||")}||`,"components":[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("delete-all").setLabel("Delete message").setStyle(ButtonStyle.Success))]});
            cmd.deferUpdate();
        break;
        case "delete-all":
            cmd.message.delete();
        break;
    }
});

client.on("rateLimit",async d=>{
    notify(1,"Ratelimited -\n\n"+d);
});
client.on("guildCreate",async guild=>{
    storage[guild.id]=structuredClone(defaultGuild);
    notify(1,"Added to a new server! "+guild.name);
    save();
});

client.login(process.env.token);