export const commandList = [
    // [stp]
    // Linie=5
    // Linia1=// zakończenie programu
    // Linia2=ROZKAZ STP;
    // Linia3=Argumenty 0;
    // Linia4=czyt wys wei il;
    // Linia5=stop;
    {
        name: "STP",
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
        name: "DOD",
        args: 1,
        description: "(Ak) + ((Ad)) -> Ak",
        lines: "czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;",
    },
    // [ode]
    // Linie=5
    // Linia1=// (Ak)-((Ad))->Ak
    // Linia2=ROZKAZ ODE;
    // Linia3=czyt wys wei il;
    // Linia4=wyad wea;
    // Linia5=czyt wys weja ode weak wyl wea;
    {
        name: "ODE",
        args: 1,
        description: "(Ak) - ((Ad)) -> Ak",
        lines: "czyt wys wei il;\nwyad wea;\nczyt wys weja ode weak wyl wea;",
    },
    // [pob]
    // Linie=5
    // Linia1=// ((Ad))->Ak
    // Linia2=ROZKAZ POB;
    // Linia3=czyt wys wei il;
    // Linia4=wyad wea;
    // Linia5=czyt wys weja przep weak wyl wea;
    {
        name: "POB",
        args: 1,
        description: "((Ad)) -> Ak",
        lines: "czyt wys wei il;\nwyad wea;\nczyt wys weja przep weak wyl wea;",
    },
    // [lad]
    // Linie=5
    // Linia1=// (Ak)->(Ad)
    // Linia2=ROZKAZ LAD;
    // Linia3=czyt wys wei il;
    // Linia4=wyad wea wyak wes;
    // Linia5=pisz wyl wea;
    {
        name: "LAD",
        args: 1,
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
        name: "SOB",
        args: 1,
        description: "skok bezwarunkowy",
        lines: "czyt wys wei il;\nwyad wea wel;",
    },

    /* [som]
    Linie=6
    Linia1=skok gdy (AK) < 0
    Linia2=ROZKAZ SOM;
    Linia3=czyt wys wei il;
    Linia4=IF N THEN @ujemne ELSE @dodatnie;
    Linia5=@ujemne wyad wea wel KONIEC;
    Linia6=@dodatnie wyl wea; */
    {
        name: "SOM",
        args: 1,
        description: "skok gdy (AK) < 0",
        lines: `czyt wys wei il;\nIF N THEN @ujemne ELSE @dodatnie;\n@ujemne wyad wea wel KONIEC;\n@dodatnie wyl wea;`,
    },

    // [soz]
    // Linie=6
    // Linia1=// skok gdy (AK) = 0
    // Linia2=ROZKAZ SOZ;
    // Linia3=czyt wys wei il;
    // Linia4=IF Z THEN @zero ELSE @niezero;
    // Linia5=@zero wyad wea wel KONIEC;
    // Linia6=@niezero wyl wea;
    {
        name: "SOZ",
        args: 1,
        description: "skok gdy (AK) = 0",
        lines: `czyt wys wei il;\nIF Z THEN @zero ELSE @niezero;\n@zero wyad wea wel KONIEC;\n@niezero wyl wea;`,
    },

    // [dns]
    // Linie=6
    // Linia1=rozkaz dns;
    // Linia2=Argumenty 0;
    // Linia3=czyt wys wei il;
    // Linia4=dws;
    // Linia5=wyws wea wyak wes;
    // Linia6=pisz wyl wea;
    {
        name: "DNS",
        args: 0,
        description: "rozkaz dns",
        lines: `czyt wys wei il;\ndws;\nwyws wea wyak wes;\npisz wyl wea;`,
    },

    // [pwr]
    // Linie=5
    // Linia1=rozkaz pwr;
    // Linia2=Argumenty 0;
    // Linia3=czyt wys wei il;
    // Linia4=wyws wea iws;
    // Linia5=czyt wys as wea wel;
    {
        name: "PWR",
        args: 0,
        description: "rozkaz pwr",
        lines: `czyt wys wei il;\nwyws wea iws;\nczyt wys as wea wel;`,
    },

    // [pzs]
    // Linie=5
    // Linia1=rozkaz pzs;
    // Linia2=Argumenty 0;
    // Linia3=czyt wys wei il;
    // Linia4=wyws wea iws;
    // Linia5=czyt wys weja przep weak wyl wea;
    {
        name: "PZS",
        args: 0,
        description: "rozkaz pzs",
        lines: `czyt wys wei il;\nwyws wea iws;\nczyt wys weja przep weak wyl wea;`,
    },

    // [sdp]
    // Linie=6
    // Linia1=rozkaz sdp;
    // Linia2=Argumenty 1;
    // Linia3=czyt wys wei il;
    // Linia4=dws;
    // Linia5=wyws wea wyls wes;
    // Linia6=pisz wyad wel wea;
    {
        name: "SDP",
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
        name: "DZI",
        args: 1,
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
        name: "MNO",
        args: 1,
        description: "ROZKAZ MNO",
        lines: `czyt wys wei il;\nwyad wea;\nczyt wys weja mno weak wyl wea;`,
    },

    // [wpr]
    // Linie=7
    // Linia1=// wczytaj znak z urządzenia zewnętrznego
    // Linia2=ROZKAZ WPR;
    // Linia3=Argumenty 0;
    // Linia4=czyt wys wei il;
    // Linia5=wyak weja ode weak start;
    // Linia6=@czekaj wyg weja ode weak IF Z THEN @gotowe ELSE @czekaj;
    // Linia7=@gotowe wyrb weja przep weak wyl wea;
    {
        name: "WPR",
        args: 1,
        description: "wczytaj znak z urządzenia zewnętrznego",
        lines: `czyt wys wei il;\nwyak weja ode weak start;\n@czekaj wyg weja ode weak IF Z THEN @gotowe ELSE @czekaj;\n@gotowe wyrb weja przep weak wyl wea;`,
    },

    // [wyp]
    // Linie=8
    // Linia1=// wyprowadź znak na urządzenie zewnętrzne
    // Linia2=ROZKAZ WYP;
    // Linia3=Argumenty 0;
    // Linia4=czyt wys wei il;
    // Linia5=wyak weja werb start;
    // Linia6=wyak wes weja ode weak;
    // Linia7=@czeka wyg weja ode weak IF Z THEN @gotowe ELSE @czeka;
    // Linia8=@gotowe wys weja przep weak wyl wea;
    {
        name: "WYP",
        args: 1,
        description: "wyprowadź znak na urządzenie zewnętrzne",
        lines: `czyt wys wei il;\nwyak weja werb start;\nwyak wes weja ode weak;\n@czeka wyg weja ode weak IF Z THEN @gotowe ELSE @czeka;\n@gotowe wys weja przep weak wyl wea;`,
    },
];