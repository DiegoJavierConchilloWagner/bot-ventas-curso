require("dotenv").config();
const { createBot, createProvider, createFlow } = require("@bot-whatsapp/bot");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require('@bot-whatsapp/database/mock')
const ServerAPI = require("./http");

const {
  flowWelcome,
  flowVozVentas,
  flowAdios,
  flowAudioVideo,
  flowPDF,
  flowSendLink,
  flowVoiceNote,
  flowVozExperto,
  flowOn,
  flowOff,
  flowGreeting,
} = require("./flows");

const { adapterDB } = require("./provider/database");
const { employees } = require("./provider/agents");
const { employeesAddon } = require("./provider/agents/config");

const globalState = { status: true };

const main = async () => {
  await adapterDB.init()
  const adapterProvider = createProvider(BaileysProvider);
  const httpServer = new ServerAPI(adapterProvider, adapterDB);

  const flowsAgents = [
    flowVozVentas(globalState),
    flowVozExperto(globalState),
    flowSendLink(globalState, adapterDB),
    flowGreeting(globalState),
  ];

  const flows = [
    flowWelcome(globalState, employeesAddon),
    flowVoiceNote(globalState, employeesAddon),
    flowAdios(globalState),
    flowPDF(globalState),
    flowAudioVideo(globalState),
    flowOn(globalState),
    flowOff(globalState),
  ];

  employeesAddon.employees(await employees(flowsAgents, adapterDB));

  const adapterFlow = createFlow([...flowsAgents, ...flows]);
  const mockAdapterDB = new MockAdapter()
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: mockAdapterDB,
  });

  httpServer.start();
};

main();
