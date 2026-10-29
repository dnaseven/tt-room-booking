import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, createLocalStorageBookingRepository } from '../local-storage-booking.repository'
import { makeRepository, makeStorage } from './helpers'

const DATE = '2026-10-30'
const OTHER_DATE = '2026-10-31'

describe('local storage booking repository', () => {
  describe('create', () => {
    it('returns the booking with a generated id', async () => {
      const repository = makeRepository()

      const booking = await repository.create({ date: DATE, start: '11:00', end: '12:00', title: 'sync' })

      expect(booking).toEqual({ id: 'id-1', date: DATE, start: '11:00', end: '12:00', title: 'sync' })
    })

    it('generates a distinct id for each booking', async () => {
      const repository = makeRepository()

      const first = await repository.create({ date: DATE, start: '11:00', end: '12:00' })
      const second = await repository.create({ date: DATE, start: '13:00', end: '14:00' })

      expect(first.id).not.toBe(second.id)
    })

    it('survives a reload: a new repository on the same storage sees the booking', async () => {
      const storage = makeStorage()
      const booking = await makeRepository(storage).create({ date: DATE, start: '11:00', end: '12:00' })

      expect(await makeRepository(storage).getById(booking.id)).toEqual(booking)
    })
  })

  describe('getById', () => {
    it('returns the booking', async () => {
      const repository = makeRepository()
      const booking = await repository.create({ date: DATE, start: '11:00', end: '12:00' })

      expect(await repository.getById(booking.id)).toEqual(booking)
    })

    it('returns undefined for an unknown id', async () => {
      expect(await makeRepository().getById('missing')).toBeUndefined()
    })
  })

  describe('listByDate', () => {
    it('returns an empty list when nothing is stored', async () => {
      expect(await makeRepository().listByDate(DATE)).toEqual([])
    })

    it('returns only bookings of the requested date', async () => {
      const repository = makeRepository()
      const onDate = await repository.create({ date: DATE, start: '11:00', end: '12:00' })
      await repository.create({ date: OTHER_DATE, start: '11:00', end: '12:00' })

      expect(await repository.listByDate(DATE)).toEqual([onDate])
    })
  })

  describe('update', () => {
    it('merges the patch, persists it and returns the result', async () => {
      const repository = makeRepository()
      const booking = await repository.create({ date: DATE, start: '11:00', end: '12:00', title: 'sync' })

      const updated = await repository.update(booking.id, { start: '13:00', end: '14:00' })

      expect(updated).toEqual({ ...booking, start: '13:00', end: '14:00' })
      expect(await repository.getById(booking.id)).toEqual(updated)
    })

    it('leaves other bookings untouched', async () => {
      const repository = makeRepository()
      const booking = await repository.create({ date: DATE, start: '11:00', end: '12:00' })
      const other = await repository.create({ date: DATE, start: '13:00', end: '14:00' })

      await repository.update(booking.id, { title: 'retro' })

      expect(await repository.getById(other.id)).toEqual(other)
    })
  })

  describe('remove', () => {
    it('removes the booking and keeps the others', async () => {
      const repository = makeRepository()
      const booking = await repository.create({ date: DATE, start: '11:00', end: '12:00' })
      const other = await repository.create({ date: DATE, start: '13:00', end: '14:00' })

      await repository.remove(booking.id)

      expect(await repository.getById(booking.id)).toBeUndefined()
      expect(await repository.listByDate(DATE)).toEqual([other])
    })
  })

  describe('corrupted storage', () => {
    it('treats invalid JSON as an empty list', async () => {
      const storage = makeStorage()
      storage.setItem(STORAGE_KEY, '{not json')

      expect(await makeRepository(storage).listByDate(DATE)).toEqual([])
    })

    it('drops entries that do not match the booking schema', async () => {
      const storage = makeStorage()
      const valid = { id: 'ok', date: DATE, start: '11:00', end: '12:00' }
      storage.setItem(STORAGE_KEY, JSON.stringify([valid, { id: 'bad', date: DATE, start: '9:00', end: 5 }]))

      expect(await makeRepository(storage).listByDate(DATE)).toEqual([valid])
    })

    it('keeps working after the storage was corrupted', async () => {
      const storage = makeStorage()
      storage.setItem(STORAGE_KEY, '{not json')
      const repository = createLocalStorageBookingRepository({ storage, generateId: () => 'new' })

      const booking = await repository.create({ date: DATE, start: '11:00', end: '12:00' })

      expect(await repository.getById(booking.id)).toEqual(booking)
    })
  })
})
