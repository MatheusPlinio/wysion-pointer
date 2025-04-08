import { ApplicationCommandDataResolvable, BitFieldResolvable, Client, ClientEvents, Collection, GatewayIntentsString, IntentsBitField, Partials } from "discord.js";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { CommandType, ComponentsButton, ComponentsModal, ComponentsSelect, ButtonFunction } from "./types/Command";
import { EventType } from "./types/Event";
dotenv.config();

const fileCondition = (fileName: string) => fileName.endsWith(".ts") || fileName.endsWith(".js");

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandType> = new Collection();
    public buttons: ComponentsButton = new Collection();
    public selects: ComponentsSelect = new Collection();
    public modals: ComponentsModal = new Collection();
    constructor() {
        super({
            intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<GatewayIntentsString, number>,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.Message,
                Partials.Reaction,
                Partials.ThreadMember,
                Partials.User
            ]
        });
    }

    public start() {
        this.registerModules();
        this.registerEvents();
        this.registerButtonInteractions();
        this.login(process.env.DISCORD_BOT_TOKEN);
    }

    private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
        this.application?.commands.set(commands)
            .then(() => {
                console.log("Slash commands (/) defined".green)
            })
            .catch(error => {
                console.log("Error Slash command (/)".red, error)
            })
    }

    private registerModules() {
        const slashCommands: Array<ApplicationCommandDataResolvable> = new Array();

        const commandsPath = path.join(__dirname, "..", "commands");

        fs.readdirSync(commandsPath).forEach(local => {

            fs.readdirSync(commandsPath + `/${local}/`).filter(fileCondition).forEach(async fileName => {

                const command: CommandType = (await import(`../commands/${local}/${fileName}`))?.default;

                const { name, buttons, selects, modals } = command;

                if (name) {
                    this.commands.set(name, command);
                    slashCommands.push(command);

                    if (buttons) buttons.forEach((run, key) => this.buttons.set(key, run));
                    if (selects) selects.forEach((run, key) => this.selects.set(key, run));
                    if (modals) modals.forEach((run, key) => this.modals.set(key, run));
                }
            })
        });

        this.on("ready", () => this.registerCommands(slashCommands));
    }

    private registerEvents() {
        const eventsPath = path.join(__dirname, "..", "events");

        fs.readdirSync(eventsPath).forEach(local => {

            fs.readdirSync(`${eventsPath}/${local}`).filter(fileCondition)
                .forEach(async fileName => {
                    const { name, once, run }: EventType<keyof ClientEvents> = (await import(`../events/${local}/${fileName}`))?.default;

                    try {
                        if (name) (once) ? this.once(name, run) : this.on(name, run);
                    } catch (error) {
                        console.log(`An error occurred on event: ${name} \n${error}`.red);
                    }
                })
        });
    }

    private registerButtonInteractions() {
        const buttonsPath = path.join(__dirname, "..", "interactions");

        if (!fs.existsSync(buttonsPath)) {
            console.warn("Pasta de handlers de botões não encontrada: " + buttonsPath);
            return;
        }

        const loadButtonHandlers = async (dirPath: string) => {
            const files = fs.readdirSync(dirPath);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    await loadButtonHandlers(filePath);
                } else if (fileCondition(file)) {
                    try {
                        const buttonHandler: ButtonFunction = (await import(filePath))?.default;

                        if (buttonHandler) {
                            
                            let customId = path.relative(buttonsPath, filePath)
                                .replace(/\.(js|ts)$/i, '')
                                .replace(/buttonhandler$/i, '')
                                .replace(/\\|\//g, '-')
                                .toLowerCase();

                            this.buttons.set(customId, buttonHandler);
                            console.log(`[BUTTON HANDLER] Registrado: ${customId}`.green);
                        } else {
                            console.warn(`[BUTTON HANDLER] Exportação 'default' não encontrada em: ${file}`.yellow);
                        }
                    } catch (error) {
                        console.error(`[BUTTON HANDLER] Erro ao registrar ${file}:`, error);
                    }
                }
            }
        };

        loadButtonHandlers(buttonsPath).catch(console.error);
    }
}
