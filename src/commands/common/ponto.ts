import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    InteractionReplyOptions
} from "discord.js";
import { Command } from "../../structs/types/Command";
import { PontoRepository } from "../../data/repositories/ponto-repository";
import { prisma } from "../../utils/prisma";
import { buildUserEmbed } from "./embeds/embed-pointer-user";

export default new Command({
    name: "ponto",
    description: "Abrir o Ponto",
    type: ApplicationCommandType.ChatInput,
    async run({ interaction }) {

        const pontoRepository = new PontoRepository(prisma)

        const response = await pontoRepository.store({
            username: interaction.user.username,
            discord_uuid: interaction.user.id,
            point_type: "ENTRY",
        })

        const embed = await buildUserEmbed(interaction.user.id);

        const pauseButton = new ButtonBuilder({
            customId: "forms-pointer-pause-start",
            label: "Pausar",
            style: ButtonStyle.Primary,
        });

        const endButton = new ButtonBuilder({
            customId: "forms-pointer-end",
            label: "Terminar",
            style: ButtonStyle.Danger,
        });

        const row = new ActionRowBuilder<ButtonBuilder>({
            components: [pauseButton, endButton]
        })

        const reply = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true,
        } as InteractionReplyOptions);

        await prisma.register.update({
            where: { id: response.id },
            data: { message_uuid: reply.id }
        })
    },
});