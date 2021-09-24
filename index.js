const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const { output_formats } = require('libsodium-wrappers');
const client = new Discord.Client({ intents: ['GUILD_MESSAGES', 'GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_TYPING', 'GUILD_INTEGRATIONS'] });
const Distube = require('distube');
const distube = new Distube.default(client, {
    searchSongs: 1,
    searchCooldown: 30,
    leaveOnEmpty: true,
    emptyCooldown: 0,
    leaveOnFinish: true,
    leaveOnStop: true,
    emitNewSongOnly: true,
});
const { token } = require('./info.json');
const prefix = '*';

client.on('ready', () => {
    console.log('${client.user.tag} has logged in.');

});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content
        .slice(prefix.length);
        .trim();
        .split(/ +/g);
    //   .split(' ');
    const command = args.shift().toLowerCase();


    // Queue status template
    const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    // DisTube event listeners, more in the documentation page
    distube
        .on("playSong", (queue, song) => (
            queue.textChannel.send(
                `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user.tag}\n${status(queue)}`,
            ))
        .on("addSong", (queue, song) => (
            queue.textChannel.send(
                `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user.tag}`
        ))
        .on("playList", (queue, playlist, song) => queue.textChannel.send(
            `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user.tag}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
        ))
        .on("addList", (message, queue, playlist) => queue.textChannel.send(
            `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
        ))
        // DisTubeOptions.searchSongs = true
        .on("searchResult", (message, result) => {
            let i = 0;
            message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
        })
        // DisTubeOptions.searchSongs = true
        .once("searchCancel", (message) => message.channel.send(`Searching canceled`))
        .once('error', (channel, error) => (

        channel.send('An error encountered: ${error.slice(0, 1979)}') 
    )

    )))



    if (command == "play") {
        if (!message.member.voice.channel) return message.channel.send('You must join a voice channel first!');
        if (!args[0]) return message.channel.send('You must state something to play.');
        distube.play(message, args.join(''));
    }

    if (command == "stop") {
        const bot = message.guild.members.cache.get(client.user.id);
        if (!message.member.voice.channel) return message.channel.send('You must join a voice channel first!');
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send('You are not in the same voice channel as the bot.');
        distube.stop(message);
        message.channel.send('You have stopped the music.');
    }
    ;

    client.login(token);
});