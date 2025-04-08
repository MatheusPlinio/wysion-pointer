import axios, { AxiosRequestConfig } from "axios";
import { ButtonInteraction, InteractionEditReplyOptions, ModalSubmitInteraction } from "discord.js";
import apiClient from "./apiClient";

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

async function httpGenericsRequest<Req, Res>(
    method: HttpMethod,
    url: string,
    interaction: ModalSubmitInteraction | ButtonInteraction | null = null,
    successMessage?: string,
    data?: Req,
    params?: Req
): Promise<Res> {
    try {
        let axionsConfig: AxiosRequestConfig = {};

        switch (method) {
            case 'get':
                axionsConfig = { method, url, params };
                break;
            case 'post':
                axionsConfig = { method, url, data };
                break;
            case 'put':
                axionsConfig = { method, url, data };
                break;
            case 'delete':
                axionsConfig = { method, url, data };
                break;
        }

        const response = await apiClient(axionsConfig);

        if (interaction && successMessage) {
            await interaction.editReply({
                content: successMessage,
            } as InteractionEditReplyOptions);
        }
        return response.data as Res;

    } catch (error: any) {
        let discordErrorMessage = "❌ Ocorreram erros:\n";

        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as any;

            if (errorData && errorData.errors) {
                if (errorData.errors.general) {
                    const generalErrors = errorData.errors.general;
                    for (const errorObject of generalErrors) {
                        discordErrorMessage += `- ${errorObject.error}\n`;
                    }
                } else {
                    for (const field in errorData.errors) {
                        const errorMessages = errorData.errors[field];
                        discordErrorMessage += `${errorMessages.join(', ')}\n`;
                    }
                }
            } else if (errorData && errorData.message) {
                discordErrorMessage += errorData.message;
            } else {
                discordErrorMessage += "Ocorreu um erro desconhecido ao processar a resposta do servidor.";
            }
        } else {
            discordErrorMessage += "Ocorreu um erro inesperado ao fazer a requisição.";
            console.error("Erro não tratado Axios:", error);
        }

        if (interaction) {
            await interaction.editReply({
                content: discordErrorMessage,
            } as InteractionEditReplyOptions);
        }
        error.discordErrorMessage = discordErrorMessage;
        throw error;
    }
}

export default httpGenericsRequest;