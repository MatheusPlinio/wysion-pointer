import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, InteractionReplyOptions } from "discord.js";
import { PontoRepository } from "../../../data/repositories/ponto-repository";
import { prisma } from "../../../utils/prisma";
import { buildUserEmbed } from "../../../commands/common/embeds/embed-pointer-user";
import { ButtonFunction } from "../../../structs/types/Command";

const pauseStart: ButtonFunction = async (interaction: ButtonInteraction) => {
    const pontoRepository = new PontoRepository(prisma);

    const response = await pontoRepository.store({
        username: interaction.user.username,
        discord_uuid: interaction.user.id,
        point_type: "PAUSE_START",
    })

    const embed = await buildUserEmbed(interaction.user.id);

    const pauseButton = new ButtonBuilder({
        customId: "forms-pointer-pause-end",
        label: "Abrir",
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
}

export default pauseStart;