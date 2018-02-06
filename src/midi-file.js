import { times } from 'ramda'
import { MidiTrack } from './midi-track'

export function isEof(data, offset) {
	return offset >= data.byteLength
}

export function getString(data, offset, length) {
	return times(i => String.fromCharCode(data.getUint8(offset + i)), length).join('')
}

export function isNewTrack(data, offset) {
	return 'MTrk' === getString(data, offset, 4)
}

export function getBytes(data, offset, length) {
	return times(i => data.getUint8(offset + i), length)
}

export function MidiFile(data) {
	const header = {
		type: getString(data, 0, 4),
		length: data.getUint32(4),
		format: data.getUint16(8),
		tracks: data.getUint16(10),
		division: data.getUint16(12),
		next: 14,
	}
	if ('MThd' !== header.type) {
		throw new Error('Bad MIDI file format')
	}

	let offset = header.next

	const tracks = times(() => {
		const track = MidiTrack(data, offset)
		offset += (track.length + 8) // track data length + track header length
		return track
	}, header.tracks)

	return Object.assign({ tracks }, { header })
}
