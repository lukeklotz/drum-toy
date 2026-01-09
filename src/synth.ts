import * as Tone from 'tone';

export class FMSynth {
    private carrier: Tone.Oscillator;
    private modSpeed: Tone.Oscillator;
    private modDepth: Tone.Gain;
    private envelope: Tone.AmplitudeEnvelope;
    private started: boolean = false;
    protected isOn = false;
    protected isTriggered = false;
    
    constructor() {
        this.modSpeed = new Tone.Oscillator(100, 'sine');    
        this.modDepth = new Tone.Gain(100); 
        this.carrier  = new Tone.Oscillator(440, 'sine'); 
        this.envelope = new Tone.AmplitudeEnvelope({
            attack: 0.01,
            decay: 0.2,
            sustain: 0.3,
            release: 0.1 
        });
        
        this.modSpeed.connect(this.modDepth);
        this.modDepth.connect(this.carrier.frequency); 
        this.carrier.connect(this.envelope);
        this.envelope.toDestination();
        
    }

    private ensureStarted() {
        if (!this.started) {
            this.modSpeed.start();
            this.carrier.start();
            this.started = true;
        }
    }
    
    triggerAttackRelease(duration: string) {
        this.ensureStarted();
        this.envelope.triggerAttackRelease(duration);
    }

    //changes speed of carrier frequency
    setModSpeed(amount: number){
        this.modSpeed.frequency.value = amount;
    }
    
    //changes amount of carrier frequency
    //was modulation
    setModDepth(amount: number) {
        this.modDepth.gain.value = amount;
    }
   
    //carrier frequency
    setFrequency(freq: number) {
        this.carrier.frequency.value = freq;
    }
}


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Grid {
    private synths: FMSynth[] = [];
    private numberOfColumns: number = 8;
    private buttons: HTMLButtonElement[] = [];
    private isOnStates: boolean[] = [];
    private tempo: number = 100; // milliseconds per step

    constructor() {
        // Make sure this loop runs and creates synths
        for (let i = 0; i < this.numberOfColumns; i++) {
            this.synths[i] = new FMSynth(); // Use [i] = instead of push
            this.isOnStates[i] = false;
        }
        console.log('Synths created:', this.synths.length); // Debug line
    }

    //generate visual component of the grid and attach event listeners to buttons
    //also set the synth parameters based on the input values
    displayGrid(modAmt: number, freqAmt: number, modulatorAmt: number) {
        const gridContainerDiv = document.getElementById("grid-container") as HTMLDivElement;
        const gridDiv = document.createElement("div");
        gridDiv.className = "grid";

        for (let i = 0; i < this.numberOfColumns; i++) {
            this.synths[i].setModSpeed(modulatorAmt)
            this.synths[i].setModDepth(modAmt);
            this.synths[i].setFrequency(freqAmt);
            const button = document.createElement("button");
            this.buttons[i] = button;
            button.addEventListener("click", async () => {
                this.isOnStates[i] = !this.isOnStates[i];

                // Update button color based on state (on or off)
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
        
        const modAmountDial = this.createDial("Speed", modAmt, 0, 2000, (value) => {
            this.synths.forEach(synth => synth.setModSpeed(value));
        });
        const freqAmountDial = this.createDial("Freq", freqAmt, 1, 2000, (value) => {
            this.synths.forEach(synth => synth.setFrequency(value));
        });
        const modulationAmountDial = this.createDial("Depth", modulatorAmt, 0, 2000, (value) => {
            this.synths.forEach(synth => synth.setModDepth(value));
        });


        dialContainer.appendChild(modAmountDial);
        dialContainer.appendChild(freqAmountDial);
        dialContainer.appendChild(modulationAmountDial);
        gridDiv.appendChild(dialContainer);
        gridContainerDiv.appendChild(gridDiv);
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
/*
    //update modulator speed for all instances in the row
    setModSpeedAmt(amount: number) {
        this.synths.forEach(synth => synth.setModSpeed(amount));
    }

    //update mod depth for all instances in the row 
    setModDepthAmt(amount: number) {
        this.synths.forEach(synth => synth.setModDepth(amount));
    }

    //udpate frequency amount for all instances in the row
    setFrequencyAmt(amount: number) {
        this.synths.forEach(synth => synth.setFrequency(amount));
    } 
*/
    //update tempo
    setTempo(newTempo: number) {
        this.tempo = newTempo;
    }

    //listener for slider to adjust modularation amount in real-time
    setModDepthListener(sliderId: string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        slider.addEventListener("input", () => {
            const modAmt = parseFloat(slider.value);
            this.synths.forEach(synth => synth.setModDepth(modAmt));
            console.log(`Modulation amount set to ${modAmt}`);
        });
    }
    //listener for slider to adjust frequency amount in real-time
    setFrequencyListener(sliderId: string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        slider.addEventListener("input", () => {
            const freqAmt = parseFloat(slider.value);
            this.synths.forEach(synth => synth.setFrequency(freqAmt));
            console.log(`Frequency amount set to ${freqAmt}`);
        });
    }

    //listener for slider to adjust modulator amount in real-time
    setModSpeedListener(sliderId: string) {
        const slider = document.getElementById(sliderId) as HTMLInputElement;
        slider.addEventListener("input", () => {
            const modulatorAmt = parseFloat(slider.value);
            this.synths.forEach(synth => synth.setModSpeed(modulatorAmt));
            console.log(`Modulator amount set to ${modulatorAmt}`);
        });
    }
    
    //listener for adjusting tempo
    setTempoListener(paramId: string){
        const param = document.getElementById(paramId) as HTMLInputElement;
        param.addEventListener("input", () => {
            const newTempo = parseFloat(param.value)
            this.setTempo(newTempo);
            console.log(`Tempo set to ${newTempo}`);
        });
    }

    async playGrid() {
        let i = 0;
        while(true) {
            await sleep(this.tempo); 
            
            // Highlight current column
            this.buttons.forEach((btn, idx) => {
                if (idx === i) {
                    btn.style.border = '1px solid black';
                } else {
                    btn.style.border= '1px solid transparent';
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
