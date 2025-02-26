import {Telegraf} from 'telegraf';
import 'dotenv/config'
import{message} from 'telegraf/filters'
import userModel from './src/models/User.js'
import mongoconnect from './src/config/db.js';
import Event from './src/models/Events.js';

import {OpenAI} from 'openai';

mongoconnect();

const bot=new Telegraf(process.env.BOT_TOKEN);

bot.start(async(ctx)=>{
    console.log('ctx',ctx);
       
      const from=ctx.update.message.from;
      console.log(from);
      try{
        
        await userModel.findOneAndUpdate({tgId:from.id},{

           $setOnInsert:{

            firstname:from.first_name,

            lastname:from.last_name,

            isBot:from.is_bot,

            username:from.username,
           }


        },{upsert:true,new:true});

        ctx.reply("welcome to Heybot,want to generate attractive content for your social media posts? just give me the events and thoughts")
      }
      catch(err){
         console.log(err);
         await ctx.reply('some error occured');
      }
})

bot.command('generate', async (ctx) => {
   const from = ctx.update.message.from;
   const startOfDay = new Date();
   startOfDay.setHours(0, 0, 0, 0);
 
   const endOfDay = new Date();
   endOfDay.setHours(23, 59, 59, 999);
 
   const events = await Event.find({
     tgId: from.id,
     createdAt: {
       $gte: startOfDay,
       $lte: endOfDay,
     },
   });
 
   if (events.length === 0) {
     await ctx.reply("No events for the day");
     return;
   }
 
   console.log(events);
 
   try {
    await ctx.reply('generating content.....');
     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${process.env.DEEP_SEEK}`,
         "HTTP-Referer": "<YOUR_SITE_URL>",
         "X-Title": "<YOUR_SITE_NAME>",     
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "deepseek/deepseek-r1:free",
         messages: [
           {
             role: "system",
             content: "Act as a senior copywriter, you write highly engaging posts for linkedin,facebook and twitter using provided thoughts/events through the day",
           },
           {
             role:'user',
            content:`
            write like a human.for human.craft three engaging social media posts tailored for linked,facebook,and twitter audience.use simple language.use given time labels just to
            understand the order of the event,don't mention the time in the posts.Each post should creatively highlight the following events.Ensure the tone is conversational and
            impactful.Focus engaging the respective platform's audience,encouraging interactions,and driving interest in the events:
            ${events.map((event)=>event.text).join(', ')}`
           },
         ]
       })
     });
 
     // Parse the response as JSON
     const chatCompletion = await response.json();
 
     // Log the complete response from the AI
     console.log("AI Response Details:", chatCompletion);
 
     // Optionally, send the response back to the user
     if (chatCompletion?.choices && chatCompletion.choices.length > 0) {
       const aiMessage = chatCompletion.choices[0].message.content;
       await ctx.reply(aiMessage);
     } else {
       await ctx.reply("Received an unexpected response from the AI.");
     }
   } catch (err) {
     console.error("Error during OpenRouter API call:", err);
     await ctx.reply("An error occurred while generating the post.");
   }
 
 });

bot.on(message('text'),async(ctx)=>{
    
     const from=ctx.update.message.from;

    const message=ctx.update.message.text;

    try{
      
      await Event.create({
         text:message,
         tgId:from.id,
      });
     
    await ctx.reply('Got the message,keep texting me your thoughts, to generate the posts just enter the command :/generate');
       
    }
    catch(err){
      console.log(err);

      await ctx.reply('facing difficulties,olease try again later');
    }

});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))