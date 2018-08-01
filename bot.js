const discord = require("discord.js");
const YTDL = require("ytdl-core");

const TOKEN = "NDc0MjQyNzYzMDY4ODAxMDU0.DkODdQ.Y1yiY3lXUVyCqL0xp63HyOamM00";
const PREFIX = "!";


function play(connection, message){
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"} ));

    server.queue.shift();

    server.dispatcher.on("end", function(){
        if(server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}


var bot = new discord.Client();

var servers = {};

bot.on("ready", function(){
    console.log("ready");
});

bot.on("message", function(message){
    if(message.author.equals(bot.user)) return;

    if(!message.content.startsWith(PREFIX)) return;
    
    var args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0].toLocaleLowerCase()){
        case "vapormusic":
            var embed = new discord.RichEmbed()
                .setTitle("Commands List For VaporMusic:")
                .setDescription("To add VaporMusic to a voice channel, first join the voice channel you want VaporMusic in, then type !add 'youtube link goes here' in the corresponding text channel")
                .addField("!add 'youtube link goes here'", "Adds a youtube video to the queue and plays only the audio when it's played")
                .addField("!skip", "Skips the playing song/video and plays the next song/video in the queue")
                .addField("!stop", "Stops all music, and the bot leaves the voice channel")
                .setColor(0xFF5A57)
            message.channel.sendEmbed(embed);
            break;
        case "add":
            if(!args[1]){
                message.channel.sendMessage("Please provide a link " + message.author);
                return;
            }

            if(!message.member.voiceChannel){
                message.channel.sendMessage("You must be in a voice channel");
                return;
            }

            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue : []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if(server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server = servers[message.guild.id];    

            if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            break;
        default:
            message.channel.sendMessage("Invalid command");
    }
});

bot.login(process.env.BOT_TOKEN);
