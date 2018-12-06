const Command = require('../../structures/Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { shorten } = require('../../util/Utils.js');
const { TMDB_KEY } = process.env;

module.exports = class MovieCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'movie',
            aliases: ['tmdb', 'imdb'],
            group: 'search',
            memberName: 'movie',
            description: 'Searches TMDB for your query, getting movie results.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'query',
                    prompt: 'What movie would you like to search for?',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { query }) {
        const sentMsg = await msg.reply(':hourglass: Getting wikipedia info, please wait...');

        try {
            const params = [
                `api_key=${TMDB_KEY}`,
                `include_adult=${msg.channel.nsfw || false}`,
                `query=${encodeURI(query)}`
            ];

            let res = await fetch('http://api.themoviedb.org/3/search/movie?' + params.join('&'));
            let body = await res.json();

            if(!body.results.length)
                return sentMsg.edit("Didn't find anything... :frowning:");

            res = await fetch(`https://api.themoviedb.org/3/movie/${body.results[0].id}?api_key=${TMDB_KEY}`);
            body = await res.json();

            return sentMsg.edit(
                `:cinema: __**${body.title}**__ :cinema:` +
                `\n**Description**:` +
                '```' +
                (body.overview ? shorten(body.overview) : 'No description available.') +
                '```' +
                '**Runtime**: ' + (body.runtime ? `${body.runtime} mins.` : '???') +
                '\n**Release Date**: ' + (body.release_date || '???') +
                '\n**Genres**: ' + (body.genres.length ? body.genres.map(genre => genre.name).join(', ') : '???') +
                '\n**Production Companies**: ' +
                (body.production_companies.length ? body.production_companies.map(c => c.name).join(', ') : '???') +
                `\n**Source**: https://www.themoviedb.org/movie/${body.id}`
            );
        } catch (err) {
            return sentMsg.edit(`**Whoops! Something went wrong!**\n\`${err.message}\``);
        }
    }
};