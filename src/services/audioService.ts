import {Injectable} from '@angular/core';
import {MidiMessage} from './midiService';
import {ISynthesizerParas} from "../components/synthesizer/synthesizer.component";
import {Synthesizer} from "./synthesizer";

Injectable();
export class AudioService {
    // variables
    static readonly waveType = {
        time: 'time',
        spectrum: 'spectrum'
    };

    public param: ISynthesizerParas;

    private ctx: AudioContext;
    private synthesizers: Map<number, Synthesizer>;

    public analyser: AnalyserNode;

    private static getFrequencyKey(msg: MidiMessage): number {
        return (msg.channelNo << 8) + msg.noteNo;
    }

    static getTimeWave(analyser: AnalyserNode): Uint8Array {
        let times = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(times);

        return times;
    }

    static getSpectrumsWave(analyser: AnalyserNode): Uint8Array {
        let spectrums = new Uint8Array(analyser.frequencyBinCount);  // Array size is 1024 (half of FFT size)
        analyser.getByteFrequencyData(spectrums);

        return spectrums;
    }

    static getWaveSource (type: string, analyser: AnalyserNode): Uint8Array {

        let source: Uint8Array;

        switch (type) {
            case AudioService.waveType.time:
                source = AudioService.getTimeWave(analyser);
                break;
            case AudioService.waveType.spectrum:
                source = AudioService.getSpectrumsWave(analyser);
                break;
        }

        return source;
    }

    constructor() {
        this.ctx = new AudioContext();
        this.synthesizers = new Map<number, Synthesizer>();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.connect(this.ctx.destination);

    }

    public audioOn(msg: MidiMessage) {

        let synthesizer: Synthesizer = new Synthesizer(this.ctx, this.param, this.analyser);

        synthesizer.down(this.ctx, msg);

        // let algorithm: Algorithm = this.createAlgorithm(msg);


        // let now = this.ctx.currentTime;

        // let m_attack = 0.7, m_decay = 1, m_sustain = 0.5;
        // let c_attack = 0, c_decay = 1, c_sustain = 0.3;

        // let modulatorRootValue = algorithm.modulatorGain.gain.value;  // Attackの目標値をセット
        // algorithm.modulatorGain.gain.cancelScheduledValues(0);      // スケジュールを全て解除
        // algorithm.modulatorGain.gain.setValueAtTime(0.0, now);      // 今時点を音の出始めとする
        // algorithm.modulatorGain.gain.linearRampToValueAtTime(modulatorRootValue, now + m_attack);
        // // ▲ rootValue0までm_attack秒かけて直線的に変化
        // algorithm.modulatorGain.gain.linearRampToValueAtTime(m_sustain * modulatorRootValue, now + m_attack + m_decay);
        // // ▲ m_sustain * modulatorRootValueまでm_attack+m_decay秒かけて直線的に変化
        //
        // let carrierRootValue = algorithm.carrierGain.gain.value;      // Attackの目標値をセット
        // algorithm.carrierGain.gain.cancelScheduledValues(0);        // スケジュールを全て解除
        // algorithm.carrierGain.gain.setValueAtTime(0.0, now);        // 今時点を音の出始めとする
        // algorithm.carrierGain.gain.linearRampToValueAtTime(carrierRootValue, now + c_attack);
        // // ▲ rootValue0までc_attack秒かけて直線的に変化
        // algorithm.carrierGain.gain.linearRampToValueAtTime(c_sustain * carrierRootValue, now + c_attack + c_decay);
        // // ▲ c_sustain * carrierRootValueまでc_attack+c_decay秒かけて直線的に変化

        this.synthesizers.set(AudioService.getFrequencyKey(msg), synthesizer);

        // algorithm.start(0);


    }

    public audioOff(msg: MidiMessage) {

        let synthesizer: Synthesizer = this.synthesizers.get(AudioService.getFrequencyKey(msg));
        if (!synthesizer) {
            return;
        }

        synthesizer.up(this.ctx, msg);

        // let now = this.ctx.currentTime;
        // let m_release = 0.5;
        // let c_release = 0.4;
        // let modulatorRootValue = algorithm.modulatorGain.gain.value;
        // algorithm.modulatorGain.gain.cancelScheduledValues(0);
        // algorithm.modulatorGain.gain.setValueAtTime(modulatorRootValue, now);
        // algorithm.modulatorGain.gain.linearRampToValueAtTime(modulatorRootValue, now);
        // algorithm.modulatorGain.gain.linearRampToValueAtTime(0.0, now + m_release);
        //
        // let carrierRootValue = algorithm.carrierGain.gain.value;
        // algorithm.carrierGain.gain.cancelScheduledValues(0);
        // algorithm.carrierGain.gain.setValueAtTime(carrierRootValue, now);
        // algorithm.carrierGain.gain.linearRampToValueAtTime(carrierRootValue, now);
        // algorithm.carrierGain.gain.linearRampToValueAtTime(0.0, now + c_release);

        // let release = m_release;
        // if (release < c_release) {
        //     release = c_release;
        // }
        //
        //
        // algorithm.stop(now + release);
    }

    // private createAlgorithm(msg: MidiMessage): Algorithm {
    //
    //     // let algorithm: Algorithm = new Algorithm(this.ctx);
    //     //
    //     // algorithm.modulator.connect(algorithm.analyser1);
    //     // algorithm.modulator.connect(algorithm.modulatorGain);
    //     // // algorithm.modulator.connect(algorithm.analyser1);
    //     // // algorithm.analyser1.connect(algorithm.modulatorGain);
    //     // algorithm.modulatorGain.connect(<AudioNode>algorithm.carrier.frequency);
    //     // algorithm.carrier.connect(algorithm.carrierGain);
    //     // algorithm.carrierGain.connect(this.analyser);
    //     // algorithm.modulator.connect(algorithm.feedbackGain);
    //     // // algorithm.carrier.connect(algorithm.analyser1);
    //     // // algorithm.analyser1.connect(algorithm.modulatorGain);
    //     // algorithm.feedbackGain.connect(<AudioNode>algorithm.modulator.frequency);
    //
    //     let presetList = {
    //         name: 'Elec.Piano1',
    //         freqRatio: [5, 10],
    //         feedback: 10,
    //
    //         outRatio: [90, 20]
    //     };
    //     // let freq = msg.frequency;
    //     // algorithm.modulator.frequency.value = presetList.freqRatio[1] * freq;
    //     // algorithm.carrier.frequency.value = presetList.freqRatio[0] * freq; // 音階を変える
    //     // algorithm.feedbackGain.gain.value = presetList.feedback;
    //     // algorithm.modulatorGain.gain.value = (presetList.outRatio[1] / 100) * freq * 8;
    //     // algorithm.carrierGain.gain.value = (presetList.outRatio[0] / 100);
    //
    //     return algorithm;
    //
    // }

}

// class Algorithm {
//     public modulator: OscillatorNode;
//     public carrier: OscillatorNode;
//     public modulatorGain: GainNode;
//     public carrierGain: GainNode;
//     public feedbackGain: GainNode;
//     public feedbackGain2: GainNode;
//     public analyser1: AnalyserNode;
//
//     constructor(ctx: AudioContext) {
//         this.modulator = ctx.createOscillator();
//         this.carrier = ctx.createOscillator();
//         this.modulatorGain = ctx.createGain();
//         this.carrierGain = ctx.createGain();
//         this.feedbackGain = ctx.createGain();
//         this.feedbackGain2 = ctx.createGain();
//         this.analyser1 = ctx.createAnalyser();
//
//     }
//
//     public start(when = 0): void {
//         this.modulator.start(when);
//         this.carrier.start(when);
//     }
//
//     public stop(when = 0): void {
//         this.modulator.stop(when);
//         this.carrier.stop(when);
//     }
// }


