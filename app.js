import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import { VerifyDiscordRequest, DiscordRequest } from "./utils.js";
import {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
  GuildScheduledEventManager,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventEntityType,
  CDN,
} from "discord.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const token = process.env.TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    //   GatewayIntentBits.GuildMessageReactions,
    //   GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    //  GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
  ],
});

client.login(token);

client.on("guildScheduledEventCreate", async (m) => {
  console.log("CRE");
  console.log(m);
});

client.on("guildScheduledEventUpdate", async (before, after) => {
  console.log("UP");
  console.log(before.name);
  console.log(after);

  //trigger on starting an event, if the description includes "repeater"
  if (
    before.status === 1 &&
    after.status === 2 &&
    (before.description.includes("epeater"))
  ) {
    const guild = await client.guilds.fetch(before.guildId);
    const channel = await client.channels.fetch(before.channelId);
    // Grab the image from the previous event (before)
    const cdn = new CDN();
    const imageLink = cdn.guildScheduledEventCover(before.id, before.image, {
      size: 4096,
    });


    
    //Create new event using the information from the old event
    const event_manager = new GuildScheduledEventManager(guild);
    event_manager.create({
      name: before.name,
      description: before.description,
      //Schedule the new event a week later (in milliseconds)
      scheduledStartTime: before.scheduledStartTimestamp + 604800000,
      scheduledEndTime: before.scheduledStartTimestamp + 610800000,
      channel: channel,
      privacyLevel: 2,
      entityType: 3,
      entityType: before.entityType,
      image: imageLink,
    });
  }
});

client.on("guildScheduledEventDelete", async (m) => {
  console.log("DEL");
  console.log(m);
});

app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "help" command
    if (name === "help") {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content:
            "Hi! I'm the event repeater bot. Simply add "Repeat" to your events description, and I'll create a followup-event a week later as soon as the event is started.",
        },
      });
    }
      
  }
  */
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});