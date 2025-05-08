<template>
  <div id="topBar">
    <polslLogoLongWhite />

    <div class="flexRow">
      <button @click="openChat" class="simpleSvgButton" id="openChatButton">
        <AiChatIcon />
      </button>
      <button @click="openSettings" class="simpleSvgButton" id="openSettingsButton">
        <KogWheelIcon />
      </button>
      <button @click="openCommandList" class="simpleSvgButton" id="openCommandListButton">
        <ListIcon />
      </button>
    </div>
  </div>
  <div id="wLayout">

    <div id="W" :class="{ manualMode: manualMode }">
      <div id="layer1" class="layer">
        <div id="counter">
          <div @click="ilClick" id="il" class="signal impulse arrowRightOnBottom" :class="{ active: signals.il }">
            <span>il</span>
          </div>
          <span class="register"> <span>L</span><span>:</span>
            <div class="inputWrapper">
              <span>{{ formatNumber(programCounter) }}</span>
              <input type="number" v-model="programCounter">
            </div>
          </span>
          <div @click="dlClick" id="dl" v-if="extras.dl" class="signal impulse arrowLeftOnBottom"
            :class="{ active: signals.dl }">
            <span>dl</span>
          </div>
          <div @click="wylClick" id="wyl" class="signal long pathDownOnLeft" :class="{ active: signals.wyl }">
            <span class="arrowLeftOnBottom">wyl</span>
          </div>
          <div @click="welClick" id="wel" class="signal impulse pathUpOnRight" :class="{ active: signals.wel }">
            <span class="arrowRightOnBottom">wel</span>
          </div>
        </div>
        <!-- <div id="stack" class="register">
          S : {{ formatNumber(stackPointer) }}
        </div> -->
      </div>
      <div id="busA" class="bus signal" :class="{ active: signals.busA }">
        <div class="line" />
        <span v-if="extras.showInvisibleRegisters">BusA : {{ formatNumber(BusA) }}</span>
        <span>a</span>
      </div>
      <div id="layer2" class="layer">
        <div id="iRegister">
          <div @click="wyadClick" id="wyad" class="signal long pathUpOnRight" :class="{ active: signals.wyad }">
            <span class="arrowRightOnBottom">wyad</span>
          </div>
          <div class="register">
            <span>I</span><span>:</span>
            <div class="inputWrapper">
              <span>{{ formatNumber(I) }}</span>
              <input type="number" v-model="I">
            </div>
          </div>
          <div @click="weiClick" id="wei" class="signal impulse pathUpOnLeft" :class="{ active: signals.wei }">
            <span class="arrowLeftOnBottom">wei</span>
          </div>
        </div>

        <div id="calc">
          <div v-if="extras.jamlExtras" id="flags">
            FLAGS:
            <div title="Negative number in Acc" v-if="ACC < 0">
              N
            </div>
            <div title="Zero in Acc" v-if="ACC === 0">
              Z
            </div>
          </div>
          <div class="accSignals">
            <div @click="iakClick" v-if="extras.jamlExtras" id="iak" class="signal impulse"
              :class="{ active: signals.iak }">
              <span class="arrowRightOnBottom">iak</span>
            </div>
            <div @click="dakClick" v-if="extras.jamlExtras" id="dak" class="signal impulse"
              :class="{ active: signals.dak }">
              <span class="arrowRightOnBottom">dak</span>
            </div>
          </div>
          <div id="accumulator">AK:
            <div class="inputWrapper">
              <span>{{ formatNumber(ACC) }}</span>
              <input type="number" v-model="ACC">
            </div>
          </div>
          <div class="jamlSignals">
            <div @click="weakClick" id="weak" class="signal impulse" :class="{ active: signals.weak }">
              <span class="arrowRightOnBottom">weak</span>
            </div>
            <div id="dod" @click="dodClick" class="signal long" :class="{ active: signals.dod }">
              <span class="lineRightOnBottom">dod</span>
            </div>
            <div id="ode" @click="odeClick" class="signal long" :class="{ active: signals.ode }">
              <span class="lineRightOnBottom">ode</span>
            </div>
            <div id="przep" @click="przepClick" class="signal long" :class="{ active: signals.przep }">
              <span class="lineRightOnBottom">przep</span>
            </div>
            <div v-if="extras.jamlExtras" id="mno" @click="mnoClick" class="signal long"
              :class="{ active: signals.mno }">
              <span class="lineRightOnBottom">mno</span>
            </div>
            <div v-if="extras.jamlExtras" id="dziel" @click="dzielClick" class="signal long"
              :class="{ active: signals.dziel }">
              <span class="lineRightOnBottom">dziel</span>
            </div>
            <div v-if="extras.jamlExtras" id="shr" @click="shrClick" class="signal long"
              :class="{ active: signals.shr }">
              <span class="lineRightOnBottom">shr</span>
            </div>
            <div v-if="extras.jamlExtras" id="shl" @click="shlClick" class="signal long"
              :class="{ active: signals.shl }">
              <span class="lineRightOnBottom">shl</span>
            </div>
            <div v-if="extras.jamlExtras" id="neg" @click="negClick" class="signal long"
              :class="{ active: signals.neg }">
              <span class="lineRightOnBottom">neg</span>
            </div>
            <div v-if="extras.jamlExtras" id="lub" @click="lubClick" class="signal long"
              :class="{ active: signals.lub }">
              <span class="lineRightOnBottom">lub</span>
            </div>
            <div v-if="extras.jamlExtras" id="i" @click="iClick" class="signal long" :class="{ active: signals.i }">
              <span class="lineRightOnBottom">i</span>
            </div>
          </div>
          <div id="jaml" class="register">
            <span>JAML</span>
            <span v-if="extras.showInvisibleRegisters">:</span>
            <div v-if="extras.showInvisibleRegisters" class="inputWrapper">
              <span>{{ formatNumber(JAML) }}</span>
              <input type="number" v-model="JAML">
            </div>
          </div>
          <div id="weja" @click="wejaClick" class="signal long pathUpOnRight" :class="{ active: signals.weja }">
            <span class="arrowRightOnBottom">weja</span>
          </div>
          <div id="wyak" @click="wyakClick" class="signal long pathDownOnRight" :class="{ active: signals.wyak }">
            <span class="arrowRightOnBottom">wyak</span>
          </div>
        </div>
        <div v-if="extras.busConnectors" id="sa" @click="saClick" class="signal long pathUpOnRight"
          :class="{ active: signals.sa }">
          <span class="lineRightOnBottom">sa</span>
        </div>
        <div v-if="extras.busConnectors" id="as" @click="asClick" class="signal long pathDownOnLeft"
          :class="{ active: signals.as }">
          <span class="lineLeftOnBottom">as</span>
        </div>
        <div id="memory">
          <div id="wea" @click="weaClick" class="signal long pathDownOnRight" :class="{ active: signals.wea }">
            <span class="arrowRightOnBottom">wea</span>
          </div>
          <div class="register" id="aRegister"><span>A</span><span>:</span>
            <div class="inputWrapper">
              <span>{{ formatNumber(A) }}</span>
              <input type="number" v-model="A">
            </div>
          </div>
          <div id="memoryTable">
            <span class="label">Mem Address</span>
            <span class="label">Value</span>
            <span class="label">Code</span>
            <span class="label">Address</span>
            <template v-for="(value, index) in mem" :key="index">
              <span :class="{ selected: A === index }">{{ formatNumber(index) }}</span>
              <div :class="{ selected: A === index }" class="inputWrapper">
                <span>{{ formatNumber(mem[index]) }}</span>
                <input type="number" v-model="mem[index]">
              </div>
              <span :class="{ selected: A === index }">{{ decToCommand(value) ? decToCommand(value).name : "EMPTY"
              }}</span>
              <span :class="{ selected: A === index }">{{ formatNumber(decToArgument(value)) }}</span>
            </template>
          </div>
          <div id="operations">
            <div id="czyt" @click="czytClick" class="signal long" :class="{ active: signals.czyt }">
              <span class="lineLeftOnBottom">czyt</span>
            </div>
            <div id="pisz" @click="piszClick" class="signal long" :class="{ active: signals.pisz }">
              <span class="lineLeftOnBottom">pisz</span>
            </div>
          </div>
          <div class="register" id="sRegister"><span>S</span><span>:</span>
            <div class="inputWrapper">
              <span>{{ formatNumber(S) }}</span>
              <input type="number" v-model="S">
            </div>
          </div>
          <div class="signals">
            <div id="wes" @click="wesClick" class="signal long pathUpOnRight" :class="{ active: signals.wes }">
              <span class="arrowRightOnBottom">wes</span>
            </div>
            <div id="wys" @click="wysClick" class="signal long pathDownOnLeft" :class="{ active: signals.wys }">
              <span class="lineLeftOnBottom">wys</span>
            </div>
          </div>
        </div>
      </div>
      <div id="busS" class="bus signal" :class="{ active: signals.busS }">
        <div class="line" />
        <span v-if="extras.showInvisibleRegisters">BusS : {{ formatNumber(BusS) }}</span>
        <span>s</span>
      </div>
      <div id="layer3" class="layer">
        <div v-if="extras.xRegister" id="xRegister">
          <div id="wyx" @click="wyxClick" class="signal long pathUpOnRight" :class="{ active: signals.wyx }">
            <span class="arrowRightOnBottom">wyx</span>
          </div>
          <div class="register">
            <span>X</span><span>:</span>
            <div class="inputWrapper">
              <span>{{ formatNumber(X) }}</span>
              <input type="number" v-model="X">
            </div>
          </div>
          <div id="wex" @click="wexClick" class="signal impulse pathDownOnLeft" :class="{ active: signals.wex }">
            <span class="lineLeftOnBottom">wex</span>
          </div>
        </div>
        <div v-if="extras.yRegister" id="yRegister">
          <div id="wyy" @click="wyyClick" class="signal long pathUpOnRight" :class="{ active: signals.wyy }">
            <span class="arrowRightOnBottom">wyy</span>
          </div>
          <div class="register"><span>Y</span><span>:</span>
            <div class="inputWrapper">
              <span>{{ formatNumber(Y) }}</span>
              <input type="number" v-model="Y">
            </div>
          </div>
          <div id="wey" @click="weyClick" class="signal impulse pathDownOnLeft" :class="{ active: signals.wey }">
            <span class="lineLeftOnBottom">wey</span>
          </div>
        </div>
        <!-- <div id="registersS">
          <div v-for="(value, index) in V" :key="index" class="register">
            <span>{{ index }}</span>
            <span>:</span>
            <span>{{ value }}</span>
          </div>
        </div> -->
      </div>
    </div>

    <div id="inputs">
      <!-- <div class="switchDiv">
          <input id="manualMode" type="checkbox" v-model="manualMode" @input="manualModeChanged"/>
          <label for="manualMode">Manual mode</label>
      </div> -->
      <div class="toggleButtonDiv" :class="{ active: manualMode }">
        <span @click="manualModeCheck">Manual Mode</span>
        <span @click="manualModeUncheck">Program</span>
      </div>
      <div class="chooseProgram">

      </div>
      <textarea v-model="code" placeholder="rozkaz" :disabled="manualMode" v-if="!codeCompiled" />
      <div class="compiledCode" v-else>
        <span v-for="(line, index) in compiledCode" :key="index" class="flexRow"
          :class="{ active: activeLine == index }">
          <span>{{ index }}</span>
          <span>:</span>
          <span class="codeLine">{{ line }}</span>
        </span>
      </div>
      <div class="nextLine" v-if="nextLine.size > 0">
        <span>Next line signals:</span>
        <div class="flexRow">
          <div v-for="(command, index) in nextLine" :key="index">
            <span>{{ command }}</span>
          </div>
        </div>
      </div>
      <div class="flexRow">
        <button @click="compileCode" v-if="!codeCompiled" :disabled="manualMode || code == ''">
          Compile
        </button>
        <button @click="uncompileCode" v-if="codeCompiled" :disabled="manualMode && codeCompiled">
          Edit
        </button>
        <button @click="executeLine" :disabled="!manualMode && !codeCompiled">
          Next line
        </button>
        <button @click="runCode" :disabled="manualMode || !codeCompiled">
          Run
        </button>
      </div>
    </div>

    <ProgramSection :manualMode="manualMode" :commandList="commandList" @update:code="code = $event"
      @log="addLog($event.message, $event.class)"/>

    <div v-if="!manualMode" id="console">
      <div v-for="(log, index) in logs" :key="index" :class="log.class.toLowerCase()">
        <span class="time">{{ formatTimestampForConsole(log.timestamp) }}</span>
        <span class="class">{{ log.class }}</span>
        <span class="symbol">>_</span>
        <span class="message">{{ log.message }}</span>
      </div>
    </div>

    <div id="ui">

    </div>

    <div @click="closePopups" id="popupsBackdrop" v-if="settingsOpen || commandListOpen || aiChatOpen" />

    <div id="settings" v-if="settingsOpen">
      <span class="titleSpan">Settings</span>
      <button @click="closePopups" id="openCloseSettings">
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 14H10M10 14V20M10 14L3 21M20 10H14M14 10V4M14 10L21 3" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="flexColumn">
        <div class="toggleButtonDiv" :class="{ active: lightMode }">
          <span @click="lightModeCheck">
            <SunIcon /> Light
          </span>
          <span @click="darkModeUncheck">
            <MoonIcon /> Dark
          </span>
        </div>
      </div>
      <div class="flexColumn">
        <label for="numberFormat">Number Format:</label>
        <select id="numberFormat" v-model="numberFormat">
          <option value="dec">Decimal</option>
          <option value="hex">Hexadecimal</option>
          <option value="bin">Binary</option>
        </select>
      </div>
      <div class="flexColumn">
        <label for="argBits">Memory Size Bits:</label>
        <input id="argBits" type="number" v-model="memoryAddresBits" />
        <p>Tyle bitów będzie mieć adres pamięci</p>
      </div>

      <div class="flexColumn">
        <label for="commandBits">Code Bits:</label>
        <input id="commandBits" type="number" v-model="codeBits" />
        <p>Tyle bitów będzie kod rozkazu</p>
      </div>
      <div class="flexColumn">
        <label for="addresBits">Address Bits:</label>
        <input id="addresBits" type="number" v-model="addresBits" />
        <p>Tyle bitów będzie mieć argument</p>
      </div>

      <div class="extras">
        <label>Extras:</label>
        <div class="switchDiv">
          <input id="xRegister" type="checkbox" v-model="extras.xRegister" />
          <label for="xRegister">X Register</label>
        </div>
        <div class="switchDiv">
          <input id="yRegister" type="checkbox" v-model="extras.yRegister" />
          <label for="yRegister">Y Register</label>
        </div>
        <div class="switchDiv">
          <input id="dl" type="checkbox" v-model="extras.dl" />
          <label for="dl">DL</label>
        </div>
        <div class="switchDiv">
          <input id="jamlExtras" type="checkbox" v-model="extras.jamlExtras" />
          <label for="jamlExtras">JAML Extras</label>
        </div>
        <div class="switchDiv">
          <input id="busConnectors" type="checkbox" v-model="extras.busConnectors" />
          <label for="busConnectors">Bus Connectors</label>
        </div>
      </div>
      <div class="flexColumn">
        <div class="flexRow">
          <button class="SvgAndTextButton" id="emptyLS" @click="emptyLS">
            <RefreshIcon />
            <span>Reset <u>EVERYTHING</u></span>
          </button>
        </div>
      </div>
    </div>

    <CommandList :visible="commandListOpen" :commandList="commandList" :codeBits="codeBits"
      @update:commandList="commandList = $event" />

    <div id="aiChat" v-if="aiChatOpen">
      <h1>Ai Chat</h1>
      <div id="conversation">
        <div v-for="(message, index) in aiConversation" :key="index" class="message"
          :class="{ 'user': message.sender === 'user', 'ai': message.sender === 'ai' }">

          <div class="icon">i</div>
          <span class="sender">{{ message.sender }}</span>
          <span class="time">{{ formatTimestampForConsole(message.timestamp) }}</span>
          <span class="message">{{ message.message }}</span>
        </div>
      </div>
      <div id="inputArea">
        <input type="text" v-model="aiInput" placeholder="Type your message..." @keyup.enter="sendAiMessage" />
        <button @click="sendAiMessage">Send</button>
      </div>
    </div>

  </div>
  <!-- <ol>
    <h1>TO DO:</h1>
    <li><+-s>Tryb ciemny</s></li>
    <li><s>Pogrubić ścieżki żeby to jakoś bardziej zjadliwie wyglądało</s></li>
    <li>Parser</li>
    <li><s>Konsola</s></li>
    <li>Brak możliwości dodania błędnego rozkazu</li>
    <li><s>W ustawieniach możliwość konfigurowania ilości komórek pamięci</s></li>
    <li>Możliwość ustawienie widoku pamięci: domyślnie adres, wartość ???</li>
    <li>Custom type number pole</li>
    <li>Słownik z Polskim, Angielskim, i językiem użytkownika</li>
    <li></li>
  </ol> -->
</template>

<script>

import polslLogoLongWhite from '@/assets/svg/polslLogoLongWhite.vue';
import KogWheelIcon from '@/assets/svg/KogWheelIcon.vue';
import RefreshIcon from '@/assets/svg/RefreshIcon.vue';
import ListIcon from '@/assets/svg/ListLinesIcon.vue';
import SunIcon from '@/assets/svg/SunIcon.vue';
import MoonIcon from '@/assets/svg/MoonIcon.vue';
import AiChatIcon from '@/assets/svg/AiChatIcon.vue';
import CommandList from './CommandList.vue';
import ProgramSection from './ProgramSection.vue';

export default {
  name: "MainComponent",

  components: {
    polslLogoLongWhite,
    KogWheelIcon,
    ListIcon,
    RefreshIcon,
    SunIcon,
    MoonIcon,
    AiChatIcon,
    CommandList,
    ProgramSection,
  },

  data() {
    return {
      addresBits: 4,
      codeBits: 6,
      memoryAddresBits: 6,
      C: 0,
      A: 0,
      ACC: 0,
      JAML: 0,
      mem: [
        0b000001, 0b000010, 0b000100, 0b001000, 0b010001, 0b100010, 0b100100,
        0b111000,
      ],
      registers: [],

      programCounter: 0,
      stackPointer: 0,
      I: 0,
      X: 0,
      Y: 0,
      S: 0,

      BusA: 0,
      BusS: 0,

      program: "DOD ",
      code: "czyt wys wei il;\nwyl wea;",
      compiledCode: [],
      activeLine: 0,
      nextLine: new Set(),

      oddDelay: 1000,

      commandList: [
        // [stp]
        // Linie=5
        // Linia1=// zakończenie programu
        // Linia2=ROZKAZ STP;
        // Linia3=Argumenty 0;
        // Linia4=czyt wys wei il;
        // Linia5=stop;
        {
          name: "stp",
          args: 0,
          description: "zakończenie programu",
          lines: "czyt wys wei il;\nstop;",
        },
        // [dod]
        // Linie=5
        // Linia1=// (Ak)+((Ad))->Ak
        // Linia2=ROZKAZ DOD;
        // Linia3=czyt wys wei il;
        // Linia4=wyad wea;
        // Linia5=czyt wys weja dod weak wyl wea;
        {
          name: "dod",
          args: 0,
          description: "(Ak) + ((Ad)) -> Ak",
          lines: "czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;",
        },
        // [pob]
        // Linie=5
        // Linia1=// ((Ad))->Ak
        // Linia2=ROZKAZ POB;
        // Linia3=czyt wys wei il;
        // Linia4=wyad wea;
        // Linia5=czyt wys weja przep weak wyl wea;
        {
          name: "pob",
          args: 0,
          description: "((Ad)) -> Ak",
          lines: "czyt wys wei il;\nwyad wea;\nczyt wys weja przep weak wyl wea;",
        },
        // [lad]
        // Linie=5
        // Linia1=// (Ak)->(Ad)
        // Linia2=ROZKAZ lAD;
        // Linia3=czyt wys wei il;
        // Linia4=wyad wea wyak wes;
        // Linia5=pisz wyl wea;
        {
          name: "lad",
          args: 0,
          description: "(Ak) -> (Ad)",
          lines: "czyt wys wei il;\nwyad wea wyak wes;\npisz wyl wea;",
        },
        // [sob]
        // Linie=5
        // Linia1=// skok bezwarunkowy
        // Linia2=ROZKAZ SOB;
        // Linia3=Argumenty 1;
        // Linia4=czyt wys wei il;
        // Linia5=wyad wea wel;
        {
          name: "sob",
          args: 1,
          description: "skok bezwarunkowy",
          lines: "czyt wys wei il;\nwyad wea wel;",
        },

        /* [som]
        Linie=6
        Linia1=skok gdy (AK) < 0
        Linia2=ROZKAZ SOM;
        Linia3=czyt wys wei il;
        Linia4=IF Z THEN @ujemne ELSE @dodatnie;
        Linia5=@ujemne wyad wea wel KONIEC;
        Linia6=@dodatnie wyl wea; */
        {
          name: "som",
          args: 0,
          description: "skok gdy (AK) < 0",
          lines: `czyt wys wei il;\nIF N THEN @ujemne ELSE @dodatnie;\n@ujemne wyad wea wel KONIEC;\n@dodatnie wyl wea;`,
        },
        // },
        // [soz]
        // Linie=6
        // Linia1=// skok gdy (AK) = 0
        // Linia2=ROZKAZ SOZ;
        // Linia3=czyt wys wei il;
        // Linia4=IF zak THEN @zero ELSE @niezero;
        // Linia5=@zero wyad wea wel KONIEC;
        // Linia6=@niezero wyl wea;
        {
          name: "soz",
          args: 0,
          description: "skok gdy (AK) = 0",
          lines: `czyt wys wei il;\nIF Z THEN @zero ELSE @niezero;\n@zero wyad wea wel KONIEC;\n@niezero wyl wea;`,
        },
        // [dns]
        // Linie=6
        // Linia1=rozkaz dns;
        // Linia2=argumenty 0;
        // Linia3=czyt wys wei il;
        // Linia4=dws;
        // Linia5=wyws wea wyak wes;
        // Linia6=pisz wyl wea;
        {
          name: "dns",
          args: 0,
          description: "rozkaz dns",
          lines: `czyt wys wei il;\ndws;\nwyws wea wyak wes;\npisz wyl wea;`,
        },
        // [pwr]
        // Linie=5
        // Linia1=rozkaz pwr;
        // Linia2=argumenty 0;
        // Linia3=czyt wys wei il;
        // Linia4=wyws wea iws;
        // Linia5=czyt wys as wea wel;
        {
          name: "pwr",
          args: 0,
          description: "rozkaz pwr",
          lines: `czyt wys wei il;\nwyws wea iws;\nczyt wys as wea wel;`,
        },
        // [pzs]
        // Linie=5
        // Linia1=rozkaz pzs;
        // Linia2=argumenty 0;
        // Linia3=czyt wys wei il;
        // Linia4=wyws wea iws;
        // Linia5=czyt wys weja przep weak wyl wea;
        {
          name: "pzs",
          args: 0,
          description: "rozkaz pzs",
          lines: `czyt wys wei il;\nwyws wea iws;\nczyt wys weja przep weak wyl wea;`,
        },
        // [sdp]
        // Linie=6
        // Linia1=rozkaz sdp;
        // Linia2=argumenty 1;
        // Linia3=czyt wys wei il;
        // Linia4=dws;
        // Linia5=wyws wea wyls wes;
        // Linia6=pisz wyad wel wea;
        {
          name: "sdp",
          args: 1,
          description: "rozkaz sdp",
          lines: `czyt wys wei il;\ndws;\nwyws wea wyls wes;\npisz wyad wel wea;`,
        },
        // [dzi]
        // Linie=4
        // Linia1=ROZKAZ DZI;
        // Linia2=czyt wys wei il;
        // Linia3=wyad wea;
        // Linia4=czyt wys weja dziel weak wyl wea;
        {
          name: "dzi",
          args: 0,
          description: "ROZKAZ DZI",
          lines: `czyt wys wei il;\nwyad wea;\nczyt wys weja dziel weak wyl wea;`,
        },
        // [mno]
        // Linie=5
        // Linia1=ROZKAZ MNO;
        // Linia2=czyt wys wei il;
        // Linia3=wyad wea;
        // Linia4=czyt wys weja mno weak wyl wea;
        // Linia5=
        {
          name: "mno",
          args: 0,
          description: "ROZKAZ MNO",
          lines: `czyt wys wei il;\nwyad wea;\nczyt wys weja mno weak wyl wea;`,
        },
        {
          name: "wpr",
          args: 0,
          description: "wczytaj znak z urządzenia zewnętrznego",
          lines: `czyt wys wei il;\nwyak weja ode weak start;\n@czekaj wyg weja ode weak IF Z THEN @gotowe ELSE @czekaj;\n@gotowe wyrb weja przep weak wyl wea;`,
        },
        {
          name: "wyp",
          args: 0,
          description: "wyprowadź znak na urządzenie zewnętrzne",
          lines: `czyt wys wei il;\nwyak weja werb start;\nwyak wes weja ode weak;\n@czeka wyg weja ode weak IF Z THEN @gotowe ELSE @czeka;\n@gotowe wys weja przep weak wyl wea;`,
        },
      ],
      numberFormat: "dec",

      avaiableSignals: {
        always: [
          "il", "wyl", "wel",
          "wyad", "wei",
          "wea", "wes", "wys", "czyt", "pisz",
          "weja", "weak", "dod", "ode", "przp", "wyak", "stop"],
        busConnectors: ["as", "sa"],
        dl: ["dl"],
        jamlExtras: ["iak", "dak", "mno", "dziel", "shr", "shl", "neg", "lub", "i"],
        xRegister: ["wyx", "wex"],
        yRegister: ["wyy", "wey"],
      },

      signals: {

        // PROGRAM COUNTER
        il: false,
        dl: false,
        wel: false,
        wyl: false,

        // BUSES
        busA: false,
        busS: false,

        // I
        wyad: false,
        wei: false,

        // JAML
        iak: false,
        dak: false,

        weak: false,
        weja: false,
        wyak: false,

        dod: false,
        ode: false,
        przp: false,
        mno: false,
        dziel: false,
        shr: false,
        shl: false,
        neg: false,
        lub: false,
        i: false,

        // MEMORY
        czyt: false,
        pisz: false,
        wea: false,
        wes: false,
        wys: false,

        // X
        wyx: false,
        wex: false,

        // Y
        wyy: false,
        wey: false,


      },
      extras: {
        xRegister: false,
        yRegister: false,
        dl: false,
        jamlExtras: false,
        busConnectors: false,
        showInvisibleRegisters: false,
      },
      logs: [],

      manualMode: true,
      codeCompiled: false,

      programCompiled: false,
      compiledProgramLines: [],
      compiledProgram: [],

      settingsOpen: false,
      commandListOpen: false,
      aiChatOpen: false,

      lightMode: true,

      aiConversation: [],
      aiInput: "",
    };
  },
  methods: {

    loadFromLS() {
      const data = localStorage.getItem("W");
      if (data) {
        const parsed = JSON.parse(data);
        Object.assign(this, parsed);

        this.nextLine = new Set();

        for (const key in this.signals) {
          this.signals[key] = false;
        }
      }
    },
    saveToLS() {
      localStorage.setItem("W", JSON.stringify(this.$data));
    },
    emptyLS() {
      localStorage.removeItem("W");
      location.reload();
      this.addLog("Local storage cleared", "system");
    },

    addLog(message, classification = "info") {
      const timestamp = new Date();
      this.logs.push({ timestamp, message, class: classification });
      // scroll to bottom of the console
      this.$nextTick(() => {
        const console = document.getElementById("console");
        console.scrollTop = -console.scrollHeight;
      });
    },


    formatTimestampForConsole(timestamp) {
      const date = new Date(timestamp);

      // Extract date and time components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
      const day = String(date.getDate()).padStart(2, "0"); // Ensure 2-digit day

      const hours = String(date.getHours()).padStart(2, "0"); // Ensure 2-digit hours
      const minutes = String(date.getMinutes()).padStart(2, "0"); // Ensure 2-digit minutes
      const seconds = String(date.getSeconds()).padStart(2, "0"); // Ensure 2-digit seconds

      return new Date().toDateString() === date.toDateString()
        ? `${hours}:${minutes}:${seconds}` // If today, return HH:MM:SS
        : `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // If not today, return YYYY-MM-DD HH:MM:SS
    },

    decToHex(dec) {
      if (typeof dec !== "number" || isNaN(dec)) {
        return "Error: Invalid number for hexadecimal conversion.";
      }
      return "0x" + Math.floor(dec).toString(16).toUpperCase();
    },
    decToBinary(dec) {
      if (typeof dec !== "number" || isNaN(dec)) {
        return "Error: Invalid number for binary conversion.";
      }
      return "0b" + Math.floor(dec).toString(2);
    },
    formatNumber(number) {
      if (typeof number !== "number" || isNaN(number)) {
        return "Error: Invalid number.";
      }

      const formatters = {
        dec: () => number,
        hex: () => this.decToHex(number),
        bin: () => this.decToBinary(number),
      };

      return formatters[this.numberFormat]?.() ?? `EE${number}`;
    },
    decToCommand(dec) {
      return this.commandList[dec >> this.memoryAddresBits];
    },
    decToArgument(dec) {
      return dec & ((1 << this.memoryAddresBits) - 1);
    },


    resizeMemory() {
      const newSize = 1 << this.memoryAddresBits;
      const newMem = new Array(newSize).fill(0);

      for (let i = 0; i < Math.min(this.mem.length, newSize); i++) {
        // newMem[i] = this.mem[i];
        newMem[i] = 0;
      }

      // DEBUG PURPOSES
      newMem[0] = 0;
      for (let i = 1; i < newMem.length; i++) {
        //newMem[i] = (i << (this.memoryAddresBits)) + i;
        newMem[i] = 0;
      }

      this.mem = newMem;
    },

    lightModeCheck() {
      this.lightMode = true;
    },
    darkModeUncheck() {
      this.lightMode = false;
    },

    manualModeCheck() {
      this.manualMode = true;
      this.manualModeChanged();
    },
    manualModeUncheck() {
      this.manualMode = false;
      this.manualModeChanged();
    },
    manualModeChanged() {
      //this.manualMode = !this.manualMode;

      for (const key in this.signals) {
        this.signals[key] = false;
      }

      this.nextLine.clear();

      if (!this.manualMode) {
        this.uncompileCode();
      }
    },
    toggleSettings() {
      this.settingsOpen = !this.settingsOpen;
    },
    closePopups() {
      this.settingsOpen = false;
      this.commandListOpen = false;
      this.aiChatOpen = false;
    },
    openChat() {
      this.aiChatOpen = true;
    },
    openSettings() {
      this.settingsOpen = true;
    },
    openCommandList() {
      this.commandListOpen = true;
    },

    compileCode() {

      if (!this.code) {
        this.addLog("No code to compile", "Error");
        return;
      }

      let signalslist = new Set([
        ...this.avaiableSignals.always,
        ...(this.extras.xRegister ? this.avaiableSignals.xRegister : []),
        ...(this.extras.yRegister ? this.avaiableSignals.yRegister : []),
        ...(this.extras.dl ? this.avaiableSignals.dl : []),
        ...(this.extras.jamlExtras ? this.avaiableSignals.jamlExtras : []),
        ...(this.extras.busConnectors ? this.avaiableSignals.busConnectors : []),
      ]);

      console.log(signalslist);
      for (let [index, command] of this.code.split(/[\s;]+/).entries()) {
        if (!command) continue; // Skip empty commands

        if (!signalslist.has(command)) {
          this.addLog(`Signal "${command}" not recognized at position ${index + 1}`, "Code Parser Error");
          return;
        }
      }



      let code = this.code.replace(/\n/g, ""); // Remove all newline characters
      this.compiledCode = code.split(";"); // Split the cleaned code into an array by ";"
      //remove empty lines
      this.compiledCode = this.compiledCode.filter((line) => line.trim() !== "");


      this.codeCompiled = true;
      this.activeLine = -1;
      this.nextLine.clear();
      this.executeLine();

      this.addLog("Code compiled succesfully", "command compiler");
    },
    uncompileCode() {
      this.codeCompiled = false;
      this.nextLine.clear();
    },
    executeLine() {

      // all wy's first
      if (this.nextLine.has("wyl")) this.wyl();
      if (this.nextLine.has("czyt")) this.czyt(); // only czyt or pisz active at the same time
      if (this.nextLine.has("pisz")) this.pisz();
      if (this.nextLine.has("wys")) this.wys();
      if (this.nextLine.has("stop")) this.stop();
      if (this.nextLine.has("wyad")) this.wyad();
      if (this.nextLine.has("wyak")) this.wyak();
      if (this.nextLine.has("wyx")) this.wyx();
      if (this.nextLine.has("wyy")) this.wyy();

      if (this.nextLine.has("sa")) this.sa();
      if (this.nextLine.has("as")) this.as();

      // then all we's 

      if (this.nextLine.has("wea")) this.wea();
      if (this.nextLine.has("weja")) this.weja();
      if (this.nextLine.has("wex")) this.wex();
      if (this.nextLine.has("wey")) this.wey();
      if (this.nextLine.has("wes")) this.wes();
      if (this.nextLine.has("wei")) this.wei();
      if (this.nextLine.has("wel")) this.wel();

      // all math

      if (this.nextLine.has("dod")) this.dod();
      if (this.nextLine.has("ode")) this.ode();
      if (this.nextLine.has("przep")) this.przep();
      if (this.nextLine.has("mno")) this.mno();
      if (this.nextLine.has("dziel")) this.dziel();
      if (this.nextLine.has("shr")) this.shr();
      if (this.nextLine.has("shl")) this.shl();
      if (this.nextLine.has("neg")) this.neg();
      if (this.nextLine.has("lub")) this.lub();
      if (this.nextLine.has("i")) this.i();

      if (this.nextLine.has("iak")) this.iak();
      if (this.nextLine.has("dak")) this.dak();

      if (this.nextLine.has("weak")) this.weak();

      if (this.nextLine.has("il")) this.il();
      if (this.nextLine.has("dl")) this.dl();

      this.nextLine.clear();
      if (!this.manualMode) {
        this.activeLine++;
        if (this.activeLine >= this.compiledCode.length) {
          this.uncompileCode();
          this.addLog("Code finished", "command compiler");
        }
        else {
          for (const command of this.compiledCode[this.activeLine].split(" ")) {
            this.nextLine.add(command);
          }
        }
      }
    },
    runCode() {
      this.manualMode = false;
      while (this.activeLine < this.compiledCode.length) {
        this.executeLine();
      }
    },

    /* #region COMMANDS */

    il() {
      this.signals.il = true;
      this.programCounter++;
      setTimeout(() => {
        this.signals.il = false;
      }, this.oddDelay);
    },
    dl() {
      this.signals.dl = true;
      this.programCounter--;
      setTimeout(() => {
        this.signals.dl = false;
      }, this.oddDelay);
    },
    wyl() {
      this.signals.wyl = true;
      this.signals.busA = true;
      this.BusA = this.programCounter;
      setTimeout(() => {
        this.signals.wyl = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wel() {
      this.signals.wel = true;
      this.signals.busA = true;
      this.programCounter = this.BusA;
      setTimeout(() => {
        this.signals.wel = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wyad() {
      this.signals.wyad = true;
      this.signals.busA = true;
      this.BusA = this.I;
      setTimeout(() => {
        this.signals.wyad = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wei() {
      this.signals.wei = true;
      this.signals.busS = true;
      this.I = this.BusS;
      setTimeout(() => {
        this.signals.wei = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    iak() {
      this.signals.iak = true;
      this.ACC++;
      setTimeout(() => {
        this.signals.iak = false;
      }, this.oddDelay);
    },
    dak() {
      this.signals.dak = true;
      this.ACC--;
      setTimeout(() => {
        this.signals.dak = false;
      }, this.oddDelay);
    },
    weak() {
      this.signals.weak = true;
      this.ACC = this.JAML;
      setTimeout(() => {
        this.signals.weak = false;
      }, this.oddDelay);
    },
    weja() {
      this.signals.weja = true;
      this.signals.busS = true;
      this.JAML = this.BusS;
      setTimeout(() => {
        this.signals.weja = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wyak() {
      this.signals.wyak = true;
      this.signals.busS = true;
      this.BusS = this.ACC;
      setTimeout(() => {
        this.signals.wyak = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    dod() {
      this.signals.dod = true;
      this.JAML += this.ACC;
      setTimeout(() => {
        this.signals.dod = false;
      }, this.oddDelay);
    },
    ode() {
      this.signals.ode = true;
      this.JAML -= this.ACC;
      setTimeout(() => {
        this.signals.ode = false;
      }, this.oddDelay);
    },
    przep() {
      this.signals.przep = true;
      this.ACC = this.JAML;
      setTimeout(() => {
        this.signals.przep = false;
      }, this.oddDelay);
    },
    mno() {
      this.signals.mno = true;
      this.ACC *= this.JAML;
      setTimeout(() => {
        this.signals.mno = false;
      }, this.oddDelay);
    },
    dziel() {
      this.signals.dziel = true;
      this.ACC /= this.JAML;
      setTimeout(() => {
        this.signals.dziel = false;
      }, this.oddDelay);
    },
    shr() {
      this.signals.shr = true;
      this.ACC >>= this.JAML;
      setTimeout(() => {
        this.signals.shr = false;
      }, this.oddDelay);
    },
    shl() {
      this.signals.shl = true;
      this.ACC <<= this.JAML;
      setTimeout(() => {
        this.signals.shl = false;
      }, this.oddDelay);
    },
    neg() {
      this.signals.neg = true;
      this.ACC = -this.ACC;
      setTimeout(() => {
        this.signals.neg = false;
      }, this.oddDelay);
    },
    lub() {
      this.signals.lub = true;
      this.ACC |= this.JAML;
      setTimeout(() => {
        this.signals.lub = false;
      }, this.oddDelay);
    },
    i() {
      this.signals.i = true;
      this.ACC &= this.JAML;
      setTimeout(() => {
        this.signals.i = false;
      }, this.oddDelay);
    },
    wyx() {
      this.signals.wyx = true;
      this.signals.busS = true;
      this.BusS = this.X;
      setTimeout(() => {
        this.signals.wyx = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wex() {
      this.signals.wex = true;
      this.signals.busS = true;
      this.X = this.BusS;
      setTimeout(() => {
        this.signals.wex = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wyy() {
      this.signals.wyy = true;
      this.signals.busS = true;
      this.BusS = this.Y;
      setTimeout(() => {
        this.signals.wyy = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wey() {
      this.signals.wey = true;
      this.signals.busS = true;
      this.Y = this.BusS;
      setTimeout(() => {
        this.signals.wey = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },

    wea() {
      this.signals.wea = true;
      this.signals.busA = true;
      this.A = this.BusA;
      setTimeout(() => {
        this.signals.wea = false;
        this.signals.busA = false;
      }, this.oddDelay);
    },
    wes() {
      this.signals.wes = true;
      this.signals.busS = true;
      this.S = this.BusS;
      setTimeout(() => {
        this.signals.wes = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    wys() {
      this.signals.wys = true;
      this.signals.busS = true;
      this.BusS = this.S;
      setTimeout(() => {
        this.signals.wys = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    stop() {
      this.codeCompiled = false;
      this.nextLine.clear();
    },
    as() {
      this.signals.as = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusS = this.BusA;
      setTimeout(() => {
        this.signals.as = false;
        this.signals.busA = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    sa() {
      this.signals.sa = true;
      this.signals.busA = true;
      this.signals.busS = true;
      this.BusA = this.BusS;
      setTimeout(() => {
        this.signals.sa = false;
        this.signals.busA = false;
        this.signals.busS = false;
      }, this.oddDelay);
    },
    czyt() {
      this.signals.czyt = true;
      this.S = this.mem[this.A];
      setTimeout(() => {
        this.signals.czyt = false;
      }, this.oddDelay);
    },
    pisz() {
      this.signals.pisz = true;
      this.mem[this.A] = this.S;
      setTimeout(() => {
        this.signals.pisz = false;
      }, this.oddDelay);
    },


    /* #endregion COMMANDS */

    /* #region COMMAND CLICKS */

    ilClick() {
      if (this.manualMode) {
        if (this.nextLine.has("il")) {
          this.nextLine.delete("il");
          this.signals.il = false;
        } else {
          this.nextLine.add("il");
          this.signals.il = true;
        }
      }
    },
    dlClick() {
      if (this.manualMode) {
        if (this.nextLine.has("dl")) {
          this.nextLine.delete("dl");
          this.signals.dl = false;
        } else {
          this.nextLine.add("dl");
          this.signals.dl = true;
        }
      }
    },
    wylClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wyl")) {
          this.nextLine.delete("wyl");
          this.signals.wyl = false;
        } else {
          this.nextLine.add("wyl");
          this.signals.wyl = true;
        }
      }
    },
    welClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wel")) {
          this.nextLine.delete("wel");
          this.signals.wel = false;
        } else {
          this.nextLine.add("wel");
          this.signals.wel = true;
        }
      }
    },
    wyadClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wyad")) {
          this.nextLine.delete("wyad");
          this.signals.wyad = false;
        } else {
          this.nextLine.add("wyad");
          this.signals.wyad = true;
        }
      }
    },
    weiClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wei")) {
          this.nextLine.delete("wei");
          this.signals.wei = false;
        } else {
          this.nextLine.add("wei");
          this.signals.wei = true;
        }
      }
    },
    iakClick() {
      if (this.manualMode) {
        if (this.nextLine.has("iak")) {
          this.nextLine.delete("iak");
          this.signals.iak = false;
        } else {
          this.nextLine.add("iak");
          this.signals.iak = true;
        }
      }
    },
    dakClick() {
      if (this.manualMode) {
        if (this.nextLine.has("dak")) {
          this.nextLine.delete("dak");
          this.signals.dak = false;
        } else {
          this.nextLine.add("dak");
          this.signals.dak = true;
        }
      }
    },
    weakClick() {
      if (this.manualMode) {
        if (this.nextLine.has("weak")) {
          this.nextLine.delete("weak");
          this.signals.weak = false;
        } else {
          this.nextLine.add("weak");
          this.signals.weak = true;
        }
      }
    },
    wejaClick() {
      if (this.manualMode) {
        if (this.nextLine.has("weja")) {
          this.nextLine.delete("weja");
          this.signals.weja = false;
        } else {
          this.nextLine.add("weja");
          this.signals.weja = true;
        }
      }
    },
    wyakClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wyak")) {
          this.nextLine.delete("wyak");
          this.signals.wyak = false;
        } else {
          this.nextLine.add("wyak");
          this.signals.wyak = true;
        }
      }
    },
    dodClick() {
      if (this.manualMode) {
        if (this.nextLine.has("dod")) {
          this.nextLine.delete("dod");
          this.signals.dod = false;
        } else {
          this.nextLine.add("dod");
          this.signals.dod = true;
        }
      }
    },
    odeClick() {
      if (this.manualMode) {
        if (this.nextLine.has("ode")) {
          this.nextLine.delete("ode");
          this.signals.ode = false;
        } else {
          this.nextLine.add("ode");
          this.signals.ode = true;
        }
      }
    },
    przepClick() {
      if (this.manualMode) {
        if (this.nextLine.has("przep")) {
          this.nextLine.delete("przep");
          this.signals.przep = false;
        } else {
          this.nextLine.add("przep");
          this.signals.przep = true;
        }
      }
    },
    mnoClick() {
      if (this.manualMode) {
        if (this.nextLine.has("mno")) {
          this.nextLine.delete("mno");
          this.signals.mno = false;
        } else {
          this.nextLine.add("mno");
          this.signals.mno = true;
        }
      }
    },
    dzielClick() {
      if (this.manualMode) {
        if (this.nextLine.has("dziel")) {
          this.nextLine.delete("dziel");
          this.signals.dziel = false;
        } else {
          this.nextLine.add("dziel");
          this.signals.dziel = true;
        }
      }
    },
    shrClick() {
      if (this.manualMode) {
        if (this.nextLine.has("shr")) {
          this.nextLine.delete("shr");
          this.signals.shr = false;
        } else {
          this.nextLine.add("shr");
          this.signals.shr = true;
        }
      }
    },
    shlClick() {
      if (this.manualMode) {
        if (this.nextLine.has("shl")) {
          this.nextLine.delete("shl");
          this.signals.shl = false;
        } else {
          this.nextLine.add("shl");
          this.signals.shl = true;
        }
      }
    },
    negClick() {
      if (this.manualMode) {
        if (this.nextLine.has("neg")) {
          this.nextLine.delete("neg");
          this.signals.neg = false;
        } else {
          this.nextLine.add("neg");
          this.signals.neg = true;
        }
      }
    },
    lubClick() {
      if (this.manualMode) {
        if (this.nextLine.has("lub")) {
          this.nextLine.delete("lub");
          this.signals.lub = false;
        } else {
          this.nextLine.add("lub");
          this.signals.lub = true;
        }
      }
    },
    iClick() {
      if (this.manualMode) {
        if (this.nextLine.has("i")) {
          this.nextLine.delete("i");
          this.signals.i = false;
        } else {
          this.nextLine.add("i");
          this.signals.i = true;
        }
      }
    },
    wyxClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wyx")) {
          this.nextLine.delete("wyx");
          this.signals.wyx = false;
        } else {
          this.nextLine.add("wyx");
          this.signals.wyx = true;
        }
      }
    },
    wexClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wex")) {
          this.nextLine.delete("wex");
          this.signals.wex = false;
        } else {
          this.nextLine.add("wex");
          this.signals.wex = true;
        }
      }
    },
    wyyClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wyy")) {
          this.nextLine.delete("wyy");
          this.signals.wyy = false;
        } else {
          this.nextLine.add("wyy");
          this.signals.wyy = true;
        }
      }
    },
    weyClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wey")) {
          this.nextLine.delete("wey");
          this.signals.wey = false;
        } else {
          this.nextLine.add("wey");
          this.signals.wey = true;
        }
      }
    },
    weaClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wea")) {
          this.nextLine.delete("wea");
          this.signals.wea = false;
        } else {
          this.nextLine.add("wea");
          this.signals.wea = true;
        }
      }
    },
    wesClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wes")) {
          this.nextLine.delete("wes");
          this.signals.wes = false;
        } else {
          this.nextLine.add("wes");
          this.signals.wes = true;
        }
      }
    },
    wysClick() {
      if (this.manualMode) {
        if (this.nextLine.has("wys")) {
          this.nextLine.delete("wys");
          this.signals.wys = false;
        } else {
          this.nextLine.add("wys");
          this.signals.wys = true;
        }
      }
    },
    asClick() {
      if (this.manualMode) {
        if (this.nextLine.has("as")) {
          this.nextLine.delete("as");
          this.signals.as = false;
        } else {
          this.nextLine.add("as");
          this.signals.as = true;
        }
      }
    },
    saClick() {
      if (this.manualMode) {
        if (this.nextLine.has("sa")) {
          this.nextLine.delete("sa");
          this.signals.sa = false;
        } else {
          this.nextLine.add("sa");
          this.signals.sa = true;
        }
      }
    },
    czytClick() {
      if (this.manualMode) {
        if (this.nextLine.has("czyt")) {
          this.nextLine.delete("czyt");
          this.signals.czyt = false;
        } else {
          this.nextLine.add("czyt");
          this.signals.czyt = true;
        }
      }
    },
    piszClick() {
      if (this.manualMode) {
        if (this.nextLine.has("pisz")) {
          this.nextLine.delete("pisz");
          this.signals.pisz = false;
        } else {
          this.nextLine.add("pisz");
          this.signals.pisz = true;
        }
      }
    },
    /* #endregion COMMAND CLICKS */


    /* #region AI CHAT */
    sendAiMessage() {
      console.log("AI message sent:", this.aiInput);
      if (this.aiInput.trim() === "") return;
      this.aiConversation.push({
        sender: "user",
        message: this.aiInput,
        timestamp: new Date(),
      });
      this.aiInput = "";

      // Simulate AI response
      setTimeout(() => {
        this.aiConversation.push({
          sender: "ai",
          message: "This is a simulated AI response.",
          timestamp: new Date(),
        });
      }, 1000);
    },

  },
  watch: {
    $data: {
      handler() {
        this.saveToLS();
      },
      deep: true,
    },
    memoryAddresBits() {
      this.resizeMemory();
    },
    lightMode() {
      // add lightMode or darkMode class to body
      if (this.lightMode) {
        document.body.classList.add("lightMode");
        document.body.classList.remove("darkMode");
      } else {
        document.body.classList.add("darkMode");
        document.body.classList.remove("lightMode");
      }
    },

  },
  mounted() {
    this.loadFromLS();
    this.resizeMemory();

    this.addLog("System initialized.", "System");
  },
};
</script>

<style scoped>
/* #region BASE */

.signal:not(.bus) {
  cursor: pointer;
  user-select: none;
}

.signal:hover:not(.bus) {
  --signal: var(--signal-hover) !important;
  --signalText: var(--signal-hover) !important;
}

.signal.active {
  --signal: var(--signal-active) !important;
  --signalText: var(--signal-active) !important;
}


.register {
  display: grid;
  grid-template-columns: auto auto 1fr;
  justify-content: stretch;
  align-items: stretch;
  padding: 0.125rem 0.5rem;
}

.register>span {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* #endregion BASE */

/* #region SETTINGS */

.simpleSvgButton {
  all: unset;
  cursor: pointer;
  user-select: none;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  transition: 0.5s ease-in-out;
  color: #ddd;
}

.simpleSvgButton svg {
  color: #ddd;
}

.simpleSvgButton:hover {
  transform: scale(1.1);

  transition: 0.25s ease-in-out;
}

.simpleSvgButton:active {
  transform: scale(0.9);

  transition: 0.1s ease-in-out;
}

#settings {

  position: absolute;
  z-index: 100;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;

  display: grid;
  justify-content: stretch;
  align-content: stretch;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  padding: 1rem;
  text-align: left;
  outline: 1px solid var(--panelOutlineColor, white);
  background-color: var(--panelBackgroundColor, white);

  border-radius: var(--default-border-radius, 0.25rem);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
}

#settings>.titleSpan {
  grid-column: 1 / -1;
  height: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  font-weight: bold;
}

#settings .flexColumn {
  display: flex;
  flex-direction: column;
}

#settings .flexRow {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
}

/* #settings:not(.open) > *:not(#openCloseSettings):not(.titleSpan) {
    display: none !important;
  } */
#settings .extras {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

#settings>#openCloseSettings {
  align-self: flex-start;
  justify-self: flex-end;

  position: absolute;
  top: 1rem;
  right: 1rem;

  height: 2rem;
  width: 2rem;
}

#settings>#openCloseSettings svg {
  width: 100%;
  height: 100%;
}

#settings input[type="number"] {
  padding: 0.25rem;
  border-radius: var(--default-border-radius, 0.25rem);
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--backgroundColor, white);
  color: var(--fontColor, black);
}

#settings select {
  padding: 0.25rem;
  border-radius: var(--default-border-radius, 0.25rem);
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--backgroundColor, white);
  color: var(--fontColor, black);
}


/* #endregion SETTINGS */

/* #region INPUTS CODE */

#inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: stretch;
  align-items: stretch;
}

#inputs .flexRow {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
}

#inputs textarea {
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: var(--default-border-radius, 0.25rem);

  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-family: monospace;
}

#inputs textarea:disabled {
  filter: contrast(0.5);
}

#inputs .compiledCode {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;

  flex-grow: 1;
}

#inputs .compiledCode .active {
  color: var(--signal-active);
}

#inputs .codeLine {
  flex-grow: 1;
  text-align: left;
  white-space: pre;
}

#inputs .nextLine {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

#inputs .nextLine span {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

#inputs .nextLine span span {
  white-space: pre;
}

/* #endregion INPUTS CODE */

/* #region MEMORY */

#memory {
  display: grid;
  align-items: stretch;
  justify-items: center;
  grid-template-areas:
    "wea ."
    "aRegister operations"
    "memoryTable operations"
    "sRegister operations"
    "signals .";
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto 1fr auto auto;
}

#memory #aRegister {
  grid-area: aRegister;
  border-radius: var(--default-border-radius, 0.25rem) var(--default-border-radius, 0.25rem) 0 0;
}


#memory #sRegister {
  grid-area: sRegister;
  border-radius: 0 0 var(--default-border-radius, 0.25rem) var(--default-border-radius, 0.25rem);
}

#memory>.register {
  border: 1px solid var(--panelOutlineColor, black);
  background: var(--panelBackgroundColor, black);
  display: grid;
  grid-template-columns: auto auto 1fr;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  justify-content: center;
  padding: 0.125rem 0.5rem;
  width: 100%;
}

#memoryTable {
  grid-area: memoryTable;
  display: grid;
  grid-template-columns: repeat(4, auto);
  border: 1px solid var(--panelOutlineColor, black);
  background: var(--panelBackgroundColor, black);
  width: 100%;
  overflow-y: auto;

  position: relative;

  resize: both;
  overflow: auto;
  min-width: 15rem;
  min-height: 15rem;
  height: 20rem;
  width: 25rem;
}

#memoryTable>div {
  min-width: 5rem;
  text-align: right;
  border: 1px solid var(--panelOutlineColor, black);
}

#memoryTable>span,
#memoryTable>input {
  border: 1px solid var(--panelOutlineColor, black);
  padding: 0.125rem;
  display: flex;
  justify-content: end;
  align-items: center;
}

#memoryTable>.label {
  font-weight: bold;
  position: sticky;
  top: 0;
  background-color: var(--panelBackgroundColor, black);
  white-space: nowrap;
  text-overflow: ellipsis;
  z-index: 10;
}

#memoryTable>.selected {
  border-top: 4px solid var(--signal-active) !important;
  border-bottom: 4px solid var(--signal-active) !important;
  background-color: color-mix(in srgb, transparent, var(--signal-active) 25%);
}

#memory .signals {
  grid-area: signals;
  display: flex;
  flex-direction: row;
  gap: 0.125rem;
  justify-content: center;
  align-items: center;
}

#memory .signal {
  height: 0.125rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 3rem;
}

#memory #wea {
  grid-area: wea;
  position: relative;
}

#memory #wes {
  margin-right: 0.25rem;
}

#memory #wys {
  margin-left: 0.25rem;
}

#memory #operations {
  grid-area: operations;
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: flex-start;
}


/* #endregion MEMORY */

/* #region BUS */

.bus {
  height: 0.125rem;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  position: relative;
}

.bus .line {
  height: 0.125rem;

  border: 1px solid var(--signal, black);
  background-color: var(--signal, black);
  flex-grow: 1;
}

/* .bus span {
  outline: 1px solid var(--signal, black);
  left: 100%;
  width: min-content;
  white-space: nowrap;
  padding: 0.25rem 0.5rem;
} */
.bus span {
  display: flex;
  left: 100%;
  width: min-content;
  white-space: nowrap;
  padding: 0.25rem 0.5rem;
}

/* #endregion BUS */

/* #region COUNTER */

#counter {
  display: grid;
  grid-template-areas:
    "il c c dl"
    ". wel wyl .";
  grid-template-rows: auto 2.5rem;
  grid-template-columns: auto 1fr 1fr auto;
  justify-content: stretch;
  align-items: stretch;
}

#counter #il {
  grid-area: il;
  justify-self: right;
  align-self: center;
}

#counter #dl {
  grid-area: dl;
  justify-self: left;
  align-self: center;
}

#counter .register {
  grid-area: c;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  border-radius: var(--default-border-radius, 0.25rem);
}

#counter #wel {
  grid-area: wel;
  margin-right: 0.25rem;
}

#counter #wyl {
  grid-area: wyl;
  margin-left: 0.25rem;
}

/* #endregion COUNTER */

/* #region BUS CONNECITON */

#sa {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
}

#as {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}

/* #endregion BUS CONNECITON */

/* #region iRegister */

#iRegister {
  display: flex;
  flex-direction: column;
  align-content: stretch;
}

#iRegister .register {
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  display: flex;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  width: 100%;
  border-radius: var(--default-border-radius, 0.25rem);
}

#iRegister .signal {
  flex-grow: 1;
  height: 0.125rem;
}

#iRegister #wyad {
  margin-right: 0.5rem;
}

#iRegister #wei {
  margin-left: 0.5rem;
}

/* #endregion iRegister */

/* #region CALC */

#calc {
  padding-top: 2rem;
  display: grid;
  grid-template-areas:
    ". . ."
    "accSignals accumulator ."
    "accSignals accumulator wyak"
    ". flags wyak"
    "jamlSignals jaml wyak"
    ". weja wyak";
  grid-template-rows: auto auto auto auto 1fr auto;
}

#calc #flags {
  grid-area: flags;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5rem;
  gap: 1rem;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  height: 3rem;
}

#calc #flags div {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--default-border-radius, 0.25rem);
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
}

#calc .accSignals {
  grid-area: accSignals;
}

#calc .jamlSignals {
  grid-area: jamlSignals;
}

#calc .accSignals,
#calc .jamlSignals {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-content: space-evenly;
  align-items: stretch;
}

#calc .accSignals>*,
#calc .jamlSignals>* {
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: stretch;
  align-items: center;
}

#calc .accSignals>*>*,
#calc .jamlSignals>*>* {
  flex-grow: 1;
  width: 100%;
}

#calc #accumulator {
  grid-area: accumulator;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  padding: 0.5rem;

  border-radius: var(--default-border-radius, 0.25rem) var(--default-border-radius, 0.25rem) 0 0;
}

#calc #jaml {
  grid-area: jaml;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  padding: 0.5rem;

  border-radius: 0 0 var(--default-border-radius, 0.25rem) var(--default-border-radius, 0.25rem);
}

#calc #weja {
  grid-area: weja;
  margin-right: 0.5rem;
  min-height: 3rem;
}

#calc #wyak {
  grid-area: wyak;
  border-top: var(--pathThickness, 0.125rem) solid var(--signal, black);
  border-radius: 0 var(--default-border-radius, 0.25rem) 0 0;
  padding-left: 0.5rem !important;
}

/* #endregion CALC */

/* #region EXTRA REGISTERS */

#xRegister,
#yRegister {
  display: grid;
  grid-template-areas:
    "in out"
    "r r";
  gap: 0 0.5rem;
}

#xRegister .register,
#yRegister .register {
  grid-area: r;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  display: flex;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--default-border-radius, 0.25rem);
}

/* #endregion EXTRA REGISTERS */

/* #region UI BUTTONS LEFT BOTTOM */

#ui {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  position: fixed;
  left: 1rem;
  bottom: 1rem;
}

#ui button {
  padding: 0.5rem;
  border: 0.0625rem solid #8888;
  outline: 0.0625rem solid #8888;
  cursor: pointer;

  border-radius: 100%;


  background-color: #eee;
  transition: 1s ease-out;
}

#ui button:not(:disabled):not(.simpleSvgButton):not(.SvgAndTextButton):hover {
  background-color: #fff;
  transform: translateY(-0.05rem) scale(1.05);
  transition: 0.1s ease-out;
}

#ui button:not(:disabled):not(.simpleSvgButton):not(.SvgAndTextButton):active {
  background-color: #aaa;
  transform: translateY(0.01rem) scale(0.98);
  transition: 0.01s ease-out;
}



/* #endregion UI BUTTONS LEFT BOTTOM */


/* #region INPUT WRAPPERS */

.inputWrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-content: stretch;
  align-content: stretch;
  gap: 0rem;
  width: 100%;
  position: relative;
}

.inputWrapper>* {
  grid-area: 1 / 1 / 2 / 2;
  width: 100%;
}

.inputWrapper input {
  opacity: 0;

  width: 100%;
}

.inputWrapper span {
  opacity: 1;

  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  pointer-events: none;
}

.inputWrapper:hover input {
  opacity: 1;
  width: 100%;
}

.inputWrapper:hover span {
  opacity: 0;
}

/* #endregion INPUT WRAPPERS */

/* #endregion TOGGLE BUTTON */

/* #region LISTA ROZKAZOW */


/* #endregion LISTA ROZKAZOW */

/* #region CONSOLE */

#console {
  scroll-behavior: smooth;

  grid-area: c;

  overflow: auto;
  resize: vertical;

  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.125rem;
  padding: 0.5rem;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  border-radius: var(--default-border-radius, 0.25rem);

  height: 10rem;
  min-height: 5rem;
  width: 100%;
  justify-self: stretch;
  align-self: stretch;
}

#console>div {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

#console>div>span.time {
  font-size: 0.625rem;

  background-color: #2228;
  padding: 0.25rem 0.5rem;
  color: white;
  border-radius: 0.25rem;

  display: flex;
  justify-content: center;
  align-items: center;
}

#console>div>span.class {
  font-size: 0.625rem;
  text-transform: uppercase;

  background-color: #2228;
  padding: 0.25rem;
  color: white;
  border-radius: 0.25rem;
  width: 5rem;

  display: flex;
  justify-content: center;
  align-items: center;
}

#console>div>span.message {
  font-size: 1rem;
}

#console>div.error {
  background-color: #f7514ba8;
}

#console>div.io {
  background-color: #f7fa52a8;
}

#console>div.command.compiler {
  background-color: #92f144a8;
}

#console>div.program.compiler {
  background-color: #00aaff88;
}


/* #endregion CONSOLE */

/* #region OL */

ol {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

/* #endregion OL */

/* #region PATHS AND ARROWS */

.pathDownOnLeft {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  position: relative;

  border-left: var(--pathThickness, 0.125rem) solid var(--signal, black);
  margin-bottom: var(--arrowHeadSize, 0.25rem);
  padding-top: var(--arrowHeadSize, 0.25rem);
  margin-left: var(--arrowHeadSize, 0.25rem);
  min-height: 2rem;
}

.pathDownOnLeft:after {
  content: "";
  position: absolute;
  border: var(--arrowHeadSize, 0.25rem) solid var(--signal, black);
  border-color: var(--signal, black) transparent transparent transparent;
  bottom: calc(-2 * var(--arrowHeadSize, 0.25rem));
  left: calc(-1 * var(--arrowHeadSize, 0.25rem) - 0.5 * var(--pathThickness, 0.125rem));
}


.pathDownOnRight {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: right;
  position: relative;

  border-right: var(--pathThickness, 0.125rem) solid var(--signal, black);
  margin-bottom: var(--arrowHeadSize, 0.25rem);
  padding-top: var(--arrowHeadSize, 0.25rem);
}

.pathDownOnRight:after {
  content: "";
  position: absolute;
  border: var(--arrowHeadSize, 0.25rem) solid var(--signal, black);
  border-color: var(--signal, black) transparent transparent transparent;
  bottom: calc(-2 * var(--arrowHeadSize, 0.25rem));
  right: calc(-1 * var(--arrowHeadSize, 0.25rem) - 0.5 * var(--pathThickness, 0.125rem));
}


.pathUpOnLeft {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;

  border-left: var(--pathThickness, 0.125rem) solid var(--signal, black);
  margin-top: var(--arrowHeadSize, 0.25rem);
  padding-bottom: var(--arrowHeadSize, 0.25rem);
}

.pathUpOnLeft:after {
  content: "";
  position: absolute;
  border: var(--arrowHeadSize, 0.25rem) solid var(--signal, black);
  border-color: transparent transparent var(--signal, black) transparent;
  top: calc(-2 * var(--arrowHeadSize, 0.25rem));
  left: calc(-1 * var(--arrowHeadSize, 0.25rem) - 0.5 * var(--pathThickness, 0.125rem));
}

.pathUpOnRight {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;

  border-right: var(--pathThickness, 0.125rem) solid var(--signal, black);
  margin-top: var(--arrowHeadSize, 0.25rem);
  padding-bottom: var(--arrowHeadSize, 0.25rem);
}

.pathUpOnRight:after {
  content: "";
  position: absolute;
  border: var(--arrowHeadSize, 0.25rem) solid var(--signal, black);
  border-color: transparent transparent var(--signal, black) transparent;
  top: calc(-2 * var(--arrowHeadSize, 0.25rem));
  right: calc(-1 * var(--arrowHeadSize, 0.25rem) - 0.5 * var(--pathThickness, 0.125rem));
}




.arrowRightOnBottom {
  color: var(--signalText, black);
  border-bottom: var(--arrowLineThickness, 0.125rem) solid var(--signal, black);
  padding-right: 0.5rem;
  position: relative;
  margin-right: var(--arrowHeadSize, 0.25rem);
}

.arrowRightOnBottom:after {
  content: "";
  position: absolute;
  border: var(--arrowHeadSize, 0.25rem) solid var(--signal, black);
  border-color: transparent transparent transparent var(--signal, black);
  right: calc(-2 * var(--arrowHeadSize, 0.25rem));
  bottom: calc(-1 * var(--arrowHeadSize, 0.25rem) - 0.5 * var(--arrowLineThickness, 0.125rem));
}

.arrowLeftOnBottom {
  color: var(--signalText, black);
  border-bottom: var(--arrowLineThickness, 0.125rem) solid var(--signal, black);
  padding-left: 0.5rem;
  position: relative;
  margin-left: var(--arrowHeadSize, 0.25rem);
}

.arrowLeftOnBottom:after {
  content: "";
  position: absolute;
  border: var(--arrowHeadSize, 0.25rem) solid var(--signal, black);
  border-color: transparent var(--signal, black) transparent transparent;
  left: calc(-2 * var(--arrowHeadSize, 0.25rem));
  bottom: calc(-1 * var(--arrowHeadSize, 0.25rem) - 0.5 * var(--arrowLineThickness, 0.125rem));
}






.lineRightOnBottom {
  color: var(--signalText, black);
  border-bottom: var(--arrowLineThickness, 0.125rem) dashed var(--signal, black);
  padding-right: 0.5rem;
  position: relative;
}

.lineRightOnBottom:after {
  content: "";
  position: absolute;

  width: var(--lineHeadThickness, 0.125rem);
  height: var(--lineHeadLength, 0.125rem);
  background-color: var(--signal, black);

  right: var(--lineHeadMargin, 0.125rem);
  bottom: calc(-0.5 * var(--lineHeadLength, 0.5rem) - 0.5 * var(--arrowLineThickness, 0.125rem));
}

.lineLeftOnBottom {
  color: var(--signalText, black);
  border-bottom: var(--arrowLineThickness, 0.125rem) dashed var(--signal, black);
  padding-left: 0.5rem;
  position: relative;
}

.lineLeftOnBottom:after {
  content: "";
  position: absolute;

  width: var(--lineHeadThickness, 0.125rem);
  height: var(--lineHeadLength, 0.125rem);
  background-color: var(--signal, black);

  left: var(--lineHeadMargin, 0.125rem);
  bottom: calc(-0.5 * var(--lineHeadLength, 0.5rem) - 0.5 * var(--arrowLineThickness, 0.125rem));
}

/* #endregion PATHS AND ARROWS */

/* #region AI CHAT */

#aiChat {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 100;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: stretch;
  align-content: stretch;

  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);

  border-radius: var(--default-border-radius, 0.25rem);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

  padding: 1rem;

  overflow: hidden;
  resize: both;
}

#aiChat #conversation {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: stretch;
  align-content: stretch;

  overflow-y: auto;

}

#aiChat #inputArea {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: stretch;
  align-content: stretch;

  width: 100%;
}

#aiChat #inputArea input {
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: var(--default-border-radius, 0.25rem);

  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-family: monospace;
}

#aiChat #conversation>div {
  display: grid;
  grid-template-areas: ". sender time" "icon message message";
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

#aiChat #conversation>div>div.icon {
  grid-area: icon;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #00aaff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

#aiChat #conversation>div>span.sender {
  grid-area: sender;
  font-size: 0.625rem;
  text-transform: uppercase;

  border-radius: 0.25rem;
  width: 5rem;

  display: flex;
  justify-content: center;
  align-items: center;
}

#aiChat #conversation>div>span.time {
  grid-area: time;
  font-size: 0.625rem;

  border-radius: 0.25rem;

  display: flex;
  justify-content: center;
  align-items: center;
}

#aiChat #conversation>div>span.message {
  grid-area: message;
  font-size: 1rem;
  padding: 0.75rem;
  background-color: #8888;
  border-radius: var(--default-border-radius, 0.25rem);
  width: 100%;
}



/* #endregion AI CHAT */

/* @import "@/assets/style/style.css"; */
</style>