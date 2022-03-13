/* eslint-disable camelcase */
import Discord from 'discord.js';
import fileSystem from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const client = new Discord.Client();

const config = require('../config.json');

const ServerId = [];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.channels.cache.forEach(element => {
    if (element.type === 'text') {
      if (!config.ServerBlacklist.includes(element.guild.id)) {
        ServerId.push(element.id);
      }
    }
  });

  await FetchMessage();
});

async function FetchMessage () {
  const ChannelData = client.channels.cache.get(ServerId[0]);
  console.log(`[${ServerId.length}] Server: ${ChannelData.guild.name} [${ChannelData.guild.id}] Channel: ${ChannelData.name} [${ChannelData.id}]`);

  const sum_messages = [];
  let last_id;

  while (true) {
    console.log(sum_messages.length);
    const options = { limit: 100 };
    if (last_id) { options.before = last_id; }

    const messages = await ChannelData.messages.fetch(options);
    sum_messages.push(...messages.array());

    try {
      last_id = messages.last().id;
    } catch (error) {
      console.log(`Done for: ${ChannelData.name} [${ChannelData.id}]`);

      ServerId.splice(ServerId.indexOf(ServerId[0]), 1);
      return BoucleFetch();
    }

    sum_messages.forEach(async (element) => {
      if (element.content.length >= 1) {
        const PathMessage = `./Data/${ChannelData.guild.id}`;

        if (!fileSystem.existsSync(PathMessage)) { fileSystem.mkdirSync(PathMessage, { recursive: true }); }

        fileSystem.appendFileSync(`${PathMessage}/msg_${ChannelData.id}.txt`,
         `Server: ${ChannelData.guild.name} [${ChannelData.guild.id}] Channel: ${ChannelData.name} [${ChannelData.id}] Message: ${element.content}` + '\r\n');
      }

      if (element.attachments.map((v) => v.url.length) >= 1) {
        const PathAttachements = `./Data/${ChannelData.guild.id}`;

        if (!fileSystem.existsSync(PathAttachements)) { fileSystem.mkdirSync(PathAttachements, { recursive: true }); }

        fileSystem.appendFileSync(`${PathAttachements}/att_${ChannelData.id}.txt`,
         `Server: ${ChannelData.guild.name} [${ChannelData.guild.id}] Channel: ${ChannelData.name} [${ChannelData.id}] Message: ${element.attachments.map((v) => v.url)}` + '\r\n');
      }
    });
  }
}

function BoucleFetch () {
  setTimeout(async () => {
    await FetchMessage();
  }, config.timer);
}

client.login(process.env.Token);
