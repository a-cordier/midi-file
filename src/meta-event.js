import { getBytes, getString, getVariableLengthQuantity } from './utils'

export const Meta = Object.freeze({
	SEQUENCE_NUMBER: 0x00,
	TEXT_EVENT: 0x01,
	COPYRIGHT_NOTICE: 0x02,
	SEQUENCE_NAME: 0x03,
	INSTRUMENT_NAME: 0x04,
	LYRIC: 0x05,
	MARKER: 0x06,
	CUE_POINT: 0x07,
	MIDI_CHANNEL_PREFIX: 0x20,
	END_OF_TRACK: 0x2F,
	SET_TEMPO: 0x51,
	SMPTE_OFFSET: 0x54,
	TIME_SIGNATURE: 0x58,
	KEY_SIGNATURE: 0x59,
	SPECIFIC: 0x7F,
})

export function InstrumentNameEvent(data, offset) {
	const length = getVariableLengthQuantity(data, offset)
	const text = getString(data, offset, length.value)
	return {
		type: Meta.INSTRUMENT_NAME,
		data: text,
		next: offset + length.value
	}
}

export function SpecificEvent(data, offset) { /* eslint-disable no-param-reassign */
	offset += 1
	const length = getVariableLengthQuantity(data, offset)
	offset = length.next
	const dataBytes = getBytes(data, offset, length.value)
	offset += length.value
	return {
		type: Meta.SPECIFIC,
		data: dataBytes,
		next: offset,
	}
}

export function SetTempoEvent(data, offset) { /* eslint-disable no-param-reassign, no-plusplus */
	offset += 2
	const t = (data.getUint8(offset++) << 16) +
		(data.getUint8(offset++) << 8) +
		(data.getUint8(offset))
	return {
		type: Meta.SET_TEMPO,
		value: (6 * 1E7) / t,
		next: offset + 1,
	}
}

export function EndOfTrackEvent(_, offset) {
	return {
		type: Meta.END_OF_TRACK,
		next: offset + 2,
	}
}

export function MetaEvent(data, offset) { /* eslint-disable no-param-reassign */
	offset += 1 // FF meta event marker
	const value = data.getUint8(offset) // event type
	switch (value) {
	case Meta.SET_TEMPO:
		return SetTempoEvent(data, offset)
	case Meta.END_OF_TRACK:
		return EndOfTrackEvent(data, offset)
	case Meta.INSTRUMENT_NAME:
		return InstrumentNameEvent(data, offset)
	default:
		return SpecificEvent(data, offset)
	}
}
