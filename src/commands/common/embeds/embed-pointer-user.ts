import { EmbedBuilder } from "discord.js";
import { prisma } from "../../../utils/prisma";
import formatDate from "../../../utils/formateDate";

export async function buildUserEmbed(discordId: string): Promise<EmbedBuilder> {
    const registers = await prisma.register.findMany({
        where: { discord_uuid: discordId },
        orderBy: { createdAt: "asc" },
    });

    const fields = registers.map((r, i) => ({
        name: `#${i + 1} • ${formatPointType(r.point_type)}`,
        value: formatDate(r.createdAt),
        inline: false,
    }));

    return new EmbedBuilder()
        .setTitle("📂 Bate-Ponto")
        .addFields(
            {
                name: "Usuário:",
                value: `<@${discordId}>`,
                inline: false,
            },
            ...fields
        )
        .setFooter({ text: "Sistema desenvolvido por MatheusServiceSoft" })
        .setColor(0x2b2d31);
}

function formatPointType(type: string): string {
    switch (type) {
        case "ENTRY": return "Início";
        case "PAUSE_START": return "Pausa";
        case "PAUSE_END": return "Retorno";
        case "EXIT": return "Término";
        default: return type;
    }
}