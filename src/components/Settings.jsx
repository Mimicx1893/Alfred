import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../store/useStore';
import { useVoice } from '../hooks/useVoice';

const models = [
  'openrouter/free',
  'anthropic/claude-sonnet-4',
  'openai/gpt-4o',
  'google/gemini-pro',
];

const DEMO_TEXT = 'Hello, I am Alfred. How can I assist you today?';
const BRITISH_MALE_PRESETS = [
  'Microsoft David',
  'Microsoft Mark',
  'Google UK English Male',
  'Apple Daniel',
];

function isBritishMale(voice) {
  const name = (voice.name || '').toLowerCase();
  const lang = (voice.lang || '').toLowerCase();
  const isBritish = lang.startsWith('en-gb') || lang.includes('gb') || lang.includes('uk') || name.includes('british') || name.includes('uk');
  const isMale = name.includes('male') || name.includes('david') || name.includes('mark') || name.includes('daniel') || name.includes('james');
  return isBritish && isMale;
}

function Settings() {
  const { alfredModel, setAlfredModel, voiceEnabled, setVoiceEnabled, alfredVoice, setAlfredVoice, voiceRate, setVoiceRate, voicePitch, setVoicePitch, voices, setVoices } = useStore();
  const { voices: hookVoices, speak, isSpeaking, cancelSpeech } = useVoice();

  const safeVoices = Array.isArray(voices) ? voices : [];
  const [previewingName, setPreviewingName] = useState(null);
  const [customText, setCustomText] = useState(DEMO_TEXT);
  const [showBritishOnly, setShowBritishOnly] = useState(false);

  const britishMaleVoices = safeVoices.filter(isBritishMale);
  const displayVoices = showBritishOnly ? britishMaleVoices : safeVoices;

  useEffect(() => {
    const sourceVoices = Array.isArray(hookVoices) ? hookVoices : [];
    if (sourceVoices.length > 0 && sourceVoices !== safeVoices) {
      setVoices(sourceVoices);
    }
  }, [hookVoices, safeVoices, setVoices]);

  const handlePreview = useCallback(async (voiceName) => {
    if (!window.speechSynthesis) return;
    cancelSpeech();
    setPreviewingName(voiceName);
    try {
      await speak(customText || DEMO_TEXT, voiceName, voiceRate, voicePitch);
    } catch (e) {
      console.error('Preview error:', e);
    } finally {
      setPreviewingName(null);
    }
  }, [customText, voiceRate, voicePitch, speak, cancelSpeech]);

  const handleStopPreview = useCallback(() => {
    cancelSpeech();
    setPreviewingName(null);
  }, [cancelSpeech]);

  const handlePresetBritishMale = useCallback(() => {
    const preset = britishMaleVoices.find(v => BRITISH_MALE_PRESETS.includes(v.name)) || britishMaleVoices[0];
    if (preset) {
      setAlfredVoice(preset.name);
    }
  }, [britishMaleVoices, setAlfredVoice]);

  const validCurrentVoice = safeVoices.some(v => v.name === alfredVoice);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gotham-accent tracking-widest font-butler mb-1">SETTINGS</h2>
        <p className="text-gotham-muted text-xs">Configure Alfred and system preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gotham-panel border border-gotham-border rounded-lg p-5">
          <h3 className="text-gotham-text font-bold text-sm tracking-wider mb-4">MODEL CONFIGURATION</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gotham-muted text-xs mb-2 uppercase tracking-wider">AI Model</label>
              <select
                value={alfredModel}
                onChange={(e) => setAlfredModel(e.target.value)}
                className="w-full bg-gotham-dark border border-gotham-border rounded px-3 py-2 text-gotham-text text-sm focus:border-gotham-accent/50 outline-none"
              >
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gotham-panel border border-gotham-border rounded-lg p-5">
          <h3 className="text-gotham-text font-bold text-sm tracking-wider mb-4">VOICE SETTINGS</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gotham-text text-sm">Enable Voice</p>
                <p className="text-gotham-muted text-xs">Speech input and output</p>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceEnabled ? 'bg-gotham-accent' : 'bg-gotham-border'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${voiceEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <label className="block text-gotham-muted text-xs mb-2 uppercase tracking-wider">Preview Text</label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={2}
                className="w-full bg-gotham-dark border border-gotham-border rounded px-3 py-2 text-gotham-text text-sm focus:border-gotham-accent/50 outline-none resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gotham-muted text-xs uppercase tracking-wider">Available Voices</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePresetBritishMale}
                    className="text-xs border border-gotham-border text-gotham-muted rounded px-2 py-1 hover:text-gotham-text hover:border-gotham-accent/40 transition-colors"
                  >
                    Use British Male Preset
                  </button>
                  <button
                    onClick={() => setShowBritishOnly(!showBritishOnly)}
                    className={`text-xs border rounded px-2 py-1 transition-colors ${showBritishOnly ? 'border-gotham-accent/60 text-gotham-accent' : 'border-gotham-border text-gotham-muted hover:text-gotham-text hover:border-gotham-accent/40'
                      }`}
                  >
                    {showBritishOnly ? 'Showing British Male Only' : 'Filter British Male'}
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {displayVoices.length === 0 && (
                  <div className="text-gotham-muted text-xs py-3 text-center">
                    {safeVoices.length === 0 ? 'Loading voices...' : 'No British male voices detected on this device.'}
                  </div>
                )}
                {displayVoices.map((v) => {
                  const isSelected = alfredVoice === v.name;
                  const isPreviewing = previewingName === v.name;

                  return (
                    <div
                      key={v.name}
                      className={`flex items-center justify-between rounded border px-3 py-2 transition-colors ${isSelected ? 'border-gotham-accent/60 bg-gotham-dark' : 'border-gotham-border bg-gotham-dark/40'
                        }`}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="text-gotham-text text-sm truncate">{v.name}</div>
                        <div className="text-gotham-muted text-xs">{v.lang}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(v.name)}
                          disabled={isPreviewing}
                          className={`inline-flex items-center gap-1 border rounded px-2 py-1 text-xs transition-colors ${isPreviewing
                              ? 'border-gotham-accent/40 text-gotham-accent'
                              : 'border-gotham-border text-gotham-muted hover:text-gotham-text hover:border-gotham-accent/40'
                            }`}
                        >
                          {isPreviewing ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 animate-pulse">
                                <path d="M5.5 3.5a2 2 0 012-2h5a2 2 0 012 2v13a2 2 0 01-2 2h-5a2 2 0 01-2-2v-13z" />
                              </svg>
                              Playing
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                              Preview
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setAlfredVoice(v.name)}
                          className={`rounded px-2 py-1 text-xs border transition-colors ${isSelected
                              ? 'bg-gotham-accent/15 border-gotham-accent/60 text-gotham-accent'
                              : 'border-gotham-border text-gotham-muted hover:text-gotham-text hover:border-gotham-accent/40'
                            }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {previewingName && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gotham-muted text-xs">Now previewing: {previewingName}</span>
                  <button onClick={handleStopPreview} className="text-xs text-gotham-danger border border-gotham-danger/30 rounded px-2 py-1 hover:bg-gotham-danger/10 transition-colors">
                    Stop Preview
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gotham-muted text-xs mb-2 uppercase tracking-wider">Speech Rate: {voiceRate.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full accent-gotham-accent"
              />
            </div>

            <div>
              <label className="block text-gotham-muted text-xs mb-2 uppercase tracking-wider">Voice Pitch: {voicePitch.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-gotham-accent"
              />
            </div>
          </div>
        </div>

        <div className="bg-gotham-panel border border-gotham-border rounded-lg p-5">
          <h3 className="text-gotham-text font-bold text-sm tracking-wider mb-4">WINDOW CONTROLS</h3>
          <p className="text-gotham-muted text-xs mb-4">Alfred uses custom frameless chrome. Use the title bar or keyboard shortcuts to manage the window.</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.alfred?.minimizeWindow()}
              className="flex-1 bg-gotham-dark border border-gotham-border text-gotham-text text-xs py-2 rounded hover:border-gotham-accent/50 transition-colors"
            >
              Minimize
            </button>
            <button
              onClick={() => window.alfred?.maximizeWindow()}
              className="flex-1 bg-gotham-dark border border-gotham-border text-gotham-text text-xs py-2 rounded hover:border-gotham-accent/50 transition-colors"
            >
              Maximize
            </button>
            <button
              onClick={() => window.alfred?.closeWindow()}
              className="flex-1 bg-gotham-danger/10 border border-gotham-danger/30 text-gotham-danger text-xs py-2 rounded hover:bg-gotham-danger/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;