package main

import "testing"

func TestOptionsFromMapDefaultsAudioConversionWithoutChangingMaxClients(t *testing.T) {
	options := NewOptions()
	options.FromMap(map[string]any{"maxClients": float64(42)})

	if options.AudioConversion != defaults.options.audioConversion {
		t.Fatalf("AudioConversion = %d, want default %d", options.AudioConversion, defaults.options.audioConversion)
	}
	if options.MaxClients != 42 {
		t.Fatalf("MaxClients = %d, want 42", options.MaxClients)
	}
}

func TestOptionsAudioConversionFromMapAcceptsAllModes(t *testing.T) {
	for _, mode := range []uint{
		AUDIO_CONVERSION_DISABLED,
		AUDIO_CONVERSION_ENABLED,
		AUDIO_CONVERSION_ENABLED_NORM,
		AUDIO_CONVERSION_ENABLED_LOUD_NORM,
	} {
		options := NewOptions()
		options.FromMap(map[string]any{"audioConversion": float64(mode)})

		if options.AudioConversion != mode {
			t.Errorf("AudioConversion = %d for input %d, want %d", options.AudioConversion, mode, mode)
		}
	}
}

func TestOptionsAudioConversionWriteReadRoundTrip(t *testing.T) {
	controller := newUnitIngestController(t)

	for _, mode := range []uint{
		AUDIO_CONVERSION_DISABLED,
		AUDIO_CONVERSION_ENABLED,
		AUDIO_CONVERSION_ENABLED_NORM,
		AUDIO_CONVERSION_ENABLED_LOUD_NORM,
	} {
		controller.Options.AudioConversion = mode
		if err := controller.Options.Write(controller.Database); err != nil {
			t.Fatalf("Write(%d): %v", mode, err)
		}

		readOptions := NewOptions()
		if err := readOptions.Read(controller.Database); err != nil {
			t.Fatalf("Read(%d): %v", mode, err)
		}
		if readOptions.AudioConversion != mode {
			t.Errorf("round trip = %d for mode %d, want %d", readOptions.AudioConversion, mode, mode)
		}
	}
}
