# WLAN Command List

Readable reference for commands defined in `src/utils/data/commands.js`.
Descriptions are localized when available.

## STP

- Args: 0
- Description (pl): zakończenie programu
- Description (en): program end
- Microcode lines: 2
- Microcode:

```text
czyt wys wei il;
stop;
```

## DOD

- Args: 1
- Description (pl): (Ak) + ((Ad)) -> Ak
- Description (en): (Ak) + ((Ad)) -> Ak
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad wea;
czyt wys weja dod weak wyl wea;
```

## ODE

- Args: 1
- Description (pl): (Ak) - ((Ad)) -> Ak
- Description (en): (Ak) - ((Ad)) -> Ak
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad wea;
czyt wys weja ode weak wyl wea;
```

## POB

- Args: 1
- Description (pl): ((Ad)) -> Ak
- Description (en): ((Ad)) -> Ak
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad wea;
czyt wys weja przep weak wyl wea;
```

## LAD

- Args: 1
- Description (pl): (Ak) -> (Ad)
- Description (en): (Ak) -> (Ad)
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad wea wyak wes;
pisz wyl wea;
```

## SOB

- Args: 1
- Description (pl): skok bezwarunkowy
- Description (en): unconditional jump
- Microcode lines: 2
- Microcode:

```text
czyt wys wei il;
wyad wea wel;
```

## SOM

- Args: 1
- Description (pl): skok gdy (AK) < 0
- Description (en): jump when (AK) < 0
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
IF N THEN @negative ELSE @positive;
@negative wyad wea wel END;
@positive wyl wea;
```

## SOZ

- Args: 1
- Description (pl): skok gdy (AK) = 0
- Description (en): jump when (AK) = 0
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
IF Z THEN @zero ELSE @notzero;
@zero wyad wea wel END;
@notzero wyl wea;
```

## DNS

- Args: 0
- Description (pl): rozkaz dns
- Description (en): DNS instruction
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
dws;
wyws wea wyak wes;
pisz wyl wea;
```

## PWR

- Args: 0
- Description (pl): rozkaz pwr
- Description (en): PWR instruction
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyws wea;
czyt wys sa wel iws;
```

## PZS

- Args: 0
- Description (pl): rozkaz pzs
- Description (en): PZS instruction
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyws wea;
czyt wys weja przep weak iws wyl wea;
```

## SDP

- Args: 1
- Description (pl): rozkaz sdp
- Description (en): SDP instruction
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
dws;
wyws wea wyls wes;
pisz wyad wel wea;
```

## DZI

- Args: 1
- Description (pl): ROZKAZ DZI
- Description (en): DZI instruction
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad wea;
czyt wys weja dziel weak wyl wea;
```

## MNO

- Args: 1
- Description (pl): ROZKAZ MNO
- Description (en): MNO instruction
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad wea;
czyt wys weja mno weak wyl wea;
```

## WPR

- Args: 1
- Description (pl): wczytaj znak z urządzenia zewnętrznego
- Description (en): read a character from an external device
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
wyak weja ode weak start;
@wait wyg weja ode weak IF Z THEN @done ELSE @wait;
@done wyrb weja przep weak wyl wea;
```

## WYP

- Args: 1
- Description (pl): wyprowadź znak na urządzenie zewnętrzne
- Description (en): output a character to an external device
- Microcode lines: 5
- Microcode:

```text
czyt wys wei il;
wyak weja werb start;
wyak wes weja ode weak;
@wait wyg weja ode weak IF Z THEN @done ELSE @wait;
@done wys weja przep weak wyl wea;
```

## MAS

- Args: 1
- Description (pl): Rozkaz maskowania - ustaw maskę RM = argument instrukcji (adresowanie bezpośrednie)
- Description (en): Masking instruction - set RM mask = instruction argument (direct addressing)
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad sa werm;
wyl wea;
```

## MSK

- Args: 1
- Description (pl): Rozkaz maskowania adresowanie bezpośrednie
- Description (en): Masking instruction (direct addressing)
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
wyad wea;
czyt wys werm;
wyl wea;
```

## CZM

- Args: 1
- Description (pl): Wyczyść bit w rejestrze maski (odblokuj przerwanie)
- Description (en): Clear bit in mask register (unblock interrupt)
- Microcode lines: 3
- Microcode:

```text
czyt wys wei il;
wyad czrm;
wyl wea;
```

## WPR2

- Args: 1
- Description (pl): Wczytanie znaku z urządzenia zewnętrznego o numerze podanym jako argument
- Description (en): Read a character from an external device with number given as argument
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
start wyak weja ode weak;
@wait wyg weja ode weak IF Z THEN @done ELSE @wait;
@done wyrb weja przep weak wyl wea;
```

## WYP2

- Args: 1
- Description (pl): Wypisanie znaku znajdującego się w akumulatorze na urządzenie zewnętrzne o numerze podanym jako argument
- Description (en): Output the character in the accumulator to an external device with number given as argument
- Microcode lines: 4
- Microcode:

```text
czyt wys wei il;
wyak weja ode weak wes werb start;
@wait wyg weja ode weak IF Z THEN @done ELSE @wait;
@done wys weja przep weak wyl wea;
```
