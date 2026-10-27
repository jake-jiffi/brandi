"use client"

import * as React from "react"

import { JOBS, type Job, type JobStatus } from "@/lib/sample"

/**
 * What a person changes while trying the example: the jobs' states, jobs they add, notifications they
 * have read and the morning summary. Held in memory for the visit, so every page agrees and a reload
 * starts the sample again. A real product keeps this on its server.
 */
interface ExampleState {
  jobs: Job[]
  read: string[]
  morningSummary: boolean
  /** The command menu asked for a new job: the jobs page opens its form and clears this. */
  newJob: boolean
}

const initial: ExampleState = { jobs: JOBS, read: [], morningSummary: false, newJob: false }
let state = initial
const listeners = new Set<() => void>()

function update(next: Partial<ExampleState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The example's state. The server and the first render in the browser both see the sample as it ships. */
export function useExample() {
  return React.useSyncExternalStore(
    subscribe,
    () => state,
    () => initial
  )
}

/** Moves jobs to a state and returns what each was before, for Undo. */
export function setJobStatus(ids: string[], status: JobStatus) {
  const before = new Map(state.jobs.filter((j) => ids.includes(j.id)).map((j) => [j.id, j.status]))
  update({ jobs: state.jobs.map((j) => (before.has(j.id) ? { ...j, status } : j)) })
  return before
}

/** Puts jobs back as they were. */
export function restoreJobStatus(before: Map<string, JobStatus>) {
  update({ jobs: state.jobs.map((j) => (before.has(j.id) ? { ...j, status: before.get(j.id) as JobStatus } : j)) })
}

/** The next free job number. */
export function nextJobId() {
  const top = Math.max(...state.jobs.map((j) => Number(j.id.replace(/\D/g, "")) || 0))
  return `J-${top + 1}`
}

export function addJob(job: Job) {
  update({ jobs: [job, ...state.jobs] })
}

export function removeJob(id: string) {
  update({ jobs: state.jobs.filter((j) => j.id !== id) })
}

export function markRead(ids: string[]) {
  update({ read: [...new Set([...state.read, ...ids])] })
}

export function setMorningSummary(on: boolean) {
  update({ morningSummary: on })
}

export function requestNewJob(asked = true) {
  update({ newJob: asked })
}
