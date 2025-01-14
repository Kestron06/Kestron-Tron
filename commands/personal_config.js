// #region Boilerplate
const { SlashCommandBuilder, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, Partials, ActivityType, PermissionFlagsBits, DMChannel, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType,AuditLogEvent, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageReaction, MessageType}=require("discord.js");
const { chmodSync } = require("fs");
function applyContext(context={}) {
	for (key in context) {
		this[key] = context[key];
	}
}
// #endregion Boilerplate

module.exports = {
	data: {
		// Slash command data
		command: new SlashCommandBuilder().setName("personal_config").setDescription("Configure the bot for you personally")
			.addBooleanOption(option=>
				option.setName("dm_infractions").setDescription("If you get filtered, should I DM you?")
			).addBooleanOption(option=>
				option.setName("dm_infraction_content").setDescription("If dm_infractions is true, should I include the content of the filtered message?")
			).addBooleanOption(option=>
				option.setName("embeds").setDescription("If you link a Discord message, should I embed a preview for you?")
			).addBooleanOption(option=>
				option.setName("level_up_messages").setDescription("Do you want to receive messages letting you know you leveled up?")
			).addBooleanOption(option=>
				option.setName("configure_timezone").setDescription("Open up a menu to configure your timezone?")
			),
		
		// Optional fields
		
		extra: {"contexts":[0,1,2],"integration_types":[0,1]},

		requiredGlobals: ["presets"],

		help: {
			helpCategories: ["General","Bot","Configuration"],
			/*
				- General -> Generic commands almost every bot has
				- Information -> A command designed purely to provide information of some kind
				- Bot -> A command designed specifically for managing the bot itself
				- Administration -> A command that needs moderator priviledges
				- Configuration -> A command that changes settings of some kind
				- Entertainment -> A command that is related to a fun feature of some kind
				- Context Menu -> A command accessed via the context menu
				- Other/Misc -> Commands without another good category
				- Server Only -> Commands that can only be run in servers
				- User Install Only -> Commands that can only be run if Stewbot is installed to your user
			*/
			shortDesc: "Configure the bot for you personally",//Should be the same as the command setDescription field
			detailedDesc: //Detailed on exactly what the command does and how to use it
				`Configure options for your personal interactions with the bot. This includes options such as if the bot tells you when you're filtered, if it automatically embeds certain links you post, or if you want it to not ping you whenb you level up in a server. You can also set your timezone for use with /timestamp`
		},
	},

	async execute(cmd, context) {
		applyContext(context);
		
		if(cmd.options.getBoolean("dm_infractions")!==null) storage[cmd.user.id].config.dmOffenses=cmd.options.getBoolean("dm_infractions");
		if(cmd.options.getBoolean("dm_infraction_content")!==null) storage[cmd.user.id].config.returnFiltered=cmd.options.getBoolean("dm_infraction_content");
		if(cmd.options.getBoolean("embeds")!==null) storage[cmd.user.id].config.embedPreviews=cmd.options.getBoolean("embeds");
		if(cmd.options.getBoolean("level_up_messages"!==null)) storage[cmd.user.id].config.levelUpMsgs=cmd.options.getBoolean("level_up_messages");
		
		// Timezone response is more complex so respond differently at the end if we're configuring that 
		if(!cmd.options.getBoolean("configure_timezone")){
			cmd.followUp("Configured your personal setup");
		}
		else {
			var cur=new Date();
			if(!storage[cmd.user.id].config.hasSetTZ) storage[cmd.user.id].config.timeOffset=0;
			cmd.followUp({content:`## Timezone Configuration\n\nPlease use the buttons to make the following number your current time (you can ignore minutes)\n${(cur.getHours()+storage[cmd.user.id].config.timeOffset)===0?"12":(cur.getHours()+storage[cmd.user.id].config.timeOffset)>12?(cur.getHours()+storage[cmd.user.id].config.timeOffset)-12:(cur.getHours()+storage[cmd.user.id].config.timeOffset)}:${(cur.getMinutes()+"").padStart(2,"0")} ${(cur.getHours()+storage[cmd.user.id].config.timeOffset)>11?"PM":"AM"}\n${((cur.getHours()+storage[cmd.user.id].config.timeOffset)+"").padStart(2,"0")}${(cur.getMinutes()+"").padStart(2,"0")}`,components:presets.tzConfig});
		}
	}
};
