import * as Tone from 'tone';


export class CustomFMSynth {
    private carrier: Tone.Oscillator;
    private modulator: Tone.Oscillator;
    private modulationIndex: Tone.Gain;
    private envelope: Tone.AmplitudeEnvelope;
    private started: boolean = false;
    protected isOn = false;
    protected isTriggered = false;
    
    constructor() {
        // Modulator oscillator
        this.modulator = new Tone.Oscillator(100, 'sine');
        
        // Modulation amount
        this.modulationIndex = new Tone.Gain(100);
        
        // Carrier oscillator
        this.carrier = new Tone.Oscillator(440, 'sine');
        
        // Amplitude envelope
        this.envelope = new Tone.AmplitudeEnvelope({
            attack: 0.01,
            decay: 0.2,
            sustain: 0.3,
            release: 0.1
        });
        
        // Route: Modulator -> Gain -> Carrier frequency
        this.modulator.connect(this.modulationIndex);
        this.modulationIndex.connect(this.carrier.frequency);
        
        // Carrier -> Envelope -> Destination
        this.carrier.connect(this.envelope);
        this.envelope.toDestination();
        
    }

    private ensureStarted() {
        if (!this.started) {
            this.modulator.start();
            this.carrier.start();
            this.started = true;
        }
    }
    
    triggerAttackRelease(duration: string) {
        this.ensureStarted();
        this.envelope.triggerAttackRelease(duration);
    }

    setModulator(amount: number){
        this.modulator.frequency.value = amount;
    }
    
    setModulation(amount: number) {
        this.modulationIndex.gain.value = amount;
    }
    
    setFrequency(freq: number) {
        this.carrier.frequency.value = freq;
    }
}


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Grid {
    private synths: CustomFMSynth[] = [];
    private numberOfColumns: number = 8;
    private buttons: HTMLButtonElement[] = [];
    private isOnStates: boolean[] = [];
    private rate: number = 100; // milliseconds per step

    constructor() {
        // Make sure this loop runs and creates synths
        for (let i = 0; i < this.numberOfColumns; i++) {
            this.synths[i] = new CustomFMSynth(); // Use [i] = instead of push
            this.isOnStates[i] = false;
        }
        console.log('Synths created:', this.synths.length); // Debug line
    }

    //generate visual component of the grid and attach event listeners to buttons
    //also set the synth parameters based on the input values
    displayGrid(modAmt: number, freqAmt: number, modulatorAmt: number) {
        const appDiv = document.getElementById("app") as HTMLDivElement;
        const gridDiv = document.createElement("div");
        gridDiv.className = "grid";

        for (let i = 0; i < this.numberOfColumns; i++) {
            this.synths[i].setModulation(modAmt);
            this.synths[i].setFrequency(freqAmt);
            this.synths[i].setModulator(modulatorAmt)
            const button = document.createElement("button");
            this.buttons[i] = button;
            button.addEventListener("click", async () => {
                this.isOnStates[i] = !this.isOnStates[i];
                //display the button state
                console.log(`Button ${i + 1} is now ${this.isOnStates[i] ? "ON" : "OFF"}`);

                // Visual feedback
                if (this.isOnStates[i]) {
                    button.style.backgroundColor = '#4ade80'; // Green when ON
                } else {
                    button.style.backgroundColor = ''; // Default when OFF
                }

            });
            
            gridDiv.appendChild(button);
        }
        // Add circular dial at the end
        const dialContainer = document.createElement("div");
        dialContainer.className = "dial-container";
        
        const modAmountDial = this.createDial("Mod", modAmt, 0, 2000, (value) => {
            this.setModulationAmt(value);
        });
        const freqAmountDial = this.createDial("Freq", freqAmt, 1, 2000, (value) => {
            this.setFrequencyAmt(value);
        });
        const modulationAmountDial = this.createDial("Modulator", modulatorAmt, 0, 2000, (value) => {
            this.setModulatorAmt(value);
        });
        dialContainer.appendChild(modAmountDial);
        dialContainer.appendChild(freqAmountDial);
        dialContainer.appendChild(modulationAmountDial);
        gridDiv.appendChild(dialContainer);

        appDiv.appendChild(gridDiv);
    }

    // Create circular dial/knob
private createDial(labelText: string, initialValue: number, min: number, max: number, onChange: (value: number) => void): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "knob-container";
    
    const knob = document.createElement("div");
    knob.className = "knob";
    
    const indicator = document.createElement("div");
    indicator.className = "knob-indicator";
    knob.appendChild(indicator);
    
    const label = document.createElement("label");
    label.className = "knob-label";
    label.textContent = labelText;
    
    const valueDisplay = document.createElement("div");
    valueDisplay.className = "knob-value";
    valueDisplay.textContent = initialValue.toFixed(0);
    
    let isDragging = false;
    let startY = 0;
    let startValue = initialValue;
    
    const updateKnob = (value: number) => {
        const normalizedValue = (value - min) / (max - min);
        const rotation = normalizedValue * 270 - 135; // -135° to 135° (270° total)
        indicator.style.transform = `rotate(${rotation}deg)`;
        valueDisplay.textContent = value.toFixed(0);
        onChange(value);
    };
    
    updateKnob(initialValue);
    
    knob.addEventListener("mousedown", (e) => {
        isDragging = true;
        startY = e.clientY;
        startValue = parseFloat(valueDisplay.textContent!);
        knob.style.cursor = "grabbing";
    });
    
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        
        const deltaY = startY - e.clientY;
        const sensitivity = 0.5;
        const range = max - min;
        const newValue = Math.max(min, Math.min(max, startValue + (deltaY * sensitivity * range / 100)));
        
        updateKnob(newValue);
    });
    
    document.addEventListener("mouseup", () => {
        isDragging = false;
        knob.style.cursor = "grab";
    });
    
    container.appendChild(label);
    container.appendChild(knob);
    container.appendChild(valueDisplay);
    
    return container;
}

    //update modulation amount for all instances in the row 
    setModulationAmt(amount: number) {
        this.synths.forEach(synth => synth.setModulation(amount));
    }

    //udpate frequency amount for all instances in the row
    setFrequencyAmt(amount: number) {
        this.synths.forEach(synth => synth.setFrequency(amount));
    }

    //update modulator amount for all instances in the row
    setModulatorAmt(amount: number) {
        this.synths.forEach(synth => synth.setModulator(amount));
    }

    //listener for slider to adjust modularation amount in real-time
    setModulationListener(sliderId: string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        slider.addEventListener("input", () => {
            const modAmt = parseFloat(slider.value);
            this.setModulationAmt(modAmt);
            console.log(`Modulation amount set to ${modAmt}`);
        });
    }
    //listener for slider to adjust frequency amount in real-time
    setFrequencyListener(sliderId: string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        slider.addEventListener("input", () => {
            const freqAmt = parseFloat(slider.value);
            this.setFrequencyAmt(freqAmt);
            console.log(`Frequency amount set to ${freqAmt}`);
        });
    }

    //listener for slider to adjust modulator amount in real-time
    setModulatorListener(sliderId: string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        slider.addEventListener("input", () => {
            const modulatorAmt = parseFloat(slider.value);
            this.setModulatorAmt(modulatorAmt);
            console.log(`Modulator amount set to ${modulatorAmt}`);
        });
    }

    async playGrid() {
        let i = 0;
        while(true) {
            await sleep(this.rate); 
            
            // Highlight current column
            this.buttons.forEach((btn, idx) => {
                if (idx === i) {
                    btn.style.border = '3px solid black';
                } else {
                    btn.style.border = '';
                }
            });
            
            // Play if this button is ON
            if (this.isOnStates[i]) {
                console.log(`Button ${i + 1} is ON - playing`);
                await Tone.start();
                this.synths[i].triggerAttackRelease("16n");
            }
            
            // Move to next column
            if(i < this.numberOfColumns - 1) {
                i++;
            } else {
                i = 0;
            }
        }
    }
}