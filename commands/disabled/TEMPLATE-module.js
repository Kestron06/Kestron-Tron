const { ContextMenuCommandBuilder, ApplicationCommandType, SlashCommandBuilder, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, Partials, ActivityType, PermissionFlagsBits, DMChannel, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType,AuditLogEvent, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageReaction, MessageType}=require("discord.js");
function applyContext(context={}) {
	for (key in context) {
		this[key] = context[key];
	}
}

// 
// TEMPLATE-module.js is a minimal template for modules that do not have attached commands.
// 	These can be message handlers like ~sudo, etc
// 

module.exports = {
	data: {
		command: null,

		// Not all modules will have help commands, but they can in theory to showcase bot features.
		help: {
			helpCategories: [],
			/*
				- General -> Generic commands almost every bot has
				- Information -> A command designed purely to provide information of some kind
				- Bot -> A command designed specifically for managing the bot itself
				- Administration -> A command that needs moderator privileges
				- Configuration -> A command that changes settings of some kind
				- Entertainment -> A command that is related to a fun feature of some kind
				- Context Menu -> A command accessed via the context menu
				- Other/Misc -> Commands without another good category
				- Server Only -> Commands that can only be run in servers
				- User Install Only -> Commands that can only be run if Stewbot is installed to your user
				- Safety -> Anti-hack, anti-spam, etc
			*/
			shortDesc: "Jerry Jerry Jerry Jerry Yeah!!!",//Should be the same as the command setDescription field
			detailedDesc: //Detailed on exactly what the command does and how to use it
				`Jerry the Rope!\n
				Jerry brings hope.\n
				Jerry's never tied up\n
				Jerry helps you in your 'trub\n
				Yeah! Jerry!`
		},
	},

	async onmessage(msg, context) {
		// `context` currently does not respect requested globals
	}
};
