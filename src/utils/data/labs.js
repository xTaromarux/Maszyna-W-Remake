export const defaultLabId = 'lab-fibonacci';

export const labCatalog = [
  {
    id: 'lab-fibonacci',
    titleKey: 'labs.catalog.fibonacci.title',
    descriptionKey: 'labs.catalog.fibonacci.description',
    outcomesKeys: [
      'labs.catalog.fibonacci.outcomes.memoryIndexing',
      'labs.catalog.fibonacci.outcomes.iterativeFlow',
      'labs.catalog.fibonacci.outcomes.resultExport',
    ],
    pythonOverview: `n = 5\nfib = [0, 1]\nfor i in range(2, n):\n    fib.append(fib[i - 1] + fib[i - 2])\nprint(fib[n - 1])`,
    asmStub: `L0: POB var_i
ODE var_n
SOZ L1
POB var_i
ODE var_1
LAD temp_1
POB var_fibAddr1
LAD var_fibAddr1Temp
DOD temp_1
LAD var_fibAddr1
var_fibAddr1: POB var_fib
LAD temp_2
POB var_fibAddr1Temp
LAD var_fibAddr1
POB var_i
ODE var_2
LAD temp_3
POB var_fibAddr2
LAD var_fibAddr2Temp
DOD temp_3
LAD var_fibAddr2
var_fibAddr2: POB var_fib
LAD temp_4
POB var_fibAddr2Temp
LAD var_fibAddr2
POB temp_2
DOD temp_4
LAD temp_0
POB var_fibAddr0
LAD var_fibAddr0Temp
DOD var_fibSize
LAD var_fibAddr0
POB var_fibSize
DOD var_1
LAD var_fibSize
POB temp_0
var_fibAddr0: LAD var_fib
POB var_fibAddr0Temp
LAD var_fibAddr0
POB var_i
DOD var_1
LAD var_i
SOB L0
L1: POB var_n
ODE var_1
LAD var_index_result
POB var_fibAddr3
LAD var_fibAddr3Temp
DOD var_index_result
LAD var_fibAddr3
var_fibAddr3: POB var_fib
LAD var_n
POB var_fibAddr3Temp
LAD var_fibAddr3
POB var_n
DOD var_Out0
WYP 2
STP

var_n: RST 5
var_fibSize: RST 2
var_1: RST 1
var_i: RST 2
var_fibAddr0Temp: RST 0
var_fibAddr1Temp: RST 0
var_2: RST 2
var_fibAddr2Temp: RST 0
var_fibAddr3Temp: RST 0
var_index_result: RPA
var_Out0: RST 48
temp_0: RPA
temp_1: RPA
temp_2: RPA
temp_3: RPA
temp_4: RPA
var_fib: RST 0
RST 1`,
  },
  {
    id: 'lab-array-min',
    titleKey: 'labs.catalog.arrayMin.title',
    descriptionKey: 'labs.catalog.arrayMin.description',
    outcomesKeys: [
      'labs.catalog.arrayMin.outcomes.comparisonLogic',
      'labs.catalog.arrayMin.outcomes.pointerAdvance',
      'labs.catalog.arrayMin.outcomes.stateReset',
    ],
    pythonOverview: `tablica = [10, -55, 12, -69]\nminimalny = tablica[0]\nfor i in range(1, len(tablica)):\n    if tablica[i] < minimalny:\n        minimalny = tablica[i]\nprint(minimalny)`,
    asmStub: `POB Tablica
LAD Minimalny
POB N
LAD loop_counter
LAD powtorzenieProgramu
Petla: POB loop_counter
ODE Jeden
SOZ Powtorzenie
LAD loop_counter
Rozkaz: POB Tablica
LAD Element
POB Minimalny
ODE Element
SOM Wiekszy
SOZ Wiekszy
POB Element
LAD Minimalny
POB Rozkaz
DOD Jeden
LAD Rozkaz
SOB Petla
Wiekszy: POB Rozkaz
DOD Jeden
LAD Rozkaz
SOB Petla
Powtorzenie: POB powtorzenieProgramu
ODE Jeden
SOZ Koniec
LAD powtorzenieProgramu
POB Rozkaz
ODE Jeden
LAD Rozkaz
SOB Powtorzenie
Koniec: POB Minimalny
WYP 2
STP

Element: RPA
Minimalny: RPA
Jeden: RST 1
N: RST 5
loop_counter: RPA
powtorzenieProgramu: RPA
Tablica: RST 10
RST -55
RST 12
RST -69`,
  },
  {
    id: 'lab-power-advanced',
    titleKey: 'labs.catalog.powerAdvanced.title',
    descriptionKey: 'labs.catalog.powerAdvanced.description',
    outcomesKeys: [
      'labs.catalog.powerAdvanced.outcomes.stackOps',
      'labs.catalog.powerAdvanced.outcomes.nestedLoops',
      'labs.catalog.powerAdvanced.outcomes.compoundComputation',
    ],
    pythonOverview: `a = 10\nb = 2\nprint(a ** b)`,
    asmStub: `POB A
LAD Add_counter
ODE jeden
LAD A_Ode_Jeden
POB B
LAD B_przechowanie

petla: POB B
ODE jeden
SOZ koniec
LAD B
POB A
LAD A_przechowanie

funkcja: POB Add_counter
ODE jeden
SOZ counter_zero
LAD Add_counter
POB A_przechowanie
DNS
POB A
DNS
SDP mnozenie
PZS
LAD A
SOB funkcja

mnozenie: PZS
LAD pointer
PZS
LAD A_podprogram
PZS
LAD A_stos
POB A_podprogram
DOD A_stos
DNS
POB pointer
DNS
PWR

counter_zero: POB Add_counter
DOD A_Ode_Jeden
LAD Add_counter
SOB petla

koniec: POB A
STP

A: RST 10
Add_counter: RST 0
A_przechowanie: RPA
A_stos: RPA
A_podprogram: RPA
A_Ode_Jeden: RPA
B: RST 2
B_przechowanie: RPA
jeden: RST 1
pointer: RPA`,
  },
  {
    id: 'lab-gcd',
    titleKey: 'labs.catalog.gcd.title',
    descriptionKey: 'labs.catalog.gcd.description',
    outcomesKeys: [
      'labs.catalog.gcd.outcomes.whileMapping',
      'labs.catalog.gcd.outcomes.branchingUpdate',
      'labs.catalog.gcd.outcomes.terminationCheck',
    ],
    pythonOverview: `a = 48\nb = 18\nwhile b != a:\n    if a > b:\n        a = a - b\n    else:\n        b = b - a\nprint(a)`,
    asmStub: `loopWhile: POB A
ODE B
SOZ Koniec
SOM bWieksze
LAD A
SOB loopWhile

bWieksze: POB B
ODE A
LAD B
SOB loopWhile

Koniec: DOD B
LAD A
POB A
STP

A: RST 48
B: RST 18`,
  },
  {
    id: 'lab-array-sum',
    titleKey: 'labs.catalog.arraySum.title',
    descriptionKey: 'labs.catalog.arraySum.description',
    outcomesKeys: [
      'labs.catalog.arraySum.outcomes.accumulation',
      'labs.catalog.arraySum.outcomes.indexAddressing',
      'labs.catalog.arraySum.outcomes.loopBoundaries',
    ],
    pythonOverview: `array = [1, 2, 3, 4, 5]\ntotal = 0\nfor i in range(0, 5):\n    total += array[i]\nprint(total)`,
    asmStub: `L0: POB var_i
ODE forEnd_0
SOZ L1
POB var_arrayAddr0
LAD var_arrayAddr0Temp
DOD var_i
LAD var_arrayAddr0
var_arrayAddr0: POB var_array
LAD temp_0
POB var_arrayAddr0Temp
LAD var_arrayAddr0
POB var_total
DOD temp_0
LAD var_total
POB var_i
DOD var_1
LAD var_i
SOB L0
L1: POB var_total
WYP 2
STP

var_arraySize: RST 5
var_total: RST 0
forEnd_0: RST 5
var_1: RST 1
var_i: RST 0
var_arrayAddr0Temp: RST 0
temp_0: RPA
var_array: RST 1
RST 2
RST 3
RST 4
RST 5`,
  },
  {
    id: 'lab-factorial',
    titleKey: 'labs.catalog.factorial.title',
    descriptionKey: 'labs.catalog.factorial.description',
    outcomesKeys: [
      'labs.catalog.factorial.outcomes.loopCondition',
      'labs.catalog.factorial.outcomes.multiplicativeState',
      'labs.catalog.factorial.outcomes.counterProgress',
    ],
    pythonOverview: `n = 5\nres = 1\ni = 1\nwhile i <= n:\n    res *= i\n    i += 1\nprint(res)`,
    asmStub: `start: POB var_i
ODE var_n
SOZ loop_body
SOM loop_body
SOB done

loop_body: POB var_res
MNO var_i
LAD var_res
POB var_i
DOD var_1
LAD var_i
SOB start

done: POB var_res
WYP 2
STP

var_n: RST 5
var_res: RST 1
var_i: RST 1
var_1: RST 1`,
  },
  {
    id: 'lab-input-filter-mo',
    titleKey: 'labs.catalog.inputFilterMo.title',
    descriptionKey: 'labs.catalog.inputFilterMo.description',
    outcomesKeys: [
      'labs.catalog.inputFilterMo.outcomes.inputHandling',
      'labs.catalog.inputFilterMo.outcomes.charFiltering',
      'labs.catalog.inputFilterMo.outcomes.formattedOutput',
    ],
    pythonOverview: `count_dollar = 0\nmo_chars = []\nwhile True:\n    ch = input()\n    if not ch:\n        continue\n    znak = ch[0]\n    if znak == '$':\n        count_dollar += 1\n        if count_dollar == 4:\n            result = ''.join(c for c in mo_chars if c in ['M', 'O'])\n            print(result)\n            break\n    elif znak in ['M', 'O']:\n        mo_chars.append(znak)\n# NOTE: paper marks this mapping as potentially buggy; ASM here is syntax-normalized.`,
    asmStub: `loop: WPR 1
ODE dolar
SOZ iter
DOD dolar
ODE duz_K
SOM loop
DOD duz_K
ODE duz_P
SOM przedzial
SOZ przedzial
SOB loop

przedzial: DOD duz_P
dodTab: LAD tab
POB dodTab
DOD jeden
LAD dodTab
POB rozm_tab
DOD jeden
LAD rozm_tab
SOB loop

iter: POB n_dol
ODE jeden
LAD n_dol
SOZ wypiszKoniec
SOB loop

wypiszKoniec: POB endl
WYP 2
POB rozm_tab
LAD rozm_tab_temp

loop2: POB rozm_tab_temp
ODE jeden
LAD rozm_tab_temp
SOZ iterM
przejscieTab: POB tab
ODE duz_M
SOZ licznikM
DOD duz_M
ODE duz_O
SOZ licznikO
DOD duz_O
SOB przejscieTab2

licznikM: POB n_M
DOD jeden
LAD n_M
SOB przejscieTab2

licznikO: POB n_O
DOD jeden
LAD n_O
SOB przejscieTab2

przejscieTab2: POB przejscieTab
DOD jeden
LAD przejscieTab
SOB loop2

iterM: POB n_M
LAD iteracja

wypiszM: POB iteracja
ODE jeden
LAD iteracja
SOM koniecLinii
POB duz_M
WYP 2
POB spacja
WYP 2
SOB wypiszM

koniecLinii: POB endl
WYP 2
POB n_O
LAD iteracja

wypiszO: POB iteracja
ODE jeden
LAD iteracja
SOM koniec
POB duz_O
WYP 2
POB spacja
WYP 2
SOB wypiszO

koniec: STP

duz_K: RST 75
duz_P: RST 80
duz_M: RST 77
duz_O: RST 79
jeden: RST 1
n_dol: RST 4
n_M: RST 0
n_O: RST 0
dolar: RST 36
spacja: RST 32
endl: RST 10
iteracja: RPA
rozm_tab_temp: RST 0
rozm_tab: RST 0
tab: RPA`,
  },
  {
    id: 'lab-interrupts',
    titleKey: 'labs.catalog.interrupts.title',
    descriptionKey: 'labs.catalog.interrupts.description',
    outcomesKeys: [
      'labs.catalog.interrupts.outcomes.irqMasking',
      'labs.catalog.interrupts.outcomes.irqHandlers',
      'labs.catalog.interrupts.outcomes.stackRecovery',
    ],
    pythonOverview: `ASM-only scenario from the paper.\nMain loop prints '#'.\nInterrupts 1..4 print 1x'1', 2x'2', 9x'3', 16x'4'.\nAfter configured interrupt counters expire, program stops.`,
    asmStub: `SOB PROGRAM
SOB P1
SOB P2
SOB P3
SOB P4

PROGRAM: POB dwa
LAD P1counter
POB trzy
LAD i
POB zero
LAD wypisanieP1

loop1: POB i
ODE jeden
LAD i
SOM przygP2
POB wypisanieP1
DOD jeden
LAD wypisanieP1
SOB loop1

przygP2: POB cztery
LAD P2counter
POB trzy
LAD i
POB zero
LAD wypisanieP2

loop2: POB i
ODE jeden
LAD i
SOM przygP3
POB wypisanieP2
DOD dwa
LAD wypisanieP2
SOB loop2

przygP3: POB szesc
LAD P3counter
POB trzy
LAD i
POB zero
LAD wypisanieP3

loop3: POB i
ODE jeden
LAD i
SOM przygP4
POB wypisanieP3
DOD trzy
LAD wypisanieP3
SOB loop3

przygP4: POB osiem
LAD P4counter
POB trzy
LAD i
POB zero
LAD wypisanieP4

loop4: POB i
ODE jeden
LAD i
SOM przygZnak
POB wypisanieP4
DOD cztery
LAD wypisanieP4
SOB loop4

przygZnak: POB hasztaq

infiLoop: WYP 2
SOB infiLoop

koniec: PZS
PZS
STP

P1: CZM MASKA1
MAS 15
DNS
POB wypisanieP1
LAD it1

wypiszP1: POB it1
ODE jeden
LAD it1
SOM koniecP1
POB nr1
WYP 2
SOB wypiszP1

koniecP1: POB P1counter
ODE jeden
LAD P1counter
SOZ koniec
PZS
MSK MASKA1
PWR

P2: CZM MASKA2
MAS 7
DNS
POB wypisanieP2
LAD it2

wypiszP2: POB it2
ODE jeden
LAD it2
SOM koniecP2
POB nr2
WYP 2
SOB wypiszP2

koniecP2: POB P2counter
ODE jeden
LAD P2counter
SOZ koniec
PZS
MSK MASKA2
PWR

P3: CZM MASKA3
MAS 3
DNS
POB wypisanieP3
LAD it3

wypiszP3: POB it3
ODE jeden
LAD it3
SOM koniecP3
POB nr3
WYP 2
SOB wypiszP3

koniecP3: POB P3counter
ODE jeden
LAD P3counter
SOZ koniec
PZS
MSK MASKA3
PWR

P4: CZM MASKA4
MAS 1
DNS
POB wypisanieP4
LAD it4

wypiszP4: POB it4
ODE jeden
LAD it4
SOM koniecP4
POB nr4
WYP 2
SOB wypiszP4

koniecP4: POB P4counter
ODE jeden
LAD P4counter
SOZ koniec
PZS
MSK MASKA4
PWR

i: RPA
it1: RPA
it2: RPA
it3: RPA
it4: RPA
MASKA1: RPA
MASKA2: RPA
MASKA3: RPA
MASKA4: RPA
P1counter: RPA
P2counter: RPA
P3counter: RPA
P4counter: RPA
wypisanieP1: RPA
wypisanieP2: RPA
wypisanieP3: RPA
wypisanieP4: RPA
hasztaq: RST 35
zero: RST 0
jeden: RST 1
dwa: RST 2
trzy: RST 3
cztery: RST 4
szesc: RST 6
osiem: RST 8
nr1: RST 49
nr2: RST 50
nr3: RST 51
nr4: RST 52`,
  },
];

export function createLabCatalog() {
  return labCatalog.map((lab) => ({
    ...lab,
    outcomesKeys: Array.isArray(lab.outcomesKeys) ? [...lab.outcomesKeys] : [],
  }));
}
