/* eslint-disable no-bitwise */
export const mainMicroInstructionExecutionMethods: Record<string, (...args: any[]) => any> = {
  detectAndHandleStackOperations() {
    const signals = this.nextLine;
    if (signals.has('wyws') && signals.has('wea') && signals.has('wyak') && signals.has('wes')) {
      this.stackPush('Data', this.ACC);
      return;
    }
    if (
      signals.has('czyt') &&
      signals.has('wys') &&
      signals.has('weja') &&
      signals.has('przep') &&
      signals.has('weak') &&
      signals.has('iws') &&
      signals.has('wyl') &&
      signals.has('wea')
    ) {
      console.log('PZS: popping stack to ACC');
      const memAddrToClear = this.WS & this.addrMask();
      this.stackPop('Data');
      this._pendingMemoryClear = memAddrToClear;
      return;
    }
    if (signals.has('dws') && signals.has('wyws') && signals.has('wyls') && signals.has('pisz')) {
      this.stackPush('Address', this.programCounter);
      return;
    }
    if (signals.has('czyt') && signals.has('wys') && signals.has('sa') && signals.has('wel') && signals.has('iws')) {
      console.log('PWR: powrót z podprogramu');
      const memAddrToClear = this.WS & this.addrMask();

      const returnAddr = this.stackPop('Address');
      console.log('PWR: returnAddr=', returnAddr);

      this._pendingMemoryClear = memAddrToClear;
      return;
    }
  },

  executeSignalsFromNextLine() {
    if (!this.isFastRunning) this.clearActiveTimeouts();
    this.detectAndHandleStackOperations();
    if (this.nextLine.has('wyl')) this.wyl();
    if (this.nextLine.has('czyt')) this.czyt();
    if (this.nextLine.has('pisz')) this.pisz();
    if (this.nextLine.has('wys')) this.wys();
    if (this.nextLine.has('stop')) this.stop();
    if (this.nextLine.has('wyad')) this.wyad();
    if (this.nextLine.has('wyak')) this.wyak();
    if (this.nextLine.has('wyx')) this.wyx();
    if (this.nextLine.has('wyy')) this.wyy();
    if (this.nextLine.has('wyws')) this.wyws();
    if (this.nextLine.has('wyls')) this.wyls();
    if (this.nextLine.has('wyg')) this.wyg();
    if (this.nextLine.has('wyrb')) this.wyrb();
    if (this.nextLine.has('wyap')) this.wyap();
    if (this.nextLine.has('wyrm')) this.wyrm();
    if (this.nextLine.has('wyrz')) this.wyrz();
    if (this.nextLine.has('wyrp')) this.wyrp();

    if (this.nextLine.has('sa')) this.sa();
    if (this.nextLine.has('as')) this.as();
    if (this.nextLine.has('wea')) this.wea();
    if (this.nextLine.has('weja')) this.weja();
    if (this.nextLine.has('wex')) this.wex();
    if (this.nextLine.has('wey')) this.wey();
    if (this.nextLine.has('wes')) this.wes();
    if (this.nextLine.has('wei')) this.wei();
    if (this.nextLine.has('wel')) this.wel();
    if (this.nextLine.has('werm')) this.werm();
    if (this.nextLine.has('weap')) this.weap();
    if (this.nextLine.has('werz')) this.werz();
    if (this.nextLine.has('werp')) this.werp();
    if (this.nextLine.has('dod')) this.dod();
    if (this.nextLine.has('ode')) this.ode();
    if (this.nextLine.has('przep')) this.przep();
    if (this.nextLine.has('mno')) this.mno();
    if (this.nextLine.has('dziel')) this.dziel();
    if (this.nextLine.has('shr')) this.shr();
    if (this.nextLine.has('shl')) this.shl();
    if (this.nextLine.has('neg')) this.neg();
    if (this.nextLine.has('lub')) this.lub();
    if (this.nextLine.has('i')) this.i();

    if (this.nextLine.has('iak')) this.iak();
    if (this.nextLine.has('dak')) this.dak();

    if (this.nextLine.has('weak')) this.weak();

    if (this.nextLine.has('il')) this.il();
    if (this.nextLine.has('dl')) this.dl();

    if (this.nextLine.has('iws')) this.iws();
    if (this.nextLine.has('dws')) this.dws();
    if (this.nextLine.has('werb')) this.werb();
    if (this.nextLine.has('start')) this.start();
    if (this.nextLine.has('ustrm')) this.ustrm();
    if (this.nextLine.has('czrm')) this.czrm();
    this.nextLine.clear();
    if (this._pendingMemoryClear !== null) {
      const idx = this._pendingMemoryClear;
      this.mem[idx] = 0;
      this.addLog(`Wyczyszczono komórkę pamięci [${idx}] po zdjęciu ze stosu`, 'stos');
      this._pendingMemoryClear = null;
    }
  },

  _instant(fn) {
    if (this.isFastRunning) {
      fn();
      return true;
    }
    return false;
  },

  il() {
    if (
      this._instant(() => {
        this.programCounter++;
      })
    )
      return;
    this.signals.il = true;
    this.programCounter++;
    const timeoutId = setTimeout(() => {
      this.signals.il = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  dl() {
    if (
      this._instant(() => {
        this.programCounter--;
      })
    )
      return;
    this.signals.dl = true;
    this.programCounter--;
    const timeoutId = setTimeout(() => {
      this.signals.dl = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  wyl() {
    if (
      this._instant(() => {
        this.BusA = this.programCounter;
      })
    )
      return;
    this.signals.wyl = true;
    this.signals.busA = true;
    this.BusA = this.programCounter;
    const timeoutId = setTimeout(() => {
      this.signals.wyl = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('A');
  },
  wel() {
    if (
      this._instant(() => {
        this.programCounter = this.BusA;
      })
    )
      return;
    this.signals.wel = true;
    this.signals.busA = true;
    this.programCounter = this.BusA;
    const timeoutId = setTimeout(() => {
      this.signals.wel = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('A');
  },
  wyad() {
    if (
      this._instant(() => {
        this.BusA = this.I;
      })
    )
      return;
    this.signals.wyad = true;
    this.signals.busA = true;
    this.BusA = this.I;
    const timeoutId = setTimeout(() => {
      this.signals.wyad = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('A');
  },
  wei() {
    if (
      this._instant(() => {
        const mask = (1 << this.addresBits) - 1;
        this.I = this.BusS & mask;
      })
    )
      return;
    this.signals.wei = true;
    this.signals.busS = true;
    const mask = (1 << this.addresBits) - 1;
    this.I = this.BusS & mask;
    const timeoutId = setTimeout(() => {
      this.signals.wei = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },

  iak() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(this.ACC + 1);
      })
    )
      return;
    this.signals.iak = true;
    this.ACC = this.toWord(this.ACC + 1);
    const timeoutId = setTimeout(() => {
      this.signals.iak = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  dak() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(this.ACC - 1);
      })
    )
      return;
    this.signals.dak = true;
    this.ACC = this.toWord(this.ACC - 1);
    const timeoutId = setTimeout(() => {
      this.signals.dak = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },

  weak() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(this.JAML);
      })
    )
      return;
    this.signals.weak = true;
    this.ACC = this.toWord(this.JAML);
    const timeoutId = setTimeout(() => {
      this.signals.weak = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  weja() {
    if (
      this._instant(() => {
        this.JAML = this.toWord(this.BusS);
      })
    )
      return;
    this.signals.weja = true;
    this.signals.busS = true;
    this.JAML = this.toWord(this.BusS);
    const timeoutId = setTimeout(() => {
      this.signals.weja = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },
  wyak() {
    if (
      this._instant(() => {
        this.BusS = this.toWord(this.ACC);
      })
    )
      return;
    this.signals.wyak = true;
    this.signals.busS = true;
    this.BusS = this.toWord(this.ACC);
    const timeoutId = setTimeout(() => {
      this.signals.wyak = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },

  dod() {
    if (
      this._instant(() => {
        this.JAML = this.toWord(this.JAML + this.ACC);
      })
    )
      return;
    this.signals.dod = true;
    this.JAML = this.toWord(this.JAML + this.ACC);
    const timeoutId = setTimeout(() => {
      this.signals.dod = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  ode() {
    if (
      this._instant(() => {
        this.JAML = this.toWord(this.ACC - this.JAML);
      })
    )
      return;
    this.signals.ode = true;
    this.JAML = this.toWord(this.ACC - this.JAML);
    const timeoutId = setTimeout(() => {
      this.signals.ode = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  przep() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(this.JAML);
      })
    )
      return;
    this.signals.przep = true;
    this.ACC = this.toWord(this.JAML);
    const timeoutId = setTimeout(() => {
      this.signals.przep = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  mno() {
    if (
      this._instant(() => {
        this.JAML = this.toWord(this.ACC * this.JAML);
      })
    )
      return;
    this.signals.mno = true;
    this.JAML = this.toWord(this.ACC * this.JAML);
    const timeoutId = setTimeout(() => {
      this.signals.mno = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  dziel() {
    if (
      this._instant(() => {
        const d = this.JAML & 0xff;
        this.JAML = this.toWord(d === 0 ? 0 : Math.trunc(this.ACC / d));
      })
    )
      return;
    this.signals.dziel = true;
    const d = this.JAML & 0xff;
    this.JAML = this.toWord(d === 0 ? 0 : Math.trunc(this.ACC / d));
    const timeoutId = setTimeout(() => {
      this.signals.dziel = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  shr() {
    if (
      this._instant(() => {
        const sh = this.JAML & 7;
        this.ACC = this.toWord((this.ACC & this.wordMask()) >>> sh);
      })
    )
      return;
    this.signals.shr = true;
    const sh = this.JAML & 7;
    this.ACC = this.toWord((this.ACC & this.wordMask()) >>> sh);
    const timeoutId = setTimeout(() => {
      this.signals.shr = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  shl() {
    if (
      this._instant(() => {
        const sh = this.JAML & 7;
        this.ACC = this.toWord(this.ACC << sh);
      })
    )
      return;
    this.signals.shl = true;
    const sh = this.JAML & 7;
    this.ACC = this.toWord(this.ACC << sh);
    const timeoutId = setTimeout(() => {
      this.signals.shl = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  neg() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(-this.ACC);
      })
    )
      return;
    this.signals.neg = true;
    this.ACC = this.toWord(-this.ACC);
    const timeoutId = setTimeout(() => {
      this.signals.neg = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  lub() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(this.ACC | this.JAML);
      })
    )
      return;
    this.signals.lub = true;
    this.ACC = this.toWord(this.ACC | this.JAML);
    const timeoutId = setTimeout(() => {
      this.signals.lub = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },
  i() {
    if (
      this._instant(() => {
        this.ACC = this.toWord(this.ACC & this.JAML);
      })
    )
      return;
    this.signals.i = true;
    this.ACC = this.toWord(this.ACC & this.JAML);
    const timeoutId = setTimeout(() => {
      this.signals.i = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },

  wyx() {
    if (
      this._instant(() => {
        this.BusS = this.toWord(this.X);
      })
    )
      return;
    this.signals.wyx = true;
    this.signals.busS = true;
    this.BusS = this.toWord(this.X);
    const timeoutId = setTimeout(() => {
      this.signals.wyx = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },
  wex() {
    if (
      this._instant(() => {
        this.X = this.toWord(this.BusS);
      })
    )
      return;
    this.signals.wex = true;
    this.signals.busS = true;
    this.X = this.toWord(this.BusS);
    const timeoutId = setTimeout(() => {
      this.signals.wex = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },
  wyy() {
    if (
      this._instant(() => {
        this.BusS = this.toWord(this.Y);
      })
    )
      return;
    this.signals.wyy = true;
    this.signals.busS = true;
    this.BusS = this.toWord(this.Y);
    const timeoutId = setTimeout(() => {
      this.signals.wyy = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },
  wey() {
    if (
      this._instant(() => {
        this.Y = this.toWord(this.BusS);
      })
    )
      return;
    this.signals.wey = true;
    this.signals.busS = true;
    this.Y = this.toWord(this.BusS);
    const timeoutId = setTimeout(() => {
      this.signals.wey = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },

  wea() {
    if (
      this._instant(() => {
        this.A = this.BusA & this.addrMask();
      })
    )
      return;
    this.signals.wea = true;
    this.signals.busA = true;
    this.A = this.BusA & this.addrMask();
    const timeoutId = setTimeout(() => {
      this.signals.wea = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('A');
  },
  wes() {
    if (
      this._instant(() => {
        this.S = this.toWord(this.BusS);
      })
    )
      return;
    this.signals.wes = true;
    this.signals.busS = true;
    this.S = this.toWord(this.BusS);
    const timeoutId = setTimeout(() => {
      this.signals.wes = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },
  wys() {
    if (
      this._instant(() => {
        this.BusS = this.toWord(this.S);
      })
    )
      return;
    this.signals.wys = true;
    this.signals.busS = true;
    this.BusS = this.toWord(this.S);
    console.log('WYS: S=', this.S, 'BusS=', this.BusS);
    const timeoutId = setTimeout(() => {
      this.signals.wys = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('S');
  },

  stop() {
    if (
      this._instant(() => {
        this._stopRun();
        this.codeCompiled = false;
        this.nextLine.clear();
      })
    )
      return;

    this.signals.stop = true;
    const id = setTimeout(() => {
      this.signals.stop = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);

    this._stopRun();
    this.codeCompiled = false;
    this.nextLine.clear();
  },

  as() {
    if (
      this._instant(() => {
        this.BusS = this.BusA;
      })
    )
      return;
    this.signals.as = true;
    this.signals.busA = true;
    this.signals.busS = true;
    this.BusS = this.BusA;
    const timeoutId = setTimeout(() => {
      this.signals.as = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('A');
    this.holdBus('S');
  },
  sa() {
    if (
      this._instant(() => {
        this.BusA = this.BusS;
      })
    )
      return;
    this.signals.sa = true;
    this.signals.busA = true;
    this.signals.busS = true;
    this.BusA = this.BusS;
    const timeoutId = setTimeout(() => {
      this.signals.sa = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
    this.holdBus('A');
    this.holdBus('S');
  },

  czyt() {
    if (
      this._instant(() => {
        const idx = this.A & this.addrMask();
        this.S = this.toWord(this.mem[idx] ?? 0);
      })
    )
      return;
    this.signals.czyt = true;
    const idx = this.A & this.addrMask();
    this.S = this.toWord(this.mem[idx] ?? 0);
    console.log('CZYT: A=', this.A, 'idx=', idx, 'mem[idx]=', this.mem[idx], 'S=', this.S);
    const timeoutId = setTimeout(() => {
      this.signals.czyt = false;
    }, this.oddDelay);

    this.activeTimeouts.push(timeoutId);
  },
  pisz() {
    if (
      this._instant(() => {
        const idx = this.A & this.addrMask();
        this.mem[idx] = this.toWord(this.S);
      })
    )
      return;
    this.signals.pisz = true;
    const idx = this.A & this.addrMask();
    this.mem[idx] = this.toWord(this.S);
    const timeoutId = setTimeout(() => {
      this.signals.pisz = false;
    }, this.oddDelay);
    this.activeTimeouts.push(timeoutId);
  },

  wyws() {
    if (
      this._instant(() => {
        this.BusA = this.WS & this.addrMask();
      })
    )
      return;
    this.signals.wyws = true;
    this.signals.busA = true;
    this.BusA = this.WS & this.addrMask();
    const id = setTimeout(() => {
      this.signals.wyws = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('A');
  },
  iws() {
    if (
      this._instant(() => {
        const size = 1 << this.addresBits;
        this.WS = (this.WS + 1) % size;
      })
    )
      return;
    this.signals.iws = true;
    const size = 1 << this.addresBits;
    this.WS = (this.WS + 1) % size;
    const id = setTimeout(() => {
      this.signals.iws = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
  },
  dws() {
    if (
      this._instant(() => {
        const size = 1 << this.addresBits;
        this.WS = (this.WS - 1 + size) % size;
      })
    )
      return;
    this.signals.dws = true;
    const size = 1 << this.addresBits;
    this.WS = (this.WS - 1 + size) % size;
    const id = setTimeout(() => {
      this.signals.dws = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
  },

  wyls() {
    if (
      this._instant(() => {
        this.BusS = this.toWord(this.programCounter);
      })
    )
      return;
    this.signals.wyls = true;
    this.signals.busS = true;
    this.BusS = this.toWord(this.programCounter);
    const id = setTimeout(() => {
      this.signals.wyls = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('S');
  },
  wyg() {
    if (
      this._instant(() => {
        const g = this.DEV_READY ? 1 : 0;
        this.BusS = this.toWord(g);
        this.G = g;
      })
    )
      return;
    this.signals.wyg = true;
    this.signals.busS = true;
    const g = this.DEV_READY ? 1 : 0;
    this.BusS = this.toWord(this.DEV_READY ? 1 : 0);
    this.G = this.DEV_READY ? 1 : 0;
    const id = setTimeout(() => {
      this.signals.wyg = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('S');
  },
  werb() {
    if (
      this._instant(() => {
        const v = this.ACC & this.wordMask();
        this.DEV_OUT = v;
        this.RB = v;
      })
    )
      return;
    this.signals.werb = true;
    const v = this.ACC & this.wordMask();
    this.DEV_OUT = v;
    this.RB = v;
    const id = setTimeout(() => {
      this.signals.werb = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
  },
  wyrb() {
    if (
      this._instant(() => {
        const canRead = this.DEV_READY === 0;
        const v = canRead ? this.DEV_IN & this.wordMask() : 0;
        this.BusS = v;
        this.RB = v;
        if (canRead) {
          this.DEV_IN = 0;
          this.DEV_READY = 1;
          this.G = 1;
        }
      })
    )
      return;
    this.signals.wyrb = true;
    this.signals.busS = true;
    const canRead = this.DEV_READY === 0;
    const v = canRead ? this.DEV_IN & this.wordMask() : 0;
    this.BusS = v;
    this.RB = v;
    if (canRead) {
      this.DEV_IN = 0;
      this.DEV_READY = 1;
      this.G = 1;
    }
    const id = setTimeout(() => {
      this.signals.wyrb = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('S');
  },
  start() {
    if (
      this._instant(() => {
        if (this.DEV_BUSY) return;
        this.DEV_BUSY = true;
        this.DEV_READY = this.DEV_IN ? 0 : 1;
        this.DEV_BUSY = false;
        this.DEV_READY = this.DEV_IN ? 0 : 1;
        this.G = this.DEV_READY ? 1 : 0;
      })
    )
      return;

    if (this.DEV_BUSY) return;
    this.DEV_BUSY = true;
    this.signals.start = true;
    this.DEV_READY = this.DEV_IN ? 0 : 1;
    const id = setTimeout(() => {
      this.signals.start = false;
      this.DEV_BUSY = false;
      this.DEV_READY = this.DEV_IN ? 0 : 1;
      this.G = this.DEV_READY ? 1 : 0;
    }, this.oddDelay * 2);
    this.activeTimeouts.push(id);
  },
  werm() {
    console.log('WERM called: BusS=', this.BusS, 'S=', this.S, 'A=', this.A);
    this.signals.werm = true;
    this.signals.busS = true;
    this.RM = this.BusS & 0xf;
    const id = setTimeout(() => {
      this.signals.werm = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    console.log('WERM result: RM=', this.RM);
    this.addLog(`RM ustawione na ${this.RM} (maska przerwań) [BusS=${this.BusS}]`, 'system');
  },

  wyrm() {
    this.signals.wyrm = true;
    this.signals.busS = true;
    this.BusS = this.RM & 0xf;
    const id = setTimeout(() => {
      this.signals.wyrm = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('S');
  },

  wyap() {
    this.signals.wyap = true;
    this.signals.busA = true;
    this.BusA = this.AP & this.addrMask();
    const id = setTimeout(() => {
      this.signals.wyap = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('A');
  },

  weap() {
    this.signals.weap = true;
    this.signals.busA = true;
    this.AP = this.BusA & this.addrMask();
    const id = setTimeout(() => {
      this.signals.weap = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
  },

  wyrz() {
    this.signals.wyrz = true;
    this.signals.busS = true;
    this.BusS = this.RZ & 0xf;
    const id = setTimeout(() => {
      this.signals.wyrz = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('S');
  },

  werz() {
    this.signals.werz = true;
    this.signals.busS = true;
    this.RZ = this.BusS & 0xf;
    const id = setTimeout(() => {
      this.signals.werz = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.addLog(`RZ ustawione na ${this.RZ} (zgłoszenia przerwań)`, 'system');
  },

  wyrp() {
    this.signals.wyrp = true;
    this.signals.busS = true;
    this.BusS = this.RP & 0xf;
    const id = setTimeout(() => {
      this.signals.wyrp = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.holdBus('S');
  },

  werp() {
    this.signals.werp = true;
    this.signals.busS = true;
    this.RP = this.BusS & 0xf;
    const id = setTimeout(() => {
      this.signals.werp = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.addLog(`RP ustawione na ${this.RP} (priorytet przerwania)`, 'system');
  },

  ustrm() {
    console.log('USTRM called, BusA=', this.BusA);
    this.signals.ustrm = true;
    this.signals.busA = true;
    const bitNum = this.BusA & 0x3;
    this.RM |= 1 << bitNum;
    this.RM &= 0xf;
    const id = setTimeout(() => {
      this.signals.ustrm = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.addLog(`Ustawiono bit ${bitNum} w RM (RM=${this.RM}) - zablokowano IRQ${bitNum + 1}`, 'przerwanie');
  },

  czrm() {
    this.signals.czrm = true;
    this.signals.busA = true;
    const bitNum = this.BusA & 0x3;
    this.RM &= ~(1 << bitNum);
    this.RM &= 0xf;
    const id = setTimeout(() => {
      this.signals.czrm = false;
    }, this.oddDelay);
    this.activeTimeouts.push(id);
    this.addLog(`Wyczyszczono bit ${bitNum} w RM (RM=${this.RM}) - odblokowano IRQ${bitNum + 1}`, 'przerwanie');
  },
};
