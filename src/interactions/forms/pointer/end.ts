import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, InteractionReplyOptions } from "discord.js";
import { PontoRepository } from "../../../data/repositories/ponto-repository";
import { prisma } from "../../../utils/prisma";
import { buildUserEmbed } from "../../../commands/common/embeds/embed-pointer-user";
import { ButtonFunction } from "../../../structs/types/Command";
import { endOfDay, startOfDay } from "date-fns";


function calcularHorasTrabalhadas(registros: { point_type: string, createdAt: Date }[]): string {
    let totalMs = 0;
    let inicioTrabalho: Date | null = null;
    let inicioPausa: Date | null = null;
    let emPausa = false;

    for (const registro of registros) {
        switch (registro.point_type) {
            case 'ENTRY':
            case 'PAUSE_END':
                if (!emPausa) {
                    inicioTrabalho = registro.createdAt;
                }
                break;

            case 'PAUSE_START':
                if (inicioTrabalho) {
                    totalMs += registro.createdAt.getTime() - inicioTrabalho.getTime();
                    inicioTrabalho = null;
                }
                emPausa = true;
                inicioPausa = registro.createdAt;
                break;

            case 'EXIT':
                if (inicioTrabalho) {
                    totalMs += registro.createdAt.getTime() - inicioTrabalho.getTime();
                    inicioTrabalho = null;
                }
                break;
        }
    }

    const totalMin = Math.floor(totalMs / 1000 / 60);
    const horas = Math.floor(totalMin / 60);
    const minutos = totalMin % 60;

    return `${horas}h ${minutos}min`;
}

const end: ButtonFunction = async (interaction: ButtonInteraction) => {
    const pontoRepository = new PontoRepository(prisma);

    const response = await pontoRepository.store({
        username: interaction.user.username,
        discord_uuid: interaction.user.id,
        point_type: "EXIT",
    })

    const now = new Date();
    const registros = await prisma.register.findMany({
        where: {
            discord_uuid: interaction.user.id,
            createdAt: {
                gte: startOfDay(now),
                lte: endOfDay(now)
            }
        },
        orderBy: { createdAt: 'asc' },
    });

    const total = calcularHorasTrabalhadas(registros);

    const embed = await buildUserEmbed(interaction.user.id)
    embed.addFields({
        name: "🕒 Total de horas trabalhadas",
        value: total,
        inline: false,
    })

    const reply = await interaction.reply({
        embeds: [embed],
        fetchReply: true,
    } as InteractionReplyOptions);
}

export default end;